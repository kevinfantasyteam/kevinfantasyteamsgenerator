"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { generateText } from "ai"

type Position = "WK" | "BAT" | "AL" | "BOWL"

type Player = {
  id?: string
  name: string
  position: Position
  credits: number | string
  team?: string
  selectedBy?: number | string
}

type MatchItem = {
  id: string
  title?: string
  team1?: string
  team2?: string
  date?: string
  time?: string
  team1Players?: Player[]
  team2Players?: Player[]
}

const POS_META: Array<{ key: Position; label: string; min: number; max: number }> = [
  { key: "WK", label: "Wicket Keeper", min: 0, max: 4 },
  { key: "BAT", label: "Batsman", min: 0, max: 6 },
  { key: "AL", label: "All-Rounder", min: 0, max: 6 },
  { key: "BOWL", label: "Bowler", min: 0, max: 7 },
]

// Helper: six-decimal formatting
function toSix(n: number) {
  return n.toFixed(6)
}

// Helper: normalize credits to number
function toNumCredit(c: number | string | undefined): number {
  if (typeof c === "number") return c
  if (!c) return 0
  const parsed = Number.parseFloat(String(c).replace(/[^\d.]/g, ""))
  return isFinite(parsed) ? parsed : 0
}

// Helper: 1/7 repeating pattern analyzer
function analyzeSeventhsPattern(value: number) {
  const patterns = ["142857", "285714", "428571", "571428", "714285", "857142"]
  const frac = Math.abs(value - Math.floor(value))
  const digits = Math.round(frac * 1e6)
    .toString()
    .padStart(6, "0") // 6 digits
  const idx = patterns.indexOf(digits)

  const hints: string[] = []
  // Half/Double quick hint by first two digits when it matches the classic pairs
  const firstTwo = digits.slice(0, 2) // '14','28','42','57','71','85'
  const pairs = ["14", "28", "42", "57", "71", "85"]
  const pairIdx = pairs.indexOf(firstTwo)
  if (pairIdx >= 0) {
    const base = "14"
    if (firstTwo === "28") hints.push("28 is double of 14 (≈ 2/7 pattern)")
    if (firstTwo === "42") hints.push("42 is triple of 14 (≈ 3/7 pattern)")
    if (firstTwo === "57") hints.push("57 is ~4x 14 (≈ 4/7 pattern)")
    if (firstTwo === "71") hints.push("71 is ~5x 14 (≈ 5/7 pattern)")
    if (firstTwo === "85") hints.push("85 is ~6x 14 (≈ 6/7 pattern)")
    if (firstTwo === "14") hints.push("14 is the base of the 1/7 pattern (≈ 1/7)")
  }

  if (idx >= 0) {
    return {
      matches: true,
      fractionMultiple: idx + 1, // 1..6 over 7
      digits,
      note: `Fraction matches ${idx + 1}/7 pattern (…${patterns[idx]}).`,
      hints,
    }
  }

  return {
    matches: false,
    fractionMultiple: null as number | null,
    digits,
    note: "No exact 1/7 repeating pattern detected in first 6 decimals.",
    hints,
  }
}

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get("matchId")

  const [match, setMatch] = useState<MatchItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  // position -> count to pick
  const [pickCounts, setPickCounts] = useState<Record<Position, number>>({
    WK: 1,
    BAT: 3,
    AL: 2,
    BOWL: 5,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("matches")
      if (!raw) {
        setError("No matches found. Please add a match in Admin.")
        return
      }
      const list: MatchItem[] = JSON.parse(raw)
      const m = list.find((x) => x.id === matchId)
      if (!m) {
        setError("Selected match not found. Go back and pick a match.")
        return
      }
      setMatch(m)
    } catch (e: any) {
      console.log("[v0] Research load error:", e?.message)
      setError("Failed to load match data. Please try again.")
    }
  }, [matchId])

  const generateAIAnalysis = async () => {
    if (!match) return
    setLoadingAnalysis(true)
    try {
      const allPlayers = [...(match.team1Players || []), ...(match.team2Players || [])]
      const playerSummary = allPlayers
        .map((p) => `${p.name} (${p.position}, ${toNumCredit(p.credits)} credits, ${p.selectedBy || 0}% selected)`)
        .join("\n")

      const prompt = `You are a cricket expert analyst. Analyze this Dream11 match and provide detailed predictions for each player:

Match: ${match.title || `${match.team1} vs ${match.team2}`}
Date: ${match.date || "N/A"}
Time: ${match.time || "N/A"}

Players:
${playerSummary}

For each player, provide:
1. Expected fantasy points (0-100 scale)
2. Predicted runs/wickets
3. Key performance factors
4. Risk assessment (Low/Medium/High)

Format your response as a detailed cricket analysis with player-by-player breakdown and match insights.`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
      })

      setAiAnalysis(text)
    } catch (e: any) {
      console.log("[v0] AI analysis error:", e?.message)
      setError("Failed to generate AI analysis. Please try again.")
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Flatten all players and bucket by position
  const byPosition = useMemo(() => {
    const buckets: Record<Position, Player[]> = { WK: [], BAT: [], AL: [], BOWL: [] }
    if (!match) return buckets
    const all = [...(match.team1Players || []), ...(match.team2Players || [])] as Player[]
    for (const p of all) {
      const pos = (p.position || "").toUpperCase() as Position
      if (pos && pos in buckets) {
        buckets[pos].push({ ...p, credits: toNumCredit(p.credits) })
      }
    }
    return buckets
  }, [match])

  // Averages per position (credits)
  const averages = useMemo(() => {
    const avg: Record<Position, number> = { WK: 0, BAT: 0, AL: 0, BOWL: 0 }
    for (const meta of POS_META) {
      const arr = byPosition[meta.key]
      if (arr.length) {
        const sum = arr.reduce((s, p) => s + toNumCredit(p.credits), 0)
        avg[meta.key] = sum / arr.length
      }
    }
    return avg
  }, [byPosition])

  const totals = useMemo(() => {
    const result: Record<Position, number> = { WK: 0, BAT: 0, AL: 0, BOWL: 0 }
    ;(Object.keys(averages) as Position[]).forEach((pos) => {
      result[pos] = averages[pos] * (pickCounts[pos] || 0)
    })
    return result
  }, [averages, pickCounts])

  const grandTotal = useMemo(() => {
    return (Object.values(totals) as number[]).reduce((a, b) => a + b, 0)
  }, [totals])

  if (error) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold mb-3">Research</h1>
          <p className="text-red-600">{error}</p>
          <button className="mt-4 px-4 py-2 rounded bg-purple-600 text-white" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </main>
    )
  }

  if (!match) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold mb-3">Research</h1>
          <p>Loading match data…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pretty">
              Research — {match.title || `${match.team1} vs ${match.team2}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              Position-wise averages with 6-decimal precision and 1/7 pattern insights
            </p>
          </div>
          <button className="px-4 py-2 rounded bg-purple-600 text-white" onClick={() => router.back()}>
            Back
          </button>
        </header>

        {/* Summary totals */}
        <section className="rounded-lg border p-4">
          <h2 className="text-lg font-medium mb-3">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(averages) as Position[]).map((pos) => {
              const avg = averages[pos]
              const patt = analyzeSeventhsPattern(avg)
              return (
                <div key={pos} className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{pos} Average (credits)</div>
                  <div className="text-lg font-semibold">{toSix(avg)}</div>
                  <div className="text-xs mt-1">
                    Pattern: {patt.matches ? `${patt.fractionMultiple}/7` : "—"} ({patt.digits})
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Per-position controls */}
        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Pick Counts & Totals</h2>
            <button
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() =>
                setPickCounts({
                  WK: 1,
                  BAT: 3,
                  AL: 2,
                  BOWL: 5,
                })
              }
            >
              Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POS_META.map(({ key, label, min, max }) => {
              const avg = averages[key]
              const count = pickCounts[key] ?? 0
              const est = totals[key]
              const patt = analyzeSeventhsPattern(est)
              return (
                <div key={key} className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                      <div className="text-xl font-semibold">{key}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Avg (credits)</div>
                      <div className="text-base font-medium">{toSix(avg)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-sm">Pick</label>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={count}
                      onChange={(e) =>
                        setPickCounts((s) => ({
                          ...s,
                          [key]: Math.max(min, Math.min(max, Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-24 rounded border px-2 py-1"
                    />
                    <span className="text-sm text-muted-foreground">players</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded bg-gray-50 p-3">
                      <div className="text-xs text-muted-foreground">Estimated Total Credits</div>
                      <div className="text-base font-semibold">{toSix(est)}</div>
                      <div className="text-xs mt-1">
                        Pattern: {patt.matches ? `${patt.fractionMultiple}/7` : "—"} ({patt.digits})
                      </div>
                      {patt.hints.length > 0 && (
                        <ul className="mt-1 text-xs list-disc pl-4">
                          {patt.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded border p-3">
                      <div className="text-xs text-muted-foreground">Players in {key}</div>
                      <div className="mt-2 max-h-40 overflow-auto text-sm">
                        {byPosition[key].length ? (
                          <ul className="space-y-1">
                            {byPosition[key].map((p, i) => (
                              <li key={p.id || `${p.name}-${i}`} className="flex items-center justify-between">
                                <span className="truncate">{p.name}</span>
                                <span className="text-muted-foreground ml-2">{toNumCredit(p.credits)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-muted-foreground">No players</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* AI Team Analysis section */}
        <section className="rounded-lg border p-4 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">🤖 AI Team Analysis & Research</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered predictions for player performance, expected points, and match insights
              </p>
            </div>
            <button
              onClick={generateAIAnalysis}
              disabled={loadingAnalysis}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingAnalysis ? "Analyzing..." : "Generate Analysis"}
            </button>
          </div>

          {aiAnalysis && (
            <div className="mt-4 rounded-md bg-white p-4 border border-purple-200">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{aiAnalysis}</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiAnalysis)
                  alert("Analysis copied to clipboard!")
                }}
                className="mt-4 px-3 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200"
              >
                Copy Analysis
              </button>
            </div>
          )}

          {!aiAnalysis && !loadingAnalysis && (
            <div className="mt-4 rounded-md bg-white p-4 border border-dashed border-purple-300 text-center text-muted-foreground">
              Click "Generate Analysis" to get AI-powered cricket predictions and player performance insights
            </div>
          )}
        </section>

        {/* Grand total and note */}
        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Grand Total (credits)</h3>
              <p className="text-sm text-muted-foreground">
                Sum of all estimated totals across positions with 6-decimal precision.
              </p>
            </div>
            <div className="text-2xl font-semibold">{toSix(grandTotal)}</div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Tip: If the decimal part matches 142857 (or rotations), it indicates a multiple of 1/7. You’ll see quick
            hints like “28 is double of 14 (≈ 2/7 pattern)”.
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded border"
            onClick={() => router.push(`/?matchId=${encodeURIComponent(match.id)}`)}
          >
            Home
          </button>
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white"
            onClick={() => router.push(`/player-selection?matchId=${encodeURIComponent(match.id)}`)}
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  )
}
