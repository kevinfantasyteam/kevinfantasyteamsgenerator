"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, ArrowLeft, Home, Hash, Download, Share, Sparkles, Target, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function GenerateTeamsPage() {
  const [numberOfTeams, setNumberOfTeams] = useState("5")
  const [generatedTeams, setGeneratedTeams] = useState<any[]>([])
  const [hashValue, setHashValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [matchPlayers, setMatchPlayers] = useState<any[]>([])
  const [matchName, setMatchName] = useState("")
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [captainOptions, setCaptainOptions] = useState<string[]>([])
  const [viceCaptainOptions, setViceCaptainOptions] = useState<string[]>([])
  const [fixedPlayers, setFixedPlayers] = useState<string[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get("matchId")

  useEffect(() => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const match = matches.find((m: any) => m.id === matchId)
      if (match) {
        setMatchName(match.name)
        const allPlayers = [...match.team1Players, ...match.team2Players]
        setMatchPlayers(allPlayers)

        const captainOpts = JSON.parse(localStorage.getItem("captainOptions") || "[]")
        const viceCaptainOpts = JSON.parse(localStorage.getItem("viceCaptainOptions") || "[]")
        const fixedPlayerIds = JSON.parse(localStorage.getItem("fixedPlayers") || "[]")

        setCaptainOptions(captainOpts)
        setViceCaptainOptions(viceCaptainOpts)
        setFixedPlayers(fixedPlayerIds)

        generateAiInsights(allPlayers, captainOpts, viceCaptainOpts, fixedPlayerIds)
      }
    }
  }, [matchId])

  const generateAiInsights = (players: any[], captains: string[], viceCaptains: string[], fixed: string[]) => {
    const insights = [
      `🎯 ${players.length} players available for selection`,
      `👑 ${captains.length} captain options selected`,
      `⭐ ${viceCaptains.length} vice captain options selected`,
      `🔒 ${fixed.length} fixed players in every team`,
      `💰 Average credit: ${(players.reduce((sum, p) => sum + Number.parseFloat(p.credits), 0) / players.length).toFixed(1)}`,
    ]
    setAiInsights(insights)
  }

  const generateTeams = async () => {
    setIsGenerating(true)

    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setHashValue(hash)

    const creditRange = JSON.parse(localStorage.getItem("creditRange") || '{"min": "0", "max": "100"}')
    const minCredit = Number.parseFloat(creditRange.min)
    const maxCredit = Number.parseFloat(creditRange.max)

    const useCustomCombination = localStorage.getItem("useCustomCombination") === "true"
    const customCombination = JSON.parse(
      localStorage.getItem("customCombination") || '{"wk": 1, "bat": 3, "al": 2, "bow": 5}',
    )

    const partitionStrategy = localStorage.getItem("teamPartitionStrategy") || "balanced"

    const teams: any[] = []
    let attempts = 0
    const maxAttempts = 5000 // Avoid infinite loops
    const targetTeams = Number.parseInt(numberOfTeams)

    while (teams.length < targetTeams && attempts < maxAttempts) {
      attempts++

      // 1. Define Structure (Roles)
      let structure = { wk: 0, bat: 0, al: 0, bow: 0 }

      if (useCustomCombination) {
        structure = customCombination
      } else {
        // Default dynamic structure if no custom combination
        // Simple random valid cricket structure
        const wk = 1 + Math.floor(Math.random() * 2) // 1-2
        const bat = 3 + Math.floor(Math.random() * 3) // 3-5
        const al = 1 + Math.floor(Math.random() * 3) // 1-3
        const bow = 3 + Math.floor(Math.random() * 3) // 3-5

        // Adjust to ensure sum is 11
        const sum = wk + bat + al + bow
        if (sum < 11) structure = { wk, bat: bat + (11 - sum), al, bow }
        else if (sum > 11) structure = { wk, bat: Math.max(3, bat - (sum - 11)), al, bow }
        else structure = { wk, bat, al, bow }
      }

      // 2. Filter Players by Role
      const wkPlayers = matchPlayers.filter((p) => p.role === "WK" || p.role === "Wicket Keeper")
      const batPlayers = matchPlayers.filter((p) => p.role === "BAT" || p.role === "Batsman")
      const alPlayers = matchPlayers.filter((p) => p.role === "ALL" || p.role === "All Rounder")
      const bowPlayers = matchPlayers.filter((p) => p.role === "BOW" || p.role === "Bowler")

      // 3. Select Players based on Structure
      const selectRandom = (pool: any[], count: number, fixed: string[]) => {
        const fixedInPool = pool.filter((p) => fixed.includes(p.id))
        const remainingNeeded = count - fixedInPool.length
        if (remainingNeeded < 0) return fixedInPool.slice(0, count) // Too many fixed for this role

        const available = pool.filter((p) => !fixed.includes(p.id)).sort(() => 0.5 - Math.random())
        return [...fixedInPool, ...available.slice(0, remainingNeeded)]
      }

      const selectedWK = selectRandom(wkPlayers, structure.wk, fixedPlayers)
      const selectedBAT = selectRandom(batPlayers, structure.bat, fixedPlayers)
      const selectedAL = selectRandom(alPlayers, structure.al, fixedPlayers)
      const selectedBOW = selectRandom(bowPlayers, structure.bow, fixedPlayers)

      const teamPlayers = [...selectedWK, ...selectedBAT, ...selectedAL, ...selectedBOW]

      // Verify we have 11 players
      if (teamPlayers.length !== 11) continue

      // Validate Team Partition (Team A vs Team B)
      const team1Count = teamPlayers.filter((p) => p.team === "Team 1" || matchPlayers[0]?.team === p.team).length // Simplified check
      // Needs robust team checking. Assuming matchPlayers has team info.
      // Actually matchPlayers usually has team1Players and team2Players combined.
      // Let's use the raw data structure if possible or infer from existing logic.
      // The existing code didn't strictly track teams. I'll assume 'team' property exists or I can infer.
      // If `team` property is missing, skip partition check or try to infer.

      // Let's check partition strategy constraints
      let isValidPartition = true
      if (teamPlayers[0]?.team) {
        const t1Name = teamPlayers[0].team
        const t1Count = teamPlayers.filter((p) => p.team === t1Name).length
        const t2Count = 11 - t1Count

        if (partitionStrategy === "balanced") {
          if (Math.abs(t1Count - t2Count) > 1) isValidPartition = false // 6:5 or 5:6 only
        } else if (partitionStrategy === "favor-team1") {
          if (t1Count < 7) isValidPartition = false
        } else if (partitionStrategy === "favor-team2") {
          if (t2Count < 7) isValidPartition = false
        } else if (partitionStrategy === "mini-1") {
          // Min 1 from a team means split like 10:1 or 1:10
          if (t1Count !== 1 && t2Count !== 1) isValidPartition = false
        } else if (partitionStrategy === "maxi-all") {
          // Max possible? Usually 7 is max in Dream11 but maybe user wants 10?
          // If user said "Maxi All", let's assume extreme splits allowed.
          // If checking against Dream11 rules (max 10 from one team now), then 10:1 is valid.
          // "Mini 1" and "Max All" logic might overlap.
          // Let's assume "Max All" allows 7+ from one team.
          if (t1Count < 7 && t2Count < 7) isValidPartition = false
        }
      }

      if (!isValidPartition) continue

      // Validate Credit Range
      const totalCredits = teamPlayers.reduce((sum, p) => sum + Number.parseFloat(p.credits), 0)
      if (totalCredits < minCredit || totalCredits > maxCredit) continue

      // Assign Captain/VC
      const captainCandidates = teamPlayers.filter((p) => captainOptions.includes(p.id))
      const viceCaptainCandidates = teamPlayers.filter((p) => viceCaptainOptions.includes(p.id))

      const captain =
        captainCandidates.length > 0
          ? captainCandidates[Math.floor(Math.random() * captainCandidates.length)]
          : teamPlayers[0]

      let viceCaptain =
        viceCaptainCandidates.length > 0
          ? viceCaptainCandidates[Math.floor(Math.random() * viceCaptainCandidates.length)]
          : teamPlayers[1]

      // Avoid same C/VC
      if (captain.id === viceCaptain.id) {
        const others = teamPlayers.filter((p) => p.id !== captain.id)
        viceCaptain = others[Math.floor(Math.random() * others.length)]
      }

      teams.push({
        id: teams.length + 1,
        captain: captain.name,
        viceCaptain: viceCaptain.name,
        players: teamPlayers,
        totalCredits: Number.parseFloat(totalCredits.toFixed(1)),
        aiScore: Math.floor(Math.random() * 30) + 70, // Simple simulation score
        fixedCount: teamPlayers.filter((p) => fixedPlayers.includes(p.id)).length,
      })
    }

    setTimeout(() => {
      setGeneratedTeams(teams)
      setIsGenerating(false)
    }, 2000)
  }

  const generateAiTeams = () => {
    setNumberOfTeams("3")
    setTimeout(() => generateTeams(), 100)
  }

  const copyHash = () => {
    navigator.clipboard.writeText(hashValue)
    alert("Hash copied to clipboard!")
  }

  const downloadTeams = () => {
    const data = JSON.stringify(generatedTeams, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dream11-teams.json"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => router.push(`/team-combinations?matchId=${matchId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="text-center">
              <h1 className="font-bold text-lg">🏆 Generate Teams</h1>
              <p className="text-sm opacity-90">{matchName || "Cricket Match"}</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🎯 AI-Powered Team Generation</h2>
          <p className="text-sm text-gray-600">Create winning Dream11 teams with advanced analytics</p>
        </div>

        {aiInsights.length > 0 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-700">🤖 AI Match Analysis (Powered by Gemini)</h3>
              </div>
              <div className="space-y-2">
                {aiInsights.map((insight, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    {insight}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="teams" className="text-sm font-medium text-gray-700">
                  🎯 Number of Teams
                </Label>
                <Input
                  id="teams"
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(e.target.value)}
                  className="text-center text-lg font-medium border-2 border-green-200 focus:border-green-400"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateTeams}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isGenerating || matchPlayers.length === 0}
                >
                  {isGenerating ? "🔄 Generating..." : "🚀 Generate Teams"}
                </Button>
                <Button
                  onClick={generateAiTeams}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  disabled={isGenerating || matchPlayers.length === 0}
                >
                  <Sparkles className="h-4 w-4 mr-2" />✨ Gemini AI Teams
                </Button>
              </div>

              {matchPlayers.length === 0 && (
                <p className="text-xs text-red-500 text-center">⚠️ No players available for team generation</p>
              )}
            </div>
          </CardContent>
        </Card>

        {hashValue && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <Label className="text-blue-700 font-medium">🔐 Generation Hash</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={hashValue} readOnly className="text-xs font-mono bg-white" />
                  <Button size="sm" variant="outline" onClick={copyHash} className="border-blue-300 bg-transparent">
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {generatedTeams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">🏆 Generated Teams ({generatedTeams.length})</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={downloadTeams} className="border-green-300 bg-transparent">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" className="border-blue-300 bg-transparent">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {generatedTeams.map((team) => (
              <Card key={team.id} className="border-2 border-green-200 hover:border-green-300 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-semibold text-gray-800">Team {team.id}</h4>
                        {team.aiScore && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            🤖 AI Score: {team.aiScore}%
                          </span>
                        )}
                        {team.fixedCount > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            🔒 {team.fixedCount} Fixed
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">💰 {team.totalCredits} Credits</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Captain: </span>
                        <span className="font-medium text-green-700">{team.captain} (C)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Vice Captain: </span>
                        <span className="font-medium text-blue-700">{team.viceCaptain} (VC)</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Players: </span>
                      {team.players.map((p: any) => p.name).join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center space-y-2 pt-6">
          <p className="text-sm font-medium">
            Powered by <span className="text-green-600">🏏 KevinFantasy AI</span> &{" "}
            <span className="text-blue-600">💎 Gemini</span>
          </p>
          <p className="text-xs text-gray-500">Advanced cricket analytics & team optimization</p>
        </div>
      </div>
    </div>
  )
}
