"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"

interface Player {
  id: string
  name: string
  position: string // Changed from 'role' to 'position'
  selectedBy: string // Changed from 'selectionPercentage' to 'selectedBy'
  credits: string // Keep as string
  team: string
  avatar?: string
  captainSel?: string
  viceCaptainSel?: string
}

interface Match {
  id: string
  teamName1: string
  teamName2: string
  date: string
  time: string
  tournament: string
  venue?: string // Added venue field
  team1Players: Player[]
  team2Players: Player[]
  players: Player[]
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentMatch, setCurrentMatch] = useState<Partial<Match>>({
    teamName1: "",
    teamName2: "",
    date: "",
    time: "",
    tournament: "",
    venue: "", // Initialize venue
    team1Players: [],
    team2Players: [],
    players: [],
  })

  const [team1PlayersText, setTeam1PlayersText] = useState("")
  const [team2PlayersText, setTeam2PlayersText] = useState("")

  useEffect(() => {
    const savedMatches = localStorage.getItem("adminMatches")
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches))
    }
  }, [])

  const parsePlayersFromText = (text: string, teamName: string): Player[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    return lines
      .map((line) => {
        const match = line.match(/^(.+?)\s+([a-zA-Z-/]+)\s+([0-9.]+)%\s+([0-9.]+)$/)
        if (match) {
          let role = match[2].toUpperCase()
          if (["ALL", "AL", "AR", "ALLROUNDER", "ALL-ROUNDER", "ALL ROUNDER"].includes(role)) role = "ALL"
          else if (["BOW", "BOWL", "BOWLER"].includes(role)) role = "BOW"
          else if (["BAT", "BATSMAN", "BATTER"].includes(role)) role = "BAT"
          else if (["WK", "WICKETKEEPER", "KEEPER"].includes(role)) role = "WK"

          if (["WK", "BAT", "ALL", "BOW"].includes(role)) {
            return {
              id: `${teamName}-${match[1].trim().replace(/\s+/g, "-")}-${Date.now()}`,
              name: match[1].trim(),
              position: role,
              selectedBy: match[3],
              credits: match[4],
              team: teamName,
              avatar: `/placeholder.svg?height=40&width=40&query=${match[1].trim()}`,
              captainSel: `${Math.floor(Math.random() * 30 + 10)}%`,
              viceCaptainSel: `${Math.floor(Math.random() * 20 + 5)}%`,
            }
          }
        }
        return null
      })
      .filter(Boolean) as Player[]
  }

  const saveMatch = () => {
    if (currentMatch.teamName1 && currentMatch.teamName2 && currentMatch.date && currentMatch.time) {
      const team1ParsedPlayers = parsePlayersFromText(team1PlayersText, currentMatch.teamName1)
      const team2ParsedPlayers = parsePlayersFromText(team2PlayersText, currentMatch.teamName2)

      const newMatch = {
        id: Date.now().toString(),
        teamName1: currentMatch.teamName1!,
        teamName2: currentMatch.teamName2!,
        date: currentMatch.date!,
        time: currentMatch.time!,
        tournament: currentMatch.tournament || "Tournament",
        venue: currentMatch.venue || "TBD", // Include venue in saved match
        team1Players: team1ParsedPlayers,
        team2Players: team2ParsedPlayers,
        players: [...team1ParsedPlayers, ...team2ParsedPlayers],
      }

      const updatedMatches = [...matches, newMatch]
      setMatches(updatedMatches)

      localStorage.setItem("adminMatches", JSON.stringify(updatedMatches))

      // Reset form
      setCurrentMatch({
        teamName1: "",
        teamName2: "",
        date: "",
        time: "",
        tournament: "",
        venue: "", // Reset venue
        team1Players: [],
        team2Players: [],
        players: [],
      })
      setTeam1PlayersText("")
      setTeam2PlayersText("")
      alert("Match added successfully!")
    }
  }

  const removeMatch = (matchId: string) => {
    const updatedMatches = matches.filter((match) => match.id !== matchId)
    setMatches(updatedMatches)
    localStorage.setItem("adminMatches", JSON.stringify(updatedMatches))
  }

  const fetchMatchData = () => {
    // Simulate API call delay
    const now = new Date()
    now.setDate(now.getDate() + 1)
    const dateStr = now.toISOString().split("T")[0]

    setCurrentMatch({
      teamName1: "IND",
      teamName2: "AUS",
      date: dateStr,
      time: "14:30",
      tournament: "World Cup 2025",
      venue: "Wankhede Stadium, Mumbai",
      team1Players: [],
      team2Players: [],
      players: [],
    })

    setTeam1PlayersText(
      "Rohit Sharma BAT 85.5% 9.0\nVirat Kohli BAT 92.1% 9.5\nShubman Gill BAT 78.4% 8.5\nKL Rahul WK 65.2% 8.5\nHardik Pandya ALL 88.7% 9.0\nRavindra Jadeja ALL 75.3% 8.5\nJasprit Bumrah BOW 90.5% 9.0\nMohammed Siraj BOW 60.2% 8.5\nKuldeep Yadav BOW 70.8% 8.5\nShreyas Iyer BAT 45.6% 8.0\nIshan Kishan WK 30.2% 8.0",
    )

    setTeam2PlayersText(
      "Travis Head BAT 82.4% 9.0\nDavid Warner BAT 75.6% 9.0\nSteve Smith BAT 68.9% 8.5\nGlenn Maxwell ALL 85.2% 9.0\nMarcus Stoinis ALL 55.4% 8.5\nAlex Carey WK 40.2% 8.0\nPat Cummins BOW 88.5% 9.0\nMitchell Starc BOW 72.3% 9.0\nAdam Zampa BOW 65.8% 8.5\nJosh Hazlewood BOW 58.2% 8.5\nMarnus Labuschagne BAT 42.1% 8.0",
    )

    alert("Match data fetched successfully! Click Save Match to add it.")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 z-10">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
              onClick={() => (window.location.href = "/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="font-bold text-lg">Admin Panel</h1>
              <p className="text-sm opacity-90">KevinFantasy Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 p-4 md:p-8 space-y-6 overflow-auto">
          {/* Add Match Form */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Match
              </CardTitle>
              <Button
                onClick={fetchMatchData}
                variant="outline"
                className="gap-2 border-primary text-primary bg-transparent"
              >
                <Wand2 className="h-4 w-4" />
                Auto Fetch Match
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team1">Team 1 Name</Label>
                  <Input
                    id="team1"
                    value={currentMatch.teamName1}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, teamName1: e.target.value }))}
                    placeholder="e.g., PK-W"
                  />
                </div>
                <div>
                  <Label htmlFor="team2">Team 2 Name</Label>
                  <Input
                    id="team2"
                    value={currentMatch.teamName2}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, teamName2: e.target.value }))}
                    placeholder="e.g., SA-W"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentMatch.date}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={currentMatch.time}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tournament">Tournament</Label>
                  <Input
                    id="tournament"
                    value={currentMatch.tournament}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, tournament: e.target.value }))}
                    placeholder="e.g., ODI, T20, Test"
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={currentMatch.venue}
                    onChange={(e) => setCurrentMatch((prev) => ({ ...prev, venue: e.target.value }))}
                    placeholder="e.g., Lord's, MCG, Eden Gardens"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Players (Team Wise)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Format: Name + Position + SelectedBy% + Credits (no spaces between components)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team1Players" className="text-base font-semibold">
                    {currentMatch.teamName1 || "BAN"} Players
                  </Label>
                  <div className="mb-2 p-3 bg-blue-50 rounded-md border">
                    <p className="text-sm font-medium text-blue-800 mb-1">Format: Name Position SelectedBy% Credits</p>
                    <p className="text-xs text-blue-600">Example:</p>
                    <p className="text-xs font-mono text-blue-700">P Nissanka BAT 80.32% 9</p>
                    <p className="text-xs font-mono text-blue-700">N Fernando BAT 1.14% 8</p>
                  </div>
                  <Textarea
                    id="team1Players"
                    value={team1PlayersText}
                    onChange={(e) => setTeam1PlayersText(e.target.value)}
                    placeholder="P Nissanka BAT 80.32% 9&#10;N Fernando BAT 1.14% 8&#10;S Williams BAT 81.36% 9&#10;K Mendis WK 75.20% 8"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="team2Players" className="text-base font-semibold">
                    {currentMatch.teamName2 || "NED"} Players
                  </Label>
                  <div className="mb-2 p-3 bg-green-50 rounded-md border">
                    <p className="text-sm font-medium text-green-800 mb-1">Format: Name Position SelectedBy% Credits</p>
                    <p className="text-xs text-green-600">Example:</p>
                    <p className="text-xs font-mono text-green-700">B Curran BAT 70.93% 8</p>
                    <p className="text-xs font-mono text-green-700">B Taylor WK 25.17% 8</p>
                  </div>
                  <Textarea
                    id="team2Players"
                    value={team2PlayersText}
                    onChange={(e) => setTeam2PlayersText(e.target.value)}
                    placeholder="B Curran BAT 70.93% 8&#10;B Taylor WK 25.17% 8&#10;S Williams BAT 81.36% 9&#10;D Miller ALL 65.40% 7"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Match Button */}
          <Button onClick={saveMatch} className="w-full" size="lg">
            Save Match
          </Button>

          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Added Matches ({matches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div key={match.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {match.teamName1} vs {match.teamName2}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{match.tournament}</span>
                          <Button variant="destructive" size="sm" onClick={() => removeMatch(match.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {match.date} at {match.time} • {match.venue}
                      </div>
                      <div className="text-sm">Players: {match.players.length}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
