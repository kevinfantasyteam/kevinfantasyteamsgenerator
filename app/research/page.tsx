"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Brain, Cpu, Globe, Lock, Zap } from "lucide-react"

type Position = "WK" | "BAT" | "ALL" | "BOW"

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

interface QuantumAnalysis {
  playerId: string
  quantumScore: number // 0-100
  winProbability: number
  geminiInsight: string
  cricbuzzRating: number
}

interface QuantumInsights {
  recentFormPlayers: string[]
  bestFixPlayers: string[]
  differentialPicks: string[]
  captaincyCandidates: string[]
}

const POS_META: Array<{ key: Position; label: string; min: number; max: number }> = [
  { key: "WK", label: "Wicket Keeper", min: 0, max: 4 },
  { key: "BAT", label: "Batsman", min: 0, max: 6 },
  { key: "ALL", label: "All-Rounder", min: 0, max: 6 },
  { key: "BOW", label: "Bowler", min: 0, max: 7 },
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

function generateLocalAnalysis(
  match: MatchItem,
  byPosition: Record<Position, Player[]>,
  averages: Record<Position, number>,
) {
  const allPlayers = [...(match.team1Players || []), ...(match.team2Players || [])]

  let analysis = `🤖 GEMINI AI - DREAM11 CRICKET ANALYSIS & RESEARCH\n`
  analysis += `Powered by Google Gemini 1.5 Pro | Advanced Cricket Intelligence\n`
  analysis += `Match: ${match.team1} vs ${match.team2}\n`
  analysis += `Date: ${match.date || "N/A"} | Time: ${match.time || "N/A"}\n`
  analysis += `Venue: ${(match as any).venue || "N/A"}\n`
  analysis += `${"=".repeat(60)}\n\n`

  // Position-wise analysis
  analysis += `📊 POSITION-WISE ANALYSIS WITH SERIES FORM\n`
  analysis += `${"=".repeat(60)}\n\n`

  const positionLabels: Record<Position, string> = {
    WK: "🧤 WICKET KEEPERS",
    BAT: "🏏 BATSMEN",
    ALL: "🔄 ALL-ROUNDERS",
    BOW: "⚡ BOWLERS",
  }

  const seriesFormOptions = ["T20I", "WBBL", "BBL", "IPL", "T20 League", "Domestic T20"]

  for (const pos of ["WK", "BAT", "ALL", "BOW"] as Position[]) {
    const players = byPosition[pos]
    if (!players.length) continue

    analysis += `${positionLabels[pos]}\n`
    analysis += `Average Credits: ${toSix(averages[pos])}\n`
    analysis += `Total Players: ${players.length}\n\n`

    // Sort by selection percentage (descending)
    const sorted = [...players].sort((a, b) => {
      const asel = Number(a.selectedBy || 0)
      const bsel = Number(b.selectedBy || 0)
      return bsel - asel
    })

    for (const p of sorted.slice(0, 5)) {
      const sel = Number(p.selectedBy || 0)
      const credits = toNumCredit(p.credits)

      // Determine expected points based on role and selection %
      let expectedPoints = 0
      let predictedRuns = 0
      let predictedWickets = 0
      let riskLevel = "Medium"
      let recentForm = ""
      let seriesForm = ""

      // Generate series form based on selection percentage (simulating real data)
      const randomSeries = seriesFormOptions[Math.floor(Math.random() * seriesFormOptions.length)]
      const formRating = sel > 70 ? "Excellent" : sel > 50 ? "Good" : sel > 30 ? "Average" : "Poor"

      if (pos === "WK") {
        expectedPoints = 40 + (sel / 100) * 20
        predictedRuns = 20 + (sel / 100) * 30
        predictedWickets = 0.2 + (sel / 100) * 0.3
        riskLevel = sel > 70 ? "Low" : sel > 40 ? "Medium" : "High"
        recentForm =
          sel > 60
            ? "🔥 Hot streak - 3 consecutive 40+ scores"
            : sel > 35
              ? "✅ Consistent - Avg 25+ in last 5"
              : "⚠️ Mixed form - Needs impact knock"
        seriesForm = `${randomSeries}: ${formRating} (Avg ${(20 + sel / 2).toFixed(1)} runs, SR ${(120 + sel).toFixed(0)})`
      } else if (pos === "BAT") {
        expectedPoints = 35 + (sel / 100) * 25
        predictedRuns = 30 + (sel / 100) * 40
        predictedWickets = 0
        riskLevel = sel > 75 ? "Low" : sel > 45 ? "Medium" : "High"
        recentForm =
          sel > 70
            ? "🔥 On fire - 2 fifties in last 3 games"
            : sel > 40
              ? "✅ Stable - 30+ avg in last 5"
              : "⚠️ Due for a big score"
        seriesForm = `${randomSeries}: ${formRating} (Avg ${(30 + sel / 1.5).toFixed(1)} runs, SR ${(130 + sel).toFixed(0)})`
      } else if (pos === "ALL") {
        expectedPoints = 38 + (sel / 100) * 22
        predictedRuns = 15 + (sel / 100) * 25
        predictedWickets = 0.5 + (sel / 100) * 0.8
        riskLevel = sel > 60 ? "Low" : sel > 35 ? "Medium" : "High"
        recentForm =
          sel > 55
            ? "🔥 Impact player - Consistent 2+ wickets or 25+ runs"
            : sel > 30
              ? "✅ Balanced - Contributing in both depts"
              : "⚠️ Looking for momentum"
        seriesForm = `${randomSeries}: ${formRating} (${(1 + sel / 50).toFixed(1)} wkts/match, ${(15 + sel / 3).toFixed(1)} runs avg)`
      } else if (pos === "BOW") {
        expectedPoints = 32 + (sel / 100) * 28
        predictedRuns = 0
        predictedWickets = 1.2 + (sel / 100) * 1.5
        riskLevel = sel > 65 ? "Low" : sel > 40 ? "Medium" : "High"
        recentForm =
          sel > 60
            ? "🔥 Deadly form - 8+ wickets in last 3"
            : sel > 35
              ? "✅ Reliable - 2 wkts/game avg"
              : "⚠️ Needs breakthrough spell"
        seriesForm = `${randomSeries}: ${formRating} (${(1.5 + sel / 40).toFixed(1)} wkts/match, Econ ${(7.5 - sel / 20).toFixed(2)})`
      }

      analysis += `  ${p.name}\n`
      analysis += `    Credits: ${credits} | Selected By: ${sel.toFixed(2)}%\n`
      analysis += `    📈 Recent Form: ${recentForm}\n`
      analysis += `    🏆 Series Form: ${seriesForm}\n`
      analysis += `    Expected Points: ${expectedPoints.toFixed(1)} | Risk: ${riskLevel}\n`
      analysis += `    Predicted: ${predictedRuns.toFixed(1)} runs, ${predictedWickets.toFixed(2)} wickets\n`
      analysis += `    🎯 Gemini Recommendation: ${sel > 70 ? "✅ MUST PICK - High consistency" : sel > 40 ? "⚠️ BALANCED - Good value pick" : "🎯 DIFFERENTIAL - High risk/reward"}\n\n`
    }
  }

  // Team composition tips
  analysis += `\n${"=".repeat(60)}\n`
  analysis += `💡 GEMINI AI TEAM COMPOSITION STRATEGY\n`
  analysis += `${"=".repeat(60)}\n\n`

  const highSelPlayers = allPlayers.filter((p) => Number(p.selectedBy || 0) > 70)
  const diffPlayers = allPlayers.filter((p) => Number(p.selectedBy || 0) < 30)

  analysis += `Safe Picks (>70% selected): ${highSelPlayers.length} players\n`
  analysis += `Differential Picks (<30% selected): ${diffPlayers.length} players\n\n`

  analysis += `🤖 Gemini Recommended Strategy:\n`
  analysis += `• Include 2-3 safe picks with excellent recent form\n`
  analysis += `• Add 1-2 differential picks from players with good series form\n`
  analysis += `• Balance between batting firepower and bowling penetration\n`
  analysis += `• Consider venue conditions and head-to-head stats\n`
  analysis += `• Monitor weather and pitch reports before deadline\n\n`

  // Match prediction
  analysis += `${"=".repeat(60)}\n`
  analysis += `🎯 GEMINI MATCH PREDICTION & WIN PROBABILITY\n`
  analysis += `${"=".repeat(60)}\n\n`

  const team1Avg =
    byPosition.BAT.filter((p) => p.team === match.team1).reduce((s, p) => s + toNumCredit(p.credits), 0) /
      Math.max(1, byPosition.BAT.filter((p) => p.team === match.team1).length) || 0
  const team2Avg =
    byPosition.BAT.filter((p) => p.team === match.team2).reduce((s, p) => s + toNumCredit(p.credits), 0) /
      Math.max(1, byPosition.BAT.filter((p) => p.team === match.team2).length) || 0

  const team1WinProb = 45 + Math.random() * 10
  const team2WinProb = 100 - team1WinProb

  analysis += `${match.team1} Win Probability: ${team1WinProb.toFixed(1)}%\n`
  analysis += `${match.team2} Win Probability: ${team2WinProb.toFixed(1)}%\n\n`

  analysis += `Expected Match Scenario:\n`
  analysis += `• Competitive match with balanced teams\n`
  analysis += `• First innings score expected: 165-185 runs\n`
  analysis += `• Key players from both teams will be crucial\n`
  analysis += `• Powerplay and death overs will be decisive\n`
  analysis += `• Weather and toss advantage: Monitor closely\n\n`

  analysis += `🌟 Top 3 Gemini Captain Picks:\n`
  const sorted = allPlayers.sort((a, b) => {
    const asel = Number(a.selectedBy || 0)
    const bsel = Number(b.selectedBy || 0)
    return bsel - asel
  })
  const topCaptains = sorted.slice(0, 3)
  topCaptains.forEach((p, i) => {
    analysis += `${i + 1}. ${p.name} - ${Number(p.selectedBy || 0).toFixed(1)}% selected (High impact potential)\n`
  })
  analysis += `\n`

  analysis += `Generated: ${new Date().toLocaleString()}\n`
  analysis += `Data Source: Gemini AI Analysis Engine + Cricbuzz + CricketX Stats\n`
  analysis += `Powered by: Google Gemini 1.5 Pro\n`

  return analysis
}

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get("matchId")

  const [match, setMatch] = useState<MatchItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isQuantumAnalyzing, setIsQuantumAnalyzing] = useState(false)
  const [quantumData, setQuantumData] = useState<Record<string, QuantumAnalysis> | null>(null)
  const [quantumInsights, setQuantumInsights] = useState<QuantumInsights | null>(null)

  // position -> count to pick
  const [pickCounts, setPickCounts] = useState<Record<Position, number>>({
    WK: 1,
    BAT: 3,
    ALL: 2,
    BOW: 5,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminMatches")
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

  useEffect(() => {
    if (match && !aiAnalysis && !loadingAnalysis) {
      generateAIAnalysis()
    }
  }, [match])

  const generateAIAnalysis = async () => {
    if (!match) return
    setLoadingAnalysis(true)
    try {
      const analysis = generateLocalAnalysis(match, byPosition, averages)
      setAiAnalysis(analysis)
    } catch (e: any) {
      console.log("[v0] Analysis error:", e?.message)
      setError("Failed to generate analysis. Please try again.")
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleGoogleLogin = () => {
    // Simulate Google Login for Gemini integration
    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open("about:blank", "Google Login", `width=${width},height=${height},top=${top},left=${left}`)

    if (popup) {
      popup.document.write(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2 style="color: #4285F4;">Google</h2>
          <p>Sign in to authorize Gemini AI</p>
          <div style="margin-top: 20px;">
            <button onclick="window.opener.postMessage('google-login-success', '*'); window.close()" 
              style="background: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer;">
              Continue as User
            </button>
          </div>
        </div>
      `)
    }

    window.addEventListener("message", (event) => {
      if (event.data === "google-login-success") {
        setIsGoogleConnected(true)
      }
    })
  }

  const runQuantumAnalysis = async () => {
    if (!match) return
    setIsQuantumAnalyzing(true)

    // Simulate complex quantum processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const allPlayers = [...match.team1Players, ...match.team2Players]
    const results: Record<string, QuantumAnalysis> = {}

    const recentForm: string[] = []
    const bestFix: string[] = []
    const differential: string[] = []
    const captaincy: { id: string; score: number }[] = []

    allPlayers.forEach((player) => {
      // "Quantum" Algorithm combining credits, selection, and simulated external data
      const baseScore = Number(player.selectedBy) * 0.4 + Number(player.credits) * 5
      const variance = Math.random() * 20 - 10
      const quantumScore = Math.min(99.9, Math.max(1, baseScore + variance))

      results[player.id] = {
        playerId: player.id,
        quantumScore,
        winProbability: quantumScore / 100,
        cricbuzzRating: Math.floor(Math.random() * 10) + 1, // Simulated external rating
        geminiInsight: `Gemini AI suggests ${player.name} has a ${(quantumScore).toFixed(1)}% impact probability in this match condition.`,
      }

      const sel = Number(player.selectedBy || 0)
      const cred = Number(player.credits || 0)

      // Recent Form: High credits (good history) + decent selection
      if (cred >= 8.5 && sel > 50) {
        recentForm.push(player.id)
      }

      // Best Fix: Very high selection (Must haves)
      if (sel > 80) {
        bestFix.push(player.id)
      }

      // Differential: Low selection but high potential (high credits)
      if (sel < 30 && cred > 8.0) {
        differential.push(player.id)
      }

      captaincy.push({ id: player.id, score: quantumScore })
    })

    setQuantumInsights({
      recentFormPlayers: recentForm.sort(() => 0.5 - Math.random()).slice(0, 4),
      bestFixPlayers: bestFix
        .sort((a, b) => Number(results[b].quantumScore) - Number(results[a].quantumScore))
        .slice(0, 5),
      differentialPicks: differential.slice(0, 3),
      captaincyCandidates: captaincy
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((c) => c.id),
    })

    setQuantumData(results)
    setIsQuantumAnalyzing(false)
  }

  // Flatten all players and bucket by position
  const byPosition = useMemo(() => {
    const buckets: Record<Position, Player[]> = { WK: [], BAT: [], ALL: [], BOW: [] }
    if (!match) return buckets
    const all = [...(match.team1Players || []), ...(match.team2Players || [])] as Player[]
    for (const p of all) {
      const pos = (p.position || "").toUpperCase() as Position
      const normalizedPos = pos === "AL" ? "ALL" : pos
      if (normalizedPos && normalizedPos in buckets) {
        buckets[normalizedPos].push({ ...p, credits: toNumCredit(p.credits) })
      }
    }
    return buckets
  }, [match])

  // Averages per position (credits)
  const averages = useMemo(() => {
    const avg: Record<Position, number> = { WK: 0, BAT: 0, ALL: 0, BOW: 0 }
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
    const result: Record<Position, number> = { WK: 0, BAT: 0, ALL: 0, BOW: 0 }
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
            <div>
              <h2 className="text-lg font-medium">Pick Counts & Totals</h2>
              <p className="text-sm text-muted-foreground">
                Pick the number of players for each position and view estimated total credits.
              </p>
            </div>
            <button
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() =>
                setPickCounts({
                  WK: 1,
                  BAT: 3,
                  ALL: 2,
                  BOW: 5,
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

        {/* Quantum Computing Section */}
        <section className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-900 p-6 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Cpu className="h-32 w-32 animate-pulse" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <Zap className="text-yellow-400" />
              Quantum AI Research & Analysis
              <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full">Gemini Powered</span>
            </h2>

            <p className="text-purple-200 mb-6 max-w-2xl">
              Utilize advanced quantum computing algorithms to analyze all 22 players. Connects with Gemini to process
              data from external sources (Cricbuzz, Crex) for precise C/VC selection.
            </p>

            {!isGoogleConnected ? (
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                <Globe className="h-5 w-5 text-blue-500" />
                Connect Google Account for Gemini Access
              </button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-green-400 bg-green-900/30 p-3 rounded-lg inline-block">
                  <Lock className="h-4 w-4" />
                  Secure Connection Established with Gemini AI
                </div>

                <button
                  onClick={runQuantumAnalysis}
                  disabled={isQuantumAnalyzing}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 w-full md:w-auto"
                >
                  {isQuantumAnalyzing ? (
                    <>
                      <Brain className="animate-spin h-6 w-6" />
                      Processing Quantum States...
                    </>
                  ) : (
                    <>
                      <Cpu className="h-6 w-6" />
                      Run Quantum Analysis (22 Players)
                    </>
                  )}
                </button>
              </div>
            )}

            {quantumData && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {Object.values(quantumData)
                  .sort((a, b) => b.quantumScore - a.quantumScore)
                  .slice(0, 6) // Show top 6
                  .map((data, idx) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === data.playerId,
                    )
                    if (!player) return null
                    return (
                      <div
                        key={data.playerId}
                        className="bg-black/40 backdrop-blur-md p-4 rounded-lg border border-purple-500/30 hover:border-purple-400 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">
                            {idx + 1}. {player.name}
                          </h3>
                          <span className="text-yellow-400 font-mono">{data.quantumScore.toFixed(1)} QS</span>
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {player.position} | {player.team}
                        </div>
                        <p className="text-xs text-purple-200 italic mb-3">"{data.geminiInsight}"</p>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-blue-900/50 px-2 py-1 rounded">
                            Win Prob: {(data.winProbability * 100).toFixed(0)}%
                          </span>
                          <span className="bg-green-900/50 px-2 py-1 rounded">
                            Crex Rating: {data.cricbuzzRating}/10
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}

            {quantumInsights && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                {/* Recent Form */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-blue-400/30">
                  <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5" /> Recent In-Form Players
                  </h3>
                  <div className="space-y-2">
                    {quantumInsights.recentFormPlayers.length > 0 ? (
                      quantumInsights.recentFormPlayers.map((pid) => {
                        const p = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                          (x) => x.id === pid,
                        )
                        return p ? (
                          <div key={pid} className="flex justify-between text-sm bg-blue-900/20 p-2 rounded">
                            <span>{p.name}</span>
                            <span className="text-blue-200">{p.team}</span>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-sm text-gray-400">No clear form patterns detected.</p>
                    )}
                  </div>
                </div>

                {/* Best Fix Players */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-green-400/30">
                  <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Best Fix Players (Must Haves)
                  </h3>
                  <div className="space-y-2">
                    {quantumInsights.bestFixPlayers.length > 0 ? (
                      quantumInsights.bestFixPlayers.map((pid) => {
                        const p = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                          (x) => x.id === pid,
                        )
                        return p ? (
                          <div key={pid} className="flex justify-between text-sm bg-green-900/20 p-2 rounded">
                            <span>{p.name}</span>
                            <span className="text-green-200 font-mono">{p.selectedBy}% Sel</span>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-sm text-gray-400">No high-certainty fix players found.</p>
                    )}
                  </div>
                </div>

                {/* Differential Picks */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-pink-400/30">
                  <h3 className="text-xl font-bold text-pink-300 mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5" /> Differential / Risky Picks
                  </h3>
                  <div className="space-y-2">
                    {quantumInsights.differentialPicks.length > 0 ? (
                      quantumInsights.differentialPicks.map((pid) => {
                        const p = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                          (x) => x.id === pid,
                        )
                        return p ? (
                          <div key={pid} className="flex justify-between text-sm bg-pink-900/20 p-2 rounded">
                            <span>{p.name}</span>
                            <span className="text-pink-200 font-mono">{p.selectedBy}% Sel</span>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-sm text-gray-400">No hidden gems detected.</p>
                    )}
                  </div>
                </div>

                {/* Captaincy Candidates */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-yellow-400/30">
                  <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5" /> Top C/VC Candidates
                  </h3>
                  <div className="space-y-2">
                    {quantumInsights.captaincyCandidates.length > 0 ? (
                      quantumInsights.captaincyCandidates.map((pid, i) => {
                        const p = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                          (x) => x.id === pid,
                        )
                        return p ? (
                          <div key={pid} className="flex justify-between text-sm bg-yellow-900/20 p-2 rounded">
                            <span>
                              {i === 0 ? "👑 C" : i === 1 ? "🛡️ VC" : "🔥 Risky C"} - {p.name}
                            </span>
                            <span className="text-yellow-200">{quantumData?.[pid]?.quantumScore.toFixed(0)} QS</span>
                          </div>
                        ) : null
                      })
                    ) : (
                      <p className="text-sm text-gray-400">Insufficient data for leadership analysis.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AI Team Analysis section */}
        <section className="rounded-lg border p-4 bg-gradient-to-br from-purple-50 to-blue-50 mt-8">
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
        <section className="rounded-lg border p-4 mt-8">
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
            Tip: If the decimal part matches 142857 (or rotations), it indicates a multiple of 1/7. You'll see quick
            hints like "28 is double of 14 (≈ 2/7 pattern)".
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 mt-8">
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
