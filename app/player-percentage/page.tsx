"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, ArrowLeft, Home, Plus, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface Pattern {
  id: number
  lowRange: string
  lowCount: number
  highRange: string
  highCount: number
}

const patterns: Pattern[] = [
  { id: 1, lowRange: "0 - 50%", lowCount: 4, highRange: "50 - 100%", highCount: 7 },
  { id: 2, lowRange: "0 - 50%", lowCount: 5, highRange: "50 - 100%", highCount: 6 },
  { id: 3, lowRange: "0 - 50%", lowCount: 6, highRange: "50 - 100%", highCount: 5 },
  { id: 4, lowRange: "0 - 50%", lowCount: 7, highRange: "50 - 100%", highCount: 4 },
  { id: 5, lowRange: "0 - 50%", lowCount: 1, highRange: "50 - 100%", highCount: 10 },
]

const teamPartitions = [
  { id: "balanced", name: "Balanced", ratio: "6:5 or 5:6" },
  { id: "favor-team1", name: "Favor Team 1", ratio: "7:4" },
  { id: "favor-team2", name: "Favor Team 2", ratio: "4:7" },
  { id: "mini-1", name: "Mini 1 (Risky)", ratio: "1:10 or 10:1" },
  { id: "maxi-all", name: "Max All (One Sided)", ratio: "7:4 (Max Limit)" },
]

export default function PlayerPercentagePage() {
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([])
  const [selectedPartition, setSelectedPartition] = useState<string>("balanced")
  const [currentTab, setCurrentTab] = useState<"pattern-1" | "pattern-2">("pattern-1")
  const [matchName, setMatchName] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get("matchId")

  useEffect(() => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const match = matches.find((m: any) => m.id === matchId)
      if (match) {
        setMatchName(match.name)
      }
    }
  }, [matchId])

  const handlePatternSelect = (patternId: number) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId) ? prev.filter((id) => id !== patternId) : [...prev, patternId],
    )
  }

  const handlePartitionSelect = (partitionId: string) => {
    setSelectedPartition(partitionId)
    localStorage.setItem("teamPartitionStrategy", partitionId)
  }

  const handleSuggestion = () => {
    setSelectedPatterns([1, 2, 3])
    handlePartitionSelect("balanced")
  }

  const handleContinue = () => {
    router.push(`/credit-range?matchId=${matchId}`)
  }

  const handleSkip = () => {
    router.push(`/credit-range?matchId=${matchId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => router.push(`/player-selection?matchId=${matchId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="text-center">
              <h1 className="font-bold text-lg">🏏 Team Partition</h1>
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

      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🎯 Player Selection Strategy</h2>
          <div className="text-sm text-gray-600 mb-2">AI-powered cricket fantasy insights</div>
          <div className="text-sm text-gray-600 mb-2">
            Select <span className="font-semibold text-green-600">1 or More Patterns</span> for optimal teams
          </div>
          <div className="text-sm text-gray-600">
            New to this? Let our{" "}
            <span className="font-semibold text-blue-600 cursor-pointer" onClick={handleSkip}>
              AI guide you
            </span>
          </div>
        </div>

        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={currentTab === "pattern-1" ? "default" : "ghost"}
            className={`flex-1 rounded-md ${currentTab === "pattern-1" ? "bg-green-500 text-white" : "text-gray-600"}`}
            onClick={() => setCurrentTab("pattern-1")}
          >
            🏆 Balanced
          </Button>
          <Button
            variant={currentTab === "pattern-2" ? "default" : "ghost"}
            className={`flex-1 rounded-md ${currentTab === "pattern-2" ? "bg-blue-500 text-white" : "text-gray-600"}`}
            onClick={() => setCurrentTab("pattern-2")}
          >
            ⚡ Aggressive
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          {patterns.map((pattern) => (
            <Card
              key={pattern.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedPatterns.includes(pattern.id)
                  ? "ring-2 ring-green-400 border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-green-200"
              }`}
              onClick={() => handlePatternSelect(pattern.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">🔻 Low Risk Players</span>
                      <span className="text-lg font-bold text-green-600">{pattern.lowCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🔥 High Impact Players</span>
                      <span className="text-lg font-bold text-blue-600">{pattern.highCount}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {selectedPatterns.includes(pattern.id) ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent border-green-300">
                        <Plus className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Team Partition (Team A : Team B)</h3>
          <div className="grid grid-cols-2 gap-2">
            {teamPartitions.map((partition) => (
              <Button
                key={partition.id}
                variant={selectedPartition === partition.id ? "default" : "outline"}
                className={`h-auto py-2 flex flex-col items-center justify-center ${
                  selectedPartition === partition.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "bg-white hover:bg-blue-50 text-gray-700 border-gray-200"
                }`}
                onClick={() => handlePartitionSelect(partition.id)}
              >
                <span className="font-bold text-md">{partition.ratio}</span>
                <span className="text-xs opacity-80">{partition.name}</span>
              </Button>
            ))}
          </div>
        </div>
        {/* </CHANGE> */}

        <div className="flex gap-3 mb-6">
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            onClick={handleSuggestion}
          >
            <Sparkles className="h-4 w-4 mr-2" />✨ Gemini Suggest
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-gray-300 text-gray-600 bg-transparent"
          >
            Skip
          </Button>
          <Button onClick={handleContinue} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            Continue 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
