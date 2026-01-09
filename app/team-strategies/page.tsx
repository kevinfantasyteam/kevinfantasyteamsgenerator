"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Home, Plus, Check } from "lucide-react"
import Link from "next/link"

type StrategyType = "player-percentage" | "team-combinations"

interface PlayerPercentagePattern {
  id: string
  lowRange: string
  highRange: string
  lowCount: number
  highCount: number
}

interface TeamCombination {
  id: string
  wk: number
  bat: number
  all: number // Changed from "al" to "all" for consistency
  bow: number
}

const playerPercentagePatterns: PlayerPercentagePattern[] = [
  { id: "1", lowRange: "0 - 50%", highRange: "50 - 100%", lowCount: 4, highCount: 7 },
  { id: "2", lowRange: "0 - 50%", highRange: "50 - 100%", lowCount: 5, highCount: 6 },
  { id: "3", lowRange: "0 - 50%", highRange: "50 - 100%", lowCount: 6, highCount: 5 },
  { id: "4", lowRange: "0 - 50%", highRange: "50 - 100%", lowCount: 7, highCount: 4 },
  { id: "5", lowRange: "0 - 50%", highRange: "50 - 100%", lowCount: 1, highCount: 10 },
]

const teamCombinations: TeamCombination[] = [
  { id: "1", wk: 1, bat: 3, all: 2, bow: 5 },
  { id: "2", wk: 1, bat: 3, all: 3, bow: 4 },
  { id: "3", wk: 1, bat: 4, all: 3, bow: 3 },
  { id: "4", wk: 1, bat: 4, all: 2, bow: 4 },
  { id: "5", wk: 1, bat: 5, all: 2, bow: 3 },
  { id: "6", wk: 1, bat: 3, all: 4, bow: 3 },
  { id: "7", wk: 2, bat: 3, all: 3, bow: 3 },
  { id: "8", wk: 2, bat: 3, all: 2, bow: 4 },
  { id: "9", wk: 2, bat: 4, all: 2, bow: 3 },
  { id: "10", wk: 3, bat: 3, all: 2, bow: 3 },
]

export default function TeamStrategiesPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")

  const [currentStrategy, setCurrentStrategy] = useState<StrategyType>("player-percentage")
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>([])

  useEffect(() => {
    if (matchId) {
      const savedPatterns = localStorage.getItem(`patterns_${matchId}`)
      const savedCombinations = localStorage.getItem(`combinations_${matchId}`)
      if (savedPatterns) setSelectedPatterns(JSON.parse(savedPatterns))
      if (savedCombinations) setSelectedCombinations(JSON.parse(savedCombinations))
    }
  }, [matchId])

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatterns((prev) => {
      const newPatterns = prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId]
      localStorage.setItem(`patterns_${matchId}`, JSON.stringify(newPatterns))
      return newPatterns
    })
  }

  const handleCombinationSelect = (combinationId: string) => {
    setSelectedCombinations((prev) => {
      const newCombinations = prev.includes(combinationId)
        ? prev.filter((id) => id !== combinationId)
        : [...prev, combinationId]
      localStorage.setItem(`combinations_${matchId}`, JSON.stringify(newCombinations))
      return newCombinations
    })
  }

  const handleContinue = () => {
    if (currentStrategy === "player-percentage") {
      setCurrentStrategy("team-combinations")
    } else {
      window.location.href = `/hash-generation?matchId=${matchId}`
    }
  }

  const handleSkip = () => {
    if (currentStrategy === "player-percentage") {
      setCurrentStrategy("team-combinations")
    } else {
      window.location.href = `/hash-generation?matchId=${matchId}`
    }
  }

  if (currentStrategy === "player-percentage") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
              onClick={() => (window.location.href = `/player-selection?matchId=${matchId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <div className="text-center">
                <h1 className="font-bold text-lg">Team Generation</h1>
                <p className="text-sm opacity-90">Associated with Believer01</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto p-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Player % Selection Strategy</h2>
            <p className="text-sm text-muted-foreground mb-1">This is a new Observation found in fantasy</p>
            <p className="text-sm text-muted-foreground mb-1">
              if have idea select <span className="font-medium">1 or More</span>
            </p>
            <p className="text-sm text-muted-foreground">
              If don't know about this you can <span className="font-medium text-blue-600">Click on Skip</span>
            </p>
          </div>

          {/* Pattern Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
            <Button variant="default" size="sm" className="flex-1 text-xs">
              Pattern-1
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-xs">
              Pattern-2
            </Button>
          </div>

          {/* Pattern Options */}
          <div className="space-y-3 mb-6">
            {playerPercentagePatterns.map((pattern) => {
              const isSelected = selectedPatterns.includes(pattern.id)
              return (
                <div
                  key={pattern.id}
                  className={`bg-card rounded-lg p-4 border ${isSelected ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{pattern.lowRange}</span>
                        <span className="text-lg font-bold">{pattern.lowCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{pattern.highRange}</span>
                        <span className="text-lg font-bold">{pattern.highCount}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={`w-8 h-8 p-0 ml-4 ${isSelected ? "" : "bg-transparent"}`}
                      onClick={() => handlePatternSelect(pattern.id)}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button variant="secondary" className="flex-1">
              Suggestion
            </Button>
            <Button variant="outline" onClick={handleSkip} className="flex-1 bg-transparent">
              Skip
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground"
            onClick={() => setCurrentStrategy("player-percentage")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div className="text-center">
              <h1 className="font-bold text-lg">Team Generation</h1>
              <p className="text-sm opacity-90">Associated with Believer01</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Team Combinations</h2>
          <p className="text-sm text-muted-foreground mb-1">Select Proper Combinations for Winning Teams</p>
          <p className="text-sm text-muted-foreground">
            Follow intructions by Believer01 and select <span className="font-medium">1 or More Combinations</span>
          </p>
        </div>

        {/* Combination Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6">
          <Button variant="default" size="sm" className="flex-1 text-xs">
            Old Combinations
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            New Combinations
          </Button>
        </div>

        {/* Team Combinations - Updated labels to ALL instead of AL */}
        <div className="space-y-3 mb-6">
          {teamCombinations.map((combination) => {
            const isSelected = selectedCombinations.includes(combination.id)
            return (
              <div
                key={combination.id}
                className={`bg-card rounded-lg p-4 border ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">WK</div>
                      <div className="text-lg font-bold">{combination.wk}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">BAT</div>
                      <div className="text-lg font-bold">{combination.bat}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">ALL</div>
                      <div className="text-lg font-bold">{combination.all}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">BOW</div>
                      <div className="text-lg font-bold">{combination.bow}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`w-8 h-8 p-0 ${isSelected ? "" : "bg-transparent"}`}
                    onClick={() => handleCombinationSelect(combination.id)}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline" className="flex-1 bg-transparent">
            Custom
          </Button>
          <Button variant="secondary" className="flex-1">
            Suggestion
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
