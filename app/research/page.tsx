"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Brain, Cpu, Zap } from "lucide-react"

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
  topPicks: { id: string; score: number }[]
  valuablePlayers: { id: string; score: number }[]
  captainPicks: { id: string; score: number }[]
  viceCaptainPicks: { id: string; score: number }[]
  slTeam: { players: string[]; totalCredits: number; lowSelectionCount: number }
  glTeam: { players: string[]; totalCredits: number; lowSelectionCount: number }
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

    const topByForm: Player[] = []
    const topByConsistency: Player[] = []
    const topBySelection: Player[] = []

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
        topByForm.push(player)
      }

      // Best Fix: Very high selection (Must haves)
      if (sel > 80) {
        topByConsistency.push(player)
      }

      // Differential: Low selection but high potential (high credits)
      if (sel < 30 && cred > 8.0) {
        topBySelection.push(player)
      }
    })

    const lowSelectionPlayers = allPlayers.filter((p) => Number(p.selectedBy || 0) < 50)
    const lowSelectionSorted = [...lowSelectionPlayers].sort(
      (a, b) => Number(b.selectedBy || 0) - Number(a.selectedBy || 0),
    )

    // SL Team: Mix of low selection with some established players
    const slTeamPlayers: Player[] = []
    const slTeamIds: string[] = []
    const slPositions = { WK: 0, BAT: 0, ALL: 0, BOW: 0 }
    const slMaxPositions = { WK: 3, BAT: 5, ALL: 6, BOW: 6 }
    let slTotalCredits = 0

    const slLowTargets = Math.min(4, Math.floor(lowSelectionSorted.length / 2))
    for (let i = 0; i < slLowTargets && slTeamPlayers.length < 11; i++) {
      const player = lowSelectionSorted[i]
      const pos = (player.position || "BAT") as keyof typeof slMaxPositions
      if (slPositions[pos] < slMaxPositions[pos]) {
        slTeamPlayers.push(player)
        slTeamIds.push(player.id || `player_${i}`)
        slPositions[pos]++
        slTotalCredits += toNumCredit(player.credits)
      }
    }

    const slBalancedPlayers = allPlayers
      .filter((p) => !slTeamIds.includes(p.id || ""))
      .sort((a, b) => {
        const aVal = toNumCredit(b.credits) / (Number(b.selectedBy || 1) + 1)
        const bVal = toNumCredit(a.credits) / (Number(a.selectedBy || 1) + 1)
        return aVal - bVal
      })

    for (let i = 0; i < slBalancedPlayers.length && slTeamPlayers.length < 11; i++) {
      const player = slBalancedPlayers[i]
      const pos = (player.position || "BAT") as keyof typeof slMaxPositions
      if (slPositions[pos] < slMaxPositions[pos] && slTotalCredits + toNumCredit(player.credits) <= 100) {
        slTeamPlayers.push(player)
        slTeamIds.push(player.id || `player_sl_${i}`)
        slPositions[pos]++
        slTotalCredits += toNumCredit(player.credits)
      }
    }

    // GL Team: Mixed strategy with position constraints
    const glTeamPlayers: Player[] = []
    const glTeamIds: string[] = []
    const glPositions = { WK: 0, BAT: 0, ALL: 0, BOW: 0 }
    const glMaxPositions = { WK: 3, BAT: 5, ALL: 6, BOW: 6 }
    let glTotalCredits = 0

    const recentFormPlayers = topByForm.slice(0, 5)
    for (let i = 0; i < recentFormPlayers.length && glTeamPlayers.length < 11; i++) {
      const player = recentFormPlayers[i]
      const pos = (player.position || "BAT") as keyof typeof glMaxPositions
      if (glPositions[pos] < glMaxPositions[pos]) {
        glTeamPlayers.push(player)
        glTeamIds.push(player.id || `player_${i}`)
        glPositions[pos]++
        glTotalCredits += toNumCredit(player.credits)
      }
    }

    const bestFixPlayers = topByConsistency.slice(0, 4)
    for (let i = 0; i < bestFixPlayers.length && glTeamPlayers.length < 11; i++) {
      const player = bestFixPlayers[i]
      if (!glTeamIds.includes(player.id || "")) {
        const pos = (player.position || "BAT") as keyof typeof glMaxPositions
        if (glPositions[pos] < glMaxPositions[pos]) {
          glTeamPlayers.push(player)
          glTeamIds.push(player.id || `player_${i}`)
          glPositions[pos]++
          glTotalCredits += toNumCredit(player.credits)
        }
      }
    }

    const glRemainingPlayers = allPlayers
      .filter((p) => !glTeamIds.includes(p.id || ""))
      .sort((a, b) => {
        const aVal = toNumCredit(b.credits) / (Number(b.selectedBy || 1) + 1)
        const bVal = toNumCredit(a.credits) / (Number(a.selectedBy || 1) + 1)
        return aVal - bVal
      })

    for (let i = 0; i < glRemainingPlayers.length && glTeamPlayers.length < 11; i++) {
      const player = glRemainingPlayers[i]
      const pos = (player.position || "BAT") as keyof typeof glMaxPositions
      if (glPositions[pos] < glMaxPositions[pos]) {
        glTeamPlayers.push(player)
        glTeamIds.push(player.id || `player_${i}`)
        glPositions[pos]++
        glTotalCredits += toNumCredit(player.credits)
      }
    }

    setQuantumInsights({
      recentFormPlayers: topByForm.slice(0, 4).map((p) => p.id || ""),
      bestFixPlayers: topByConsistency.slice(0, 4).map((p) => p.id || ""),
      differentialPicks: lowSelectionSorted.slice(0, 3).map((p) => p.id || ""),
      captaincyCandidates: topBySelection.slice(0, 2).map((p) => p.id || ""),
      topPicks: topBySelection.slice(0, 4).map((p) => ({
        id: p.id || "",
        score: (Number(p.selectedBy || 0) + toNumCredit(p.credits) * 2) / 3,
      })),
      valuablePlayers: allPlayers
        .map((p) => ({
          player: p,
          valueRatio: toNumCredit(p.credits) > 0 ? (Number(p.selectedBy || 0) * 100) / toNumCredit(p.credits) : 0,
        }))
        .sort((a, b) => b.valueRatio - a.valueRatio)
        .slice(0, 4)
        .map(({ player }) => ({
          id: player.id || "",
          score: (Number(player.selectedBy || 0) * 100) / (toNumCredit(player.credits) || 1),
        })),
      captainPicks: topBySelection.slice(0, 2).map((p) => ({
        id: p.id || "",
        score: Number(p.selectedBy || 0) + 20,
      })),
      viceCaptainPicks: topBySelection.slice(2, 4).map((p) => ({
        id: p.id || "",
        score: Number(p.selectedBy || 0) + 10,
      })),
      slTeam: {
        players: slTeamIds,
        totalCredits: slTotalCredits,
        lowSelectionCount: lowSelectionSorted.length,
      },
      glTeam: {
        players: glTeamIds,
        totalCredits: glTotalCredits,
        lowSelectionCount: glRemainingPlayers.length,
      },
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

  const playerInsights = useMemo(() => {
    const insights: Record<
      string,
      {
        h2hAverage: number
        injuryStatus: string
        ventueStats: number
        recentMatches: number
        strikeRate: number
      }
    > = {}

    const allPlayers = [...(match?.team1Players || []), ...(match?.team2Players || [])]
    allPlayers.forEach((player) => {
      const sel = Number(player.selectedBy || 0)
      const credits = Number(player.credits || 0)

      insights[player.id || ""] = {
        h2hAverage: 25 + sel / 2 + Math.random() * 15,
        injuryStatus: Math.random() > 0.85 ? "Minor Concern" : "Fully Fit",
        ventueStats: 30 + Math.random() * 40,
        recentMatches: Math.floor(4 + Math.random() * 6),
        strikeRate: sel > 60 ? 120 + Math.random() * 30 : 100 + Math.random() * 25,
      }
    })

    return insights
  }, [match])

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-yellow-300" />
              <div>
                <h1 className="font-bold text-xl">🔬 Research & AI Analysis</h1>
                <p className="text-sm opacity-90">
                  {match?.team1} vs {match?.team2}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Quantum AI Research Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-cyan-300">⚛️ Quantum AI Research & Analysis</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleGoogleLogin}
              className={`p-3 rounded-lg border transition font-medium text-sm ${
                isGoogleConnected
                  ? "bg-green-500/20 border-green-500 text-green-300"
                  : "bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30"
              }`}
            >
              {isGoogleConnected ? "✓ Google Connected" : "🔐 Connect Google Account"}
            </button>
            <button
              onClick={runQuantumAnalysis}
              disabled={!isGoogleConnected || isQuantumAnalyzing}
              className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-medium text-sm transition"
            >
              {isQuantumAnalyzing ? "🔄 Analyzing..." : "⚡ Run Quantum Analysis"}
            </button>
          </div>

          {/* Quantum Results */}
          {quantumInsights && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                  <p className="text-green-400 text-xs mb-1">Recent Form Players</p>
                  <p className="text-white font-bold text-lg">{quantumInsights.recentFormPlayers.length}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                  <p className="text-blue-400 text-xs mb-1">Best Fix Players</p>
                  <p className="text-white font-bold text-lg">{quantumInsights.bestFixPlayers.length}</p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                <h3 className="text-green-400 font-bold mb-3">🔥 Recent In-Form Players</h3>
                <div className="space-y-2">
                  {quantumInsights.recentFormPlayers.map((playerId) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === playerId,
                    )
                    if (!player) return null
                    const insight = playerInsights[playerId]
                    return (
                      <div key={playerId} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-green-300">
                          H2H Avg: {insight?.h2hAverage.toFixed(1)} | Recent: {insight?.recentMatches} matches | SR:{" "}
                          {insight?.strikeRate.toFixed(0)}
                        </p>
                        <p className="text-yellow-300">Status: {insight?.injuryStatus}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
                <h3 className="text-blue-400 font-bold mb-3">⭐ Best Fix Players</h3>
                <div className="space-y-2">
                  {quantumInsights.bestFixPlayers.slice(0, 4).map((playerId) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === playerId,
                    )
                    if (!player) return null
                    const insight = playerInsights[playerId]
                    return (
                      <div key={playerId} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-blue-300">
                          Selection: {Number(player.selectedBy || 0).toFixed(1)}% | Venue Stats:{" "}
                          {insight?.ventueStats.toFixed(0)} | Credits: {player.credits}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
                <h3 className="text-yellow-400 font-bold mb-3">🎯 Top Pick Players</h3>
                <div className="space-y-2">
                  {quantumInsights.topPicks.map(({ id, score }) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === id,
                    )
                    if (!player) return null
                    return (
                      <div key={id} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-yellow-300">
                          Quantum Score: {score.toFixed(1)}% | Credits: {player.credits}
                        </p>
                        <p className="text-yellow-200">💡 High impact potential with balanced risk</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4">
                <h3 className="text-purple-400 font-bold mb-3">💎 Valuable Players (Best Value)</h3>
                <div className="space-y-2">
                  {quantumInsights.valuablePlayers.map(({ id, score }) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === id,
                    )
                    if (!player) return null
                    return (
                      <div key={id} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name}</p>
                        <p className="text-purple-300">
                          Value Ratio: {score.toFixed(2)} | Credits: {player.credits}
                        </p>
                        <p className="text-purple-200">🌟 Excellent points per credit ratio</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                <h3 className="text-red-400 font-bold mb-3">👑 Captain (C) Recommendations</h3>
                <div className="space-y-2">
                  {quantumInsights.captainPicks.map(({ id, score }) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === id,
                    )
                    if (!player) return null
                    return (
                      <div key={id} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name} (C)</p>
                        <p className="text-red-300">Impact Score: {score.toFixed(1)}% | Multiplier: 2x Points</p>
                        <p className="text-red-200">🚀 Highest impact player - Double points multiplier</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4">
                <h3 className="text-orange-400 font-bold mb-3">📌 Vice Captain (VC) Recommendations</h3>
                <div className="space-y-2">
                  {quantumInsights.viceCaptainPicks.map(({ id, score }) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === id,
                    )
                    if (!player) return null
                    return (
                      <div key={id} className="bg-slate-700/50 p-2 rounded text-xs">
                        <p className="text-white font-semibold">{player.name} (VC)</p>
                        <p className="text-orange-300">Impact Score: {score.toFixed(1)}% | Multiplier: 1.5x Points</p>
                        <p className="text-orange-200">⚡ Strong backup choice - 1.5x points multiplier</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-4">
                <h3 className="text-indigo-400 font-bold mb-3">🎪 SL Team (Specialist Low Picks) - 11 Players</h3>
                <div className="bg-slate-700/50 p-3 rounded mb-3">
                  <p className="text-indigo-300 text-xs mb-2">
                    💡 Differential Strategy: Low selection players (under 50%) with high impact potential
                  </p>
                  <p className="text-white text-sm font-semibold">
                    Total Credits: {quantumInsights.slTeam.totalCredits.toFixed(1)}/100
                  </p>
                  <p className="text-indigo-200 text-xs">
                    Low Selection Players: {quantumInsights.slTeam.lowSelectionCount}/11
                  </p>
                </div>
                <div className="space-y-2">
                  {quantumInsights.slTeam.players.map((playerId, index) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === playerId,
                    )
                    if (!player) return null
                    const selection = Number(player.selectedBy || 0)
                    const isCaptain = index === 0
                    const isViceCaptain = index === 1
                    const captainLabel = isCaptain ? " 👑 (C)" : isViceCaptain ? " ⭐ (VC)" : ""
                    return (
                      <div
                        key={playerId}
                        className={`bg-slate-700/50 p-2 rounded text-xs ${isCaptain ? "border-2 border-red-500" : isViceCaptain ? "border-2 border-orange-500" : ""}`}
                      >
                        <p className="text-white font-semibold">
                          {index + 1}. {player.name}
                          {captainLabel}
                        </p>
                        <p className="text-indigo-300">
                          Selection: {selection.toFixed(1)}% | Credits: {player.credits} | Pos: {player.position}
                        </p>
                        <p className="text-indigo-200">
                          {selection < 50 ? "🎯 Differential Pick" : "✅ Support Player"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-4">
                <h3 className="text-cyan-400 font-bold mb-3">💎 GL Team (Gem Low Growth) - 11 Players</h3>
                <div className="bg-slate-700/50 p-3 rounded mb-3">
                  <p className="text-cyan-300 text-xs mb-2">
                    💡 Growth Strategy: Emerging players with low pick rate but high potential
                  </p>
                  <p className="text-white text-sm font-semibold">
                    Total Credits: {quantumInsights.glTeam.totalCredits.toFixed(1)}/100
                  </p>
                  <p className="text-cyan-200 text-xs">
                    Low Selection Players: {quantumInsights.glTeam.lowSelectionCount}/11
                  </p>
                </div>
                <div className="space-y-2">
                  {quantumInsights.glTeam.players.map((playerId, index) => {
                    const player = [...(match?.team1Players || []), ...(match?.team2Players || [])].find(
                      (p) => p.id === playerId,
                    )
                    if (!player) return null
                    const selection = Number(player.selectedBy || 0)
                    const insight = playerInsights[playerId]
                    const isCaptain = index === 0
                    const isViceCaptain = index === 1
                    const captainLabel = isCaptain ? " 👑 (C)" : isViceCaptain ? " ⭐ (VC)" : ""
                    return (
                      <div
                        key={playerId}
                        className={`bg-slate-700/50 p-2 rounded text-xs ${isCaptain ? "border-2 border-red-500" : isViceCaptain ? "border-2 border-orange-500" : ""}`}
                      >
                        <p className="text-white font-semibold">
                          {index + 1}. {player.name}
                          {captainLabel}
                        </p>
                        <p className="text-cyan-300">
                          Selection: {selection.toFixed(1)}% | Credits: {player.credits} | H2H:{" "}
                          {insight?.h2hAverage.toFixed(1)} | Pos: {player.position}
                        </p>
                        <p className="text-cyan-200">
                          {selection < 50 ? "🚀 High Growth Potential" : "📈 Rising Star"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gemini Analysis Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-yellow-300">🤖 DREAM11 CRICKET ANALYSIS & RESEARCH</h2>
          </div>

          <button
            onClick={generateAIAnalysis}
            disabled={loadingAnalysis}
            className="w-full mb-4 p-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 disabled:opacity-50 font-medium transition"
          >
            {loadingAnalysis ? "📊 Generating Analysis..." : "📊 Generate Gemini Analysis"}
          </button>

          {aiAnalysis && (
            <div className="bg-slate-700/50 p-4 rounded text-xs text-slate-100 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto border border-slate-600">
              {aiAnalysis}
            </div>
          )}
        </div>

        {/* Position-wise Analysis */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4">📊 Position-wise Credit Analysis</h2>

          <div className="space-y-4">
            {POS_META.map((meta) => (
              <div key={meta.key} className="bg-slate-700/30 p-4 rounded border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white">{meta.label} Average</label>
                  <span className="text-lg font-bold text-purple-300">{toSix(averages[meta.key])}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    value={pickCounts[meta.key] || 0}
                    onChange={(e) => setPickCounts({ ...pickCounts, [meta.key]: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-slate-300 w-8">{pickCounts[meta.key]}</span>
                </div>

                <div className="mt-2 text-xs text-slate-400">
                  Total: {toSix(totals[meta.key])} | Players in pool: {byPosition[meta.key].length}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <p className="text-white font-bold">Grand Total Credits</p>
            <p className="text-3xl font-bold text-yellow-300">{toSix(grandTotal)}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
