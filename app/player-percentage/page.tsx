"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, ArrowLeft, Home, Plus, Sparkles, Settings, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

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

export default function PlayerPercentagePage() {
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([])
  const [currentTab, setCurrentTab] = useState<"pattern-1" | "pattern-2">("pattern-1")
  const [showCustom, setShowCustom] = useState(false)
  const [customPartition, setCustomPartition] = useState({ lowCount: 4, highCount: 7 })
  const [customPatternsList, setCustomPatternsList] = useState<Pattern[]>([])
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

  const handleCustomSave = () => {
    const newId = 2000 + customPatternsList.length + 1
    const newPattern: Pattern = {
      id: newId,
      lowRange: "0 - 50%",
      lowCount: customPartition.lowCount,
      highRange: "50 - 100%",
      highCount: customPartition.highCount,
    }
    setCustomPatternsList((prev) => [...prev, newPattern])
    setSelectedPatterns((prev) => [...prev, newId])
    setShowCustom(false)
  }

  const handleSuggestion = () => {
    setSelectedPatterns([1, 2, 3])
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

        {showCustom && (
          <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-purple-700">🎨 Custom Partition</h3>
                <Button size="sm" variant="ghost" onClick={() => setShowCustom(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm text-gray-600">🔻 Low Risk (0-50%)</Label>
                    <span className="font-bold">{customPartition.lowCount} Players</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="11"
                    value={customPartition.lowCount}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      setCustomPartition({ lowCount: val, highCount: 11 - val })
                    }}
                    className="w-full accent-green-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm text-gray-600">🔥 High Impact (50-100%)</Label>
                    <span className="font-bold">{customPartition.highCount} Players</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={customPartition.highCount}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value)
                      setCustomPartition({ highCount: val, lowCount: 11 - val })
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-600">Total Players:</span>
                <span className="font-bold text-green-600">
                  {customPartition.lowCount + customPartition.highCount}/11
                </span>
              </div>

              <Button onClick={handleCustomSave} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Save & Select Strategy
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 mb-6">
          {customPatternsList.map((pattern) => (
            <Card
              key={pattern.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedPatterns.includes(pattern.id)
                  ? "ring-2 ring-purple-400 border-purple-300 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200"
              }`}
              onClick={() => handlePatternSelect(pattern.id)}
            >
              <CardContent className="p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Custom</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-gray-600">🔻 Low Risk Players</Label>
                      <span className="text-lg font-bold text-green-600">{pattern.lowCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">🔥 High Impact Players</Label>
                      <span className="text-lg font-bold text-blue-600">{pattern.highCount}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {selectedPatterns.includes(pattern.id) ? (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent border-purple-300">
                        <Plus className="h-4 w-4 text-purple-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

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
                      <Label className="text-sm text-gray-600">🔻 Low Risk Players</Label>
                      <span className="text-lg font-bold text-green-600">{pattern.lowCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">🔥 High Impact Players</Label>
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

        <div className="flex gap-3 mb-6">
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
            onClick={() => setShowCustom(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Custom
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            onClick={handleSuggestion}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Gemini Suggest
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
