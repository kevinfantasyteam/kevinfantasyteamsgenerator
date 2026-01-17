"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Users, Hash, Settings, Zap, Brain, Sparkles } from "lucide-react"

interface Match {
  id: string
  teamName1: string
  teamName2: string
  date: string
  time: string
  tournament: string
  team1Players: any[]
  team2Players: any[]
  matchDetails: string // Added matchDetails field
  liveAnalytics: string // Added liveAnalytics field
}

interface Player {
  id?: string
  name: string
  team: string
  role: string
  credit: number
  selectionPercentage?: number
  quantumScore?: number
  formScore?: number
  recentForm?: string
}

interface CricbuzzTeam {
  id: string
  type: "CRICBUZZ"
  players: (Player & { position?: number; isCaptain?: boolean; isViceCaptain?: boolean })[]
  totalCredits: number
  lowSelectionCount: number
  captain: string
  viceCaptain: string
  analysis: string
}

export default function HomePage() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [aiTeams, setAiTeams] = useState<CricbuzzTeam[]>([])
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedMatches = localStorage.getItem("adminMatches")
    if (savedMatches) {
      try {
        setMatches(JSON.parse(savedMatches))
      } catch (error) {
        console.log("[v0] Error parsing saved matches:", error)
        setMatches([])
      }
    }
  }, [])

  const handleMatchSelect = (matchId: string) => {
    setSelectedMatch(matchId)
  }

  const handleContinue = () => {
    if (selectedMatch) {
      router.push(`/player-selection?matchId=${selectedMatch}`)
    }
  }

  const handleResearch = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/research?matchId=${matchId}`)
  }

  const handleAdminAccess = () => {
    const password = prompt("Enter admin password:")
    if (password === "Mk76230") {
      router.push("/admin")
    } else {
      alert("Invalid password!")
    }
  }

  const getTimeRemaining = (date: string, time: string) => {
    const matchDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    const diff = matchDateTime.getTime() - now.getTime()

    if (diff <= 0) return "Match Started"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h ${minutes}m left`
    }
    return `${hours}h ${minutes}m left`
  }

  const generateCricbuzzTeam = async () => {
    const match = matches.find((m) => m.id === selectedMatch)
    if (!match) return

    setIsGeneratingTeams(true)

    try {
      const allPlayers = [...(match.team1Players || []), ...(match.team2Players || [])]

      if (allPlayers.length === 0) {
        alert("No players found in match. Please check match data.")
        setIsGeneratingTeams(false)
        return
      }

      const response = await fetch("/api/cricbuzz-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch,
          players: allPlayers,
          team1Name: match.teamName1,
          team2Name: match.teamName2,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to generate team")
      }

      const { team: cricbuzzTeam } = await response.json()
      setAiTeams([cricbuzzTeam])
    } catch (error) {
      console.error("[v0] Error generating Cricbuzz team:", error)
      alert("Error generating team: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsGeneratingTeams(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Trophy className="h-6 w-6 text-accent animate-pulse" />
              <Zap className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Team Generator</h1>
              <p className="text-sm opacity-90">KevinFantasy Pro</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={handleAdminAccess}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
        <div className="flex items-center gap-2 bg-muted border border-border rounded-lg p-3">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">AI Analysis Ready • Smart Suggestions Enabled</span>
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Matches</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
            >
              <Users className="h-3 w-3 mr-1" />
              Saved
            </Button>
          </div>

          {matches.length === 0 ? (
            <Card className="p-8 text-center bg-muted border-border">
              <CardContent>
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2 text-foreground">No Matches Available</h3>
                <p className="text-sm text-muted-foreground mb-4">Admin needs to add matches first</p>
                <Button
                  onClick={handleAdminAccess}
                  variant="outline"
                  className="bg-primary border-primary text-primary-foreground hover:bg-primary/80"
                >
                  Access Admin Panel
                </Button>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card
                key={match.id}
                className={`cursor-pointer transition-all bg-card border-border hover:border-primary/50 ${
                  selectedMatch === match.id ? "ring-2 ring-primary border-primary" : ""
                }`}
                onClick={() => handleMatchSelect(match.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs bg-secondary/20 border-secondary/50 text-foreground">
                      {match.tournament}
                    </Badge>
                    <Badge className="text-xs bg-primary text-primary-foreground">
                      {(match.team1Players?.length || 0) + (match.team2Players?.length || 0)} Players
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-1 shadow-lg">
                          <span className="text-primary-foreground text-xs font-bold">
                            {match.teamName1.substring(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">{match.teamName1}</span>
                      </div>

                      <div className="text-center flex-1">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1 justify-center">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{getTimeRemaining(match.date, match.time)}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mb-1 shadow-lg">
                          <span className="text-primary-foreground text-xs font-bold">
                            {match.teamName2.substring(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">{match.teamName2}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs bg-primary/20 border border-primary/50 text-foreground hover:bg-primary/30"
                      onClick={(e) => handleResearch(match.id, e)}
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Research
                    </Button>
                  </div>

                  {/* Advanced Match Details and Live Analytics */}
                  {selectedMatch === match.id && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-white">Match Details</h3>
                      <p className="text-xs text-slate-400 mb-2">{match.matchDetails}</p>
                      <h3 className="text-sm font-semibold text-white">Live Analytics</h3>
                      <p className="text-xs text-slate-400 mb-2">{match.liveAnalytics}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {selectedMatch && (
          <div className="space-y-3">
            <Button
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Team Generation
            </Button>

            <Button
              onClick={generateCricbuzzTeam}
              disabled={isGeneratingTeams}
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingTeams ? "Analyzing..." : "Cricbuzz Analysis Team"}
            </Button>
          </div>
        )}

        {aiTeams.length > 0 && (
          <div className="space-y-4 mt-6">
            {aiTeams.map((team) => (
              <Card key={team.id} className="bg-card border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-bold">🏏 Cricbuzz Analysis Team</h3>
                        <p className="text-xs text-muted-foreground">Quantum AI Analysis (Team 1 + Team 2)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Credits: {team.totalCredits}</p>
                      <p className="text-xs text-accent">Low: {team.lowSelectionCount}</p>
                    </div>
                  </div>

                  {/* Analysis text */}
                  <div className="mb-3 p-2 bg-muted rounded text-xs text-muted-foreground">{team.analysis}</div>

                  <div className="grid grid-cols-1 gap-2">
                    {team.players.map((player) => (
                      <div
                        key={player.name}
                        className="flex items-center justify-between bg-background p-3 rounded border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">
                            {player.position}. {player.name}
                            {player.isCaptain && " 👑 (C)"}
                            {player.isViceCaptain && " ⭐ (VC)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {player.role} • {player.selectionPercentage || 50}% • {player.credit} Cr
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 justify-between text-xs">
                    <p className="text-muted-foreground">Captain: {team.captain}</p>
                    <p className="text-muted-foreground">Vice Captain: {team.viceCaptain}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border backdrop-blur">
        <div className="max-w-md mx-auto flex">
          <Button
            variant="ghost"
            className="flex-1 flex-col gap-1 h-16 rounded-none text-primary hover:text-primary/80"
          >
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex-col gap-1 h-16 rounded-none text-muted-foreground hover:text-muted-foreground/80"
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs">My matches</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex-col gap-1 h-16 rounded-none text-muted-foreground hover:text-muted-foreground/80"
          >
            <Brain className="h-4 w-4" />
            <span className="text-xs">Research</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex-col gap-1 h-16 rounded-none text-muted-foreground hover:text-muted-foreground/80"
          >
            <Hash className="h-4 w-4" />
            <span className="text-xs">User</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
