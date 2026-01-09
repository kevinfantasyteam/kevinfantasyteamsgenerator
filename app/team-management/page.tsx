"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, Clock, Plus, Check } from "lucide-react"
import Link from "next/link"

interface Player {
  id: string
  name: string
  team: string
  position: string
  credits: number
  selectedBy: number
  avatar?: string
}

export default function TeamManagementPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")

  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [matchInfo, setMatchInfo] = useState<{ team1: string; team2: string } | null>(null)
  const [currentTab, setCurrentTab] = useState<"WK" | "BAT" | "ALL" | "BOW">("WK")
  const [timeLeft] = useState("23m 22s left")

  useEffect(() => {
    loadMatchData()
  }, [matchId])

  const loadMatchData = () => {
    const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
    const match = matches.find((m: any) => m.id === matchId)

    if (match) {
      setMatchInfo({ team1: match.team1, team2: match.team2 })
      setAllPlayers(match.players || [])

      // Load previously selected players
      const savedSelected = localStorage.getItem(`selectedPlayers_${matchId}`)
      if (savedSelected) {
        setSelectedPlayers(JSON.parse(savedSelected))
      }
    }
  }

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p.id === player.id)
      let newSelected: Player[]

      if (isSelected) {
        newSelected = prev.filter((p) => p.id !== player.id)
      } else if (prev.length < 11) {
        newSelected = [...prev, player]
      } else {
        alert("Maximum 11 players allowed!")
        return prev
      }

      // Save to localStorage
      localStorage.setItem(`selectedPlayers_${matchId}`, JSON.stringify(newSelected))
      return newSelected
    })
  }

  const handleContinue = () => {
    if (selectedPlayers.length < 11) {
      alert("Please select exactly 11 players!")
      return
    }
    window.location.href = `/final-team?matchId=${matchId}`
  }

  const getPlayersByPosition = (position: string) => {
    return allPlayers.filter((player) => player.position === position)
  }

  const getSelectedByPosition = (position: string) => {
    return selectedPlayers.filter((player) => player.position === position)
  }

  const getTotalCredits = () => {
    return selectedPlayers.reduce((total, player) => total + player.credits, 0)
  }

  const isPlayerSelected = (playerId: string) => {
    return selectedPlayers.some((p) => p.id === playerId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{timeLeft}</span>
            </div>
            <p className="text-xs">Select 11 players for your team</p>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Team Summary */}
      <div className="bg-gray-700 text-white p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs">Selected</div>
                <div className="text-lg font-bold">{selectedPlayers.length}/11</div>
              </div>
              {matchInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{matchInfo.team1.substring(0, 2)}</span>
                    </div>
                    <span className="text-sm">{matchInfo.team1}</span>
                  </div>
                  <span className="text-xs">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{matchInfo.team2}</span>
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">{matchInfo.team2.substring(0, 2)}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="text-center">
                <div className="text-xs">Credits</div>
                <div className="text-lg font-bold">{getTotalCredits().toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Tabs - Updated to use ALL instead of AL */}
      <div className="bg-primary text-primary-foreground p-2">
        <div className="max-w-md mx-auto flex gap-1">
          {(["WK", "BAT", "ALL", "BOW"] as const).map((position) => (
            <Button
              key={position}
              variant={currentTab === position ? "secondary" : "ghost"}
              size="sm"
              className={`flex-1 text-xs ${currentTab === position ? "bg-white text-primary" : "text-white"}`}
              onClick={() => setCurrentTab(position)}
            >
              {position}({getSelectedByPosition(position).length}/{getPlayersByPosition(position).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">PLAYER</h3>
          <h3 className="text-sm font-medium">SEL BY</h3>
          <h3 className="text-sm font-medium">CREDITS</h3>
        </div>

        <div className="space-y-3">
          {getPlayersByPosition(currentTab).map((player) => {
            const selected = isPlayerSelected(player.id)
            return (
              <Card key={player.id} className={selected ? "ring-2 ring-primary" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={player.avatar || "/placeholder.svg?height=40&width=40&query=cricket player"}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className={`absolute -bottom-1 -right-1 text-xs px-1 py-0 ${
                          player.team === matchInfo?.team1 ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                        }`}
                      >
                        {player.team.substring(0, 3)}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{player.name}</h3>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm">{player.selectedBy}%</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-medium">{player.credits}</p>
                      <Button
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        className={`w-8 h-8 p-0 mt-1 ${selected ? "" : "bg-transparent"}`}
                        onClick={() => togglePlayerSelection(player)}
                      >
                        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add more players message */}
        {getPlayersByPosition(currentTab).length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {currentTab} players available</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 mb-20">
          <Button onClick={handleContinue} className="w-full" size="lg" disabled={selectedPlayers.length !== 11}>
            Generate Final Teams ({selectedPlayers.length}/11 selected)
          </Button>
        </div>
      </div>
    </div>
  )
}
