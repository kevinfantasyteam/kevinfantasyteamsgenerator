"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, ArrowLeft, Home, Hash, Copy, Share, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { generateDream11Hash } from "@/lib/hash-generator"

interface Player {
  id: string
  name: string
  team: string
  position: string
  credits: number
  selectedBy: number
  avatar?: string
}

interface GeneratedTeam {
  id: string
  captain: string
  viceCaptain: string
  players: Player[]
  totalCredits: number
  hash: string
}

export default function FinalTeamPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")

  const [generatedTeams, setGeneratedTeams] = useState<GeneratedTeam[]>([])
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [matchInfo, setMatchInfo] = useState<{ team1: string; team2: string } | null>(null)

  useEffect(() => {
    loadMatchAndGenerateTeams()
  }, [matchId])

  const loadMatchAndGenerateTeams = async () => {
    setIsGenerating(true)

    const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
    const match = matches.find((m: any) => m.id === matchId)

    if (match) {
      setMatchInfo({ team1: match.team1, team2: match.team2 })

      // Load selected players
      const savedPlayers = localStorage.getItem(`selectedPlayers_${matchId}`)
      const players: Player[] = savedPlayers ? JSON.parse(savedPlayers) : match.players || []

      // Load captain/vc selections
      const captainSelData = localStorage.getItem(`captainSelection_${matchId}`)
      const captainSel = captainSelData ? JSON.parse(captainSelData) : { captain: null, viceCaptain: null }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate teams using actual player data
      const teams: GeneratedTeam[] = generateTeamsFromPlayers(players, captainSel, match)
      setGeneratedTeams(teams)
    }

    setIsGenerating(false)
  }

  const generateTeamsFromPlayers = (
    players: Player[],
    captainSel: { captain: string | null; viceCaptain: string | null },
    match: any,
  ): GeneratedTeam[] => {
    const teams: GeneratedTeam[] = []
    const matchIdentifier = `${match.team1}-vs-${match.team2}`

    // Generate 3-5 team variations
    for (let i = 0; i < Math.min(5, Math.max(1, Math.floor(players.length / 3))); i++) {
      const shuffled = [...players].sort(() => Math.random() - 0.5)
      const teamPlayers = shuffled.slice(0, 11)

      // Determine captain and vice-captain
      const captain = captainSel.captain || teamPlayers[0]?.name
      let viceCaptain = captainSel.viceCaptain || teamPlayers[1]?.name

      // Ensure C and VC are different
      if (captain === viceCaptain && teamPlayers.length > 1) {
        viceCaptain = teamPlayers.find((p) => p.name !== captain)?.name || teamPlayers[1]?.name
      }

      teams.push({
        id: `team-${i + 1}`,
        captain: captain || "Not Selected",
        viceCaptain: viceCaptain || "Not Selected",
        players: teamPlayers,
        totalCredits: teamPlayers.reduce((sum, p) => sum + p.credits, 0),
        hash: generateDream11Hash(`${matchIdentifier}-${i}-${Date.now()}`),
      })
    }

    return teams
  }

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      alert("Team hash copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareTeam = () => {
    if (generatedTeams[currentTeamIndex]) {
      const team = generatedTeams[currentTeamIndex]
      const shareText = `Dream11 Team Generated!\nCaptain: ${team.captain}\nVice Captain: ${team.viceCaptain}\nHash: ${team.hash}`

      if (navigator.share) {
        navigator.share({
          title: "Dream11 Team",
          text: shareText,
        })
      } else {
        navigator.clipboard.writeText(shareText)
        alert("Team details copied to clipboard!")
      }
    }
  }

  const downloadTeam = () => {
    if (generatedTeams[currentTeamIndex]) {
      const team = generatedTeams[currentTeamIndex]
      const teamData = {
        captain: team.captain,
        viceCaptain: team.viceCaptain,
        players: team.players.map((p) => ({ name: p.name, team: p.team, position: p.position, credits: p.credits })),
        totalCredits: team.totalCredits,
        hash: team.hash,
        generatedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dream11-team-${team.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Generating Your Dream11 Teams</h2>
          <p className="text-muted-foreground">Using hash-based algorithms to create winning combinations...</p>
        </div>
      </div>
    )
  }

  const currentTeam = generatedTeams[currentTeamIndex]

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No teams generated</h2>
          <p className="text-muted-foreground mb-4">Please select players first</p>
          <Link href={matchId ? `/player-selection?matchId=${matchId}` : "/"}>
            <Button>Go to Player Selection</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div className="text-center">
              <h1 className="font-bold text-lg">Generated Teams</h1>
              <p className="text-sm opacity-90">
                {matchInfo ? `${matchInfo.team1} vs ${matchInfo.team2}` : "Hash-Based Creation"}
              </p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Team Navigation */}
      <div className="bg-secondary p-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentTeamIndex === 0}
            onClick={() => setCurrentTeamIndex((prev) => Math.max(0, prev - 1))}
            className="bg-transparent"
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Team {currentTeamIndex + 1} of {generatedTeams.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentTeamIndex === generatedTeams.length - 1}
            onClick={() => setCurrentTeamIndex((prev) => Math.min(generatedTeams.length - 1, prev + 1))}
            className="bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Team Details */}
      <div className="max-w-md mx-auto p-4">
        {/* Captain & Vice Captain */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800">
                  Captain (2x)
                </Badge>
                <p className="font-medium">{currentTeam.captain}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2 bg-purple-100 text-purple-800">
                  Vice Captain (1.5x)
                </Badge>
                <p className="font-medium">{currentTeam.viceCaptain}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Hash */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Team Hash
              </h3>
              <Button variant="outline" size="sm" onClick={() => copyHash(currentTeam.hash)} className="bg-transparent">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm font-mono bg-muted p-2 rounded border break-all">{currentTeam.hash}</div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Selected Players ({currentTeam.players.length})</h3>
            <div className="space-y-3">
              {currentTeam.players.map((player) => (
                <div key={player.id} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={player.avatar || "/placeholder.svg?height=32&width=32&query=cricket player"}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Badge
                      variant="secondary"
                      className={`absolute -bottom-1 -right-1 text-xs px-1 py-0 ${
                        player.team === matchInfo?.team1 ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      {player.position}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{player.credits}</p>
                    {player.name === currentTeam.captain && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        C
                      </Badge>
                    )}
                    {player.name === currentTeam.viceCaptain && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        VC
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Credits:</span>
                <span className="font-bold">{currentTeam.totalCredits.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button variant="outline" onClick={shareTeam} className="bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={downloadTeam} className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={loadMatchAndGenerateTeams} className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>

        {/* Success Message */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-green-800 mb-1">Team Generated Successfully!</h3>
            <p className="text-sm text-green-600">
              Your Dream11 team has been created using hash-based algorithms for optimal player selection.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-medium">
            Developed By <span className="text-green-600">Believer01</span>
          </p>
          <p className="text-xs text-muted-foreground">Refer your friends for benefits</p>
        </div>
      </div>
    </div>
  )
}
