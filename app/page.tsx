"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, Users, Hash, Settings } from "lucide-react"

interface Match {
  id: string
  teamName1: string
  teamName2: string
  date: string
  time: string
  tournament: string
  team1Players: any[]
  team2Players: any[]
}

export default function HomePage() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="font-bold text-lg">Team Generation</h1>
              <p className="text-sm opacity-90">Associated with KevinFantasy</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={handleAdminAccess}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Sports Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button variant="default" size="sm" className="flex-1 text-xs">
            Cricket
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            Football
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            Basketball
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            Kabaddi
          </Button>
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Matches</h2>
            <Button variant="outline" size="sm" className="text-xs bg-transparent">
              <Users className="h-3 w-3 mr-1" />
              Saved Matches
            </Button>
          </div>

          {matches.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Matches Available</h3>
                <p className="text-sm text-muted-foreground mb-4">Admin needs to add matches first</p>
                <Button onClick={handleAdminAccess} variant="outline">
                  Access Admin Panel
                </Button>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card
                key={match.id}
                className={`cursor-pointer transition-all ${selectedMatch === match.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => handleMatchSelect(match.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {match.tournament}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      {(match.team1Players?.length || 0) + (match.team2Players?.length || 0)} Players
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-1">
                          <span className="text-white text-xs font-bold">{match.teamName1.substring(0, 2)}</span>
                        </div>
                        <span className="text-xs font-medium">{match.teamName1}</span>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{getTimeRemaining(match.date, match.time)}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                          <span className="text-white text-xs font-bold">{match.teamName2.substring(0, 2)}</span>
                        </div>
                        <span className="text-xs font-medium">{match.teamName2}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        save
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        ⚙️
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Continue Button */}
        {selectedMatch && (
          <Button onClick={handleContinue} className="w-full mt-6" size="lg">
            Next
          </Button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t">
        <div className="max-w-md mx-auto flex">
          <Button variant="ghost" className="flex-1 flex-col gap-1 h-16 rounded-none">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col gap-1 h-16 rounded-none">
            <Clock className="h-4 w-4" />
            <span className="text-xs">My matches</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col gap-1 h-16 rounded-none">
            <Users className="h-4 w-4" />
            <span className="text-xs">Research</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex-col gap-1 h-16 rounded-none">
            <Hash className="h-4 w-4" />
            <span className="text-xs">User</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
