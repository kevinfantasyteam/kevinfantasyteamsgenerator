"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Home, Plus, Brain, TrendingUp, Target } from "lucide-react"
import Link from "next/link"
import { PlayerCard } from "@/components/player-card"
import { useSearchParams } from "next/navigation"

type SelectionType = "captain" | "vice-captain" | "fixed" | "team-partition"

interface Player {
  id: string
  name: string
  position: string
  selectedBy: string
  credits: string
  team: string
  avatar?: string
  captainSel?: string
  viceCaptainSel?: string
}

interface Match {
  id: string
  team1: string
  team2: string
  date: string
  time: string
  venue: string
  team1Players: Player[]
  team2Players: Player[]
}

export default function PlayerSelectionPage() {
  const [currentSection, setCurrentSection] = useState<SelectionType>("captain")
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [match, setMatch] = useState<Match | null>(null)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string>("")
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")

  useEffect(() => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const foundMatch = matches.find((m: any) => m.id === matchId)
      if (foundMatch) {
        const allPlayers = [...foundMatch.team1Players, ...foundMatch.team2Players]
        setPlayers(allPlayers)
        setMatch(foundMatch)
      }
    }
  }, [matchId])

  const getPlayersByStrategy = (strategy: string) => {
    switch (strategy) {
      case "differential":
        return players.filter((p) => Number.parseFloat(p.selectedBy) >= 0 && Number.parseFloat(p.selectedBy) <= 35)
      case "balanced":
        return players.filter((p) => Number.parseFloat(p.selectedBy) > 35 && Number.parseFloat(p.selectedBy) <= 75)
      case "popular":
        return players.filter((p) => Number.parseFloat(p.selectedBy) > 75 && Number.parseFloat(p.selectedBy) <= 100)
      default:
        return players
    }
  }

  const getAICaptainSuggestions = () => {
    const sortedPlayers = players
      .filter((p) => Number.parseFloat(p.captainSel || "0") > 0)
      .sort((a, b) => Number.parseFloat(b.captainSel || "0") - Number.parseFloat(a.captainSel || "0"))
    return sortedPlayers.slice(0, 3)
  }

  const getMatchAnalysis = () => {
    const team1AvgCredits =
      match?.team1Players.reduce((sum, p) => sum + Number.parseFloat(p.credits), 0) / (match?.team1Players.length || 1)
    const team2AvgCredits =
      match?.team2Players.reduce((sum, p) => sum + Number.parseFloat(p.credits), 0) / (match?.team2Players.length || 1)

    return {
      venue: match?.venue || "Unknown Venue",
      team1Strength: team1AvgCredits > team2AvgCredits ? "Stronger" : "Weaker",
      team2Strength: team2AvgCredits > team1AvgCredits ? "Stronger" : "Weaker",
      recommendation: team1AvgCredits > team2AvgCredits ? match?.team1 : match?.team2,
      topPicks: players.sort((a, b) => Number.parseFloat(b.selectedBy) - Number.parseFloat(a.selectedBy)).slice(0, 3),
    }
  }

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]))
  }

  const handleSuggestion = () => {
    let suggestedPlayers: Player[] = []

    if (currentSection === "captain") {
      suggestedPlayers = getAICaptainSuggestions()
    } else if (selectedStrategy) {
      suggestedPlayers = getPlayersByStrategy(selectedStrategy).slice(0, 3)
    } else {
      const availablePlayers = players.filter((p) => !selectedPlayers.includes(p.id))
      suggestedPlayers = availablePlayers
        .sort((a, b) => Number.parseFloat(b.selectedBy) - Number.parseFloat(a.selectedBy))
        .slice(0, 3)
    }

    const suggested = suggestedPlayers.map((p) => p.id)
    setSelectedPlayers((prev) => [...prev, ...suggested])
  }

  const handleContinue = () => {
    const selectionData = {
      matchId,
      captainOptions:
        currentSection === "captain" ? selectedPlayers : JSON.parse(localStorage.getItem("captainOptions") || "[]"),
      viceCaptainOptions:
        currentSection === "vice-captain"
          ? selectedPlayers
          : JSON.parse(localStorage.getItem("viceCaptainOptions") || "[]"),
      fixedPlayers:
        currentSection === "fixed" ? selectedPlayers : JSON.parse(localStorage.getItem("fixedPlayers") || "[]"),
    }

    if (currentSection === "captain") {
      localStorage.setItem("captainOptions", JSON.stringify(selectedPlayers))
      setSelectedPlayers([]) // Reset for next section
      setCurrentSection("vice-captain")
    } else if (currentSection === "vice-captain") {
      localStorage.setItem("viceCaptainOptions", JSON.stringify(selectedPlayers))
      setSelectedPlayers([]) // Reset for next section
      setCurrentSection("fixed")
    } else if (currentSection === "fixed") {
      localStorage.setItem("fixedPlayers", JSON.stringify(selectedPlayers))
      setSelectedPlayers([]) // Reset for next section
      setCurrentSection("team-partition")
    } else {
      // Store all selection data before moving to next page
      localStorage.setItem("playerSelections", JSON.stringify(selectionData))
      window.location.href = `/player-percentage?matchId=${matchId}`
    }
  }

  const getSectionTitle = () => {
    switch (currentSection) {
      case "captain":
        return "🏏 AI Captain Selection"
      case "vice-captain":
        return "⭐ AI Vice Captain Selection"
      case "fixed":
        return "🔒 Fixed Player Selection"
      case "team-partition":
        return "🎯 Team Partition Strategy"
      default:
        return "Player Selection"
    }
  }

  const getSectionDescription = () => {
    switch (currentSection) {
      case "captain":
        return "AI analyzes captain selection % and recent form\nSelect 1 or more potential captains"
      case "vice-captain":
        return "AI suggests vice-captains based on consistency\nSelect 2 or more potential vice-captains"
      case "fixed":
        return "Lock guaranteed performers in every team\nSelect 0-8 must-have players"
      case "team-partition":
        return "AI-powered team balance strategies\nChoose your preferred approach"
      default:
        return ""
    }
  }

  const getColorClass = () => {
    switch (currentSection) {
      case "captain":
        return "border-orange-500"
      case "vice-captain":
        return "border-purple-500"
      case "fixed":
        return "border-red-500"
      case "team-partition":
        return "border-blue-500"
      default:
        return "border-primary"
    }
  }

  const wicketKeepers = players.filter((p) => p.position === "WK")
  const batsmen = players.filter((p) => p.position === "BAT")
  const allRounders = players.filter((p) => p.position === "ALL")
  const bowlers = players.filter((p) => p.position === "BOWL")

  if (currentSection === "team-partition") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setCurrentSection("fixed")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-300" />
              <div className="text-center">
                <h1 className="font-bold text-lg">🏏 AI Team Generator</h1>
                <p className="text-sm opacity-90">Cricket Intelligence Platform</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto p-4">
          {match && (
            <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">
                  🏆 {match.team1} vs {match.team2}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  className="text-xs"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  AI Analysis
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                📍 {match.venue} • 📅 {match.date}
              </p>
            </div>
          )}

          {showAIAnalysis && (
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4 border">
              <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2" />🤖 AI Match Analysis
              </h4>
              {(() => {
                const analysis = getMatchAnalysis()
                return (
                  <div className="space-y-2 text-sm">
                    <p>
                      🏟️ <strong>Venue:</strong> {analysis.venue}
                    </p>
                    <p>
                      ⚡ <strong>Recommended Team:</strong> {analysis.recommendation}
                    </p>
                    <p>
                      🎯 <strong>Top AI Picks:</strong> {analysis.topPicks.map((p) => p.name).join(", ")}
                    </p>
                  </div>
                )
              })()}
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{getSectionTitle()}</h2>
            <div className="border-b-2 border-blue-500 pb-2 mb-4">
              <p className="text-sm text-gray-600 whitespace-pre-line">{getSectionDescription()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />🎯 AI Selection Strategies
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant={selectedStrategy === "differential" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("differential")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">0-35%</span>
                <span>Differential</span>
              </Button>
              <Button
                variant={selectedStrategy === "balanced" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("balanced")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">36-75%</span>
                <span>Balanced</span>
              </Button>
              <Button
                variant={selectedStrategy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("popular")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">76-100%</span>
                <span>Popular</span>
              </Button>
            </div>
            {selectedStrategy && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Strategy Info:</strong>{" "}
                {selectedStrategy === "differential"
                  ? "Low ownership players for unique teams"
                  : selectedStrategy === "balanced"
                    ? "Mix of popular and differential picks"
                    : "High ownership safe players"}
              </div>
            )}
          </div>

          {/* Team Partition Options */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <Button variant="outline" className="text-sm bg-white shadow">
                📊 Classic Partition
              </Button>
              <Button variant="outline" className="text-sm bg-white shadow">
                🚀 AI Partition
              </Button>
            </div>

            {/* Partition Strategies */}
            <div className="space-y-3">
              {[
                { team1: 4, team2: 7, risk: "Low", potential: "Safe" },
                { team1: 5, team2: 6, risk: "Medium", potential: "Balanced" },
                { team1: 6, team2: 5, risk: "Medium", potential: "Balanced" },
                { team1: 7, team2: 4, risk: "High", potential: "Risky" },
              ].map((strategy, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🏏</span>
                        </div>
                        <span className="text-sm font-medium">{match?.team1 || "Team 1"}</span>
                        <span className="text-lg font-bold text-green-600">{strategy.team1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🏏</span>
                        </div>
                        <span className="text-sm font-medium">{match?.team2 || "Team 2"}</span>
                        <span className="text-lg font-bold text-blue-600">{strategy.team2}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{strategy.risk} Risk</div>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0 mt-1 bg-transparent">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="secondary"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              onClick={handleSuggestion}
            >
              <Brain className="h-4 w-4 mr-2" />🤖 AI Suggest
            </Button>
            <Button onClick={handleContinue} className="flex-1 bg-gradient-to-r from-green-500 to-blue-500">
              Continue 🚀
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => {
              if (currentSection === "captain") {
                window.location.href = "/"
              } else if (currentSection === "vice-captain") {
                setCurrentSection("captain")
              } else if (currentSection === "fixed") {
                setCurrentSection("vice-captain")
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="text-center">
              <h1 className="font-bold text-lg">🏏 AI Team Generator</h1>
              <p className="text-sm opacity-90">Cricket Intelligence Platform</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {match && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">
                🏆 {match.team1} vs {match.team2}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                className="text-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                AI Analysis
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              📍 {match.venue} • 📅 {match.date}
            </p>
          </div>
        )}

        {showAIAnalysis && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4 border">
            <h4 className="font-bold text-purple-800 mb-3 flex items-center">
              <Brain className="h-4 w-4 mr-2" />🤖 AI{" "}
              {currentSection === "captain" ? "Captain" : currentSection === "vice-captain" ? "Vice-Captain" : "Player"}{" "}
              Analysis
            </h4>
            {currentSection === "captain" && (
              <div className="space-y-2 text-sm">
                <p>
                  ⭐ <strong>Top AI Captain Picks:</strong>
                </p>
                {getAICaptainSuggestions().map((player, idx) => (
                  <div key={player.id} className="flex justify-between bg-white p-2 rounded">
                    <span>
                      {idx + 1}. {player.name}
                    </span>
                    <span className="text-green-600 font-bold">{player.captainSel}% C</span>
                  </div>
                ))}
              </div>
            )}
            {currentSection !== "captain" && (
              <div className="space-y-2 text-sm">
                <p>
                  🎯 <strong>Selection Strategy:</strong> {selectedStrategy || "Balanced approach"}
                </p>
                <p>
                  📊 <strong>Recommended Players:</strong>{" "}
                  {selectedStrategy
                    ? getPlayersByStrategy(selectedStrategy)
                        .slice(0, 3)
                        .map((p) => p.name)
                        .join(", ")
                    : "Mix of popular and differential picks"}
                </p>
              </div>
            )}
          </div>
        )}

        {currentSection !== "captain" && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />📈 Selection Strategy
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedStrategy === "differential" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("differential")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">0-35%</span>
                <span>Differential</span>
              </Button>
              <Button
                variant={selectedStrategy === "balanced" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("balanced")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">36-75%</span>
                <span>Balanced</span>
              </Button>
              <Button
                variant={selectedStrategy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy("popular")}
                className="text-xs flex flex-col p-2 h-auto"
              >
                <span className="font-bold">76-100%</span>
                <span>Popular</span>
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{getSectionTitle()}</h2>
          <div className={`border-b-2 ${getColorClass()} pb-2 mb-4`}>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{getSectionDescription()}</p>
          </div>
        </div>

        {/* Player Lists */}
        <div className="space-y-6">
          {/* Wicket Keepers */}
          {wicketKeepers.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🥅 Wicket Keeper
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {wicketKeepers.length} players
                </span>
              </h3>
              <div className="space-y-2">
                {wicketKeepers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.includes(player.id)}
                    onSelect={handlePlayerSelect}
                    showCaptainInfo={currentSection === "captain"}
                    showViceCaptainInfo={currentSection === "vice-captain"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Batsmen */}
          {batsmen.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🏏 Batsman
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {batsmen.length} players
                </span>
              </h3>
              <div className="space-y-2">
                {batsmen.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.includes(player.id)}
                    onSelect={handlePlayerSelect}
                    showCaptainInfo={currentSection === "captain"}
                    showViceCaptainInfo={currentSection === "vice-captain"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Rounders */}
          {allRounders.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                ⚡ All Rounder
                <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {allRounders.length} players
                </span>
              </h3>
              <div className="space-y-2">
                {allRounders.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.includes(player.id)}
                    onSelect={handlePlayerSelect}
                    showCaptainInfo={currentSection === "captain"}
                    showViceCaptainInfo={currentSection === "vice-captain"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bowlers */}
          {bowlers.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🎯 Bowler
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {bowlers.length} players
                </span>
              </h3>
              <div className="space-y-2">
                {bowlers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.includes(player.id)}
                    onSelect={handlePlayerSelect}
                    showCaptainInfo={currentSection === "captain"}
                    showViceCaptainInfo={currentSection === "vice-captain"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 mb-20">
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            onClick={handleSuggestion}
          >
            <Brain className="h-4 w-4 mr-2" />🤖 AI Suggest
          </Button>
          <Button onClick={handleContinue} className="flex-1 bg-gradient-to-r from-green-500 to-blue-500">
            Continue 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
