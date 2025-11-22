"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { mockPlayers } from "@/lib/players"

interface SelectedTeam {
  wk: number
  bat: number
  al: number
  bow: number
}

export default function TeamManagementPage() {
  const [selectedPlayers, setSelectedPlayers] = useState([
    mockPlayers[0], // M Ali (WK)
    mockPlayers[1], // S Jafta (WK)
    mockPlayers[4], // L Wolvaart (BAT)
    mockPlayers[5], // T Brits (BAT)
  ])

  const [currentTab, setCurrentTab] = useState<"WK" | "BAT" | "AL" | "BOW">("WK")
  const [timeLeft, setTimeLeft] = useState("23m 22s left")

  const handleContinue = () => {
    window.location.href = "/final-team"
  }

  const getPlayersByPosition = (position: string) => {
    return selectedPlayers.filter((player) => player.position === position)
  }

  const getTotalCredits = () => {
    return selectedPlayers.reduce((total, player) => total + player.credits, 0)
  }

  const getTeamCounts = () => {
    const wk = getPlayersByPosition("WK").length
    const bat = getPlayersByPosition("BAT").length
    const al = getPlayersByPosition("AL").length
    const bow = getPlayersByPosition("BOW").length
    return { wk, bat, al, bow }
  }

  const teamCounts = getTeamCounts()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => (window.location.href = "/hash-generation")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{timeLeft}</span>
            </div>
            <p className="text-xs">Select any where between 11-24 players</p>
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
                <div className="text-xs">Players</div>
                <div className="text-lg font-bold">{selectedPlayers.length}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🇵🇰</span>
                </div>
                <span className="text-sm">PK-W</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">SA-W</span>
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🇿🇦</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs">Players</div>
                <div className="text-lg font-bold">{selectedPlayers.length}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" className="text-xs bg-transparent text-white border-white">
              Credit or role mismatch?
            </Button>
            <Button variant="outline" size="sm" className="text-xs bg-transparent text-white border-white">
              Edit
            </Button>
            <Button variant="secondary" size="sm" className="text-xs">
              📅 Booking Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Position Tabs */}
      <div className="bg-primary text-primary-foreground p-2">
        <div className="max-w-md mx-auto flex gap-1">
          {["WK", "BAT", "AL", "BOW"].map((position) => (
            <Button
              key={position}
              variant={currentTab === position ? "secondary" : "ghost"}
              size="sm"
              className={`flex-1 text-xs ${currentTab === position ? "bg-white text-primary" : "text-white"}`}
              onClick={() => setCurrentTab(position as any)}
            >
              {position}({getPlayersByPosition(position).length})
            </Button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="max-w-md mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">SELECTED BY</h3>
          <h3 className="text-sm font-medium">POINTS</h3>
          <h3 className="text-sm font-medium">CREDITS</h3>
        </div>

        <div className="space-y-3">
          {getPlayersByPosition(currentTab).map((player) => (
            <Card key={player.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={player.avatar || "/placeholder.svg"}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <Badge
                      variant="secondary"
                      className={`absolute -bottom-1 -right-1 text-xs px-1 py-0 ${
                        player.team === "PK-W" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                      }`}
                    >
                      {player.team}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{player.name}</h3>
                    <p className="text-xs text-muted-foreground">Sel by {player.selectedBy}%</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium">0</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium">{player.credits}</p>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0 mt-1 bg-transparent">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add more players message */}
        {getPlayersByPosition(currentTab).length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {currentTab} players selected</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
              Add Players
            </Button>
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8 mb-20">
          <Button onClick={handleContinue} className="w-full" size="lg">
            Generate Final Teams
          </Button>
        </div>
      </div>
    </div>
  )
}
