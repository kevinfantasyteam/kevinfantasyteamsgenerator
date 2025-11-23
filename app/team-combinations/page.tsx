"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trophy, ArrowLeft, Home, Plus, Settings, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

interface Combination {
  id: number
  wk: number
  bat: number
  al: number
  bow: number
}

const combinations: Combination[] = [
  { id: 1, wk: 1, bat: 3, al: 2, bow: 5 },
  { id: 2, wk: 1, bat: 3, al: 3, bow: 4 },
  { id: 3, wk: 1, bat: 4, al: 3, bow: 3 },
  { id: 4, wk: 1, bat: 4, al: 2, bow: 4 },
  { id: 5, wk: 1, bat: 5, al: 2, bow: 3 },
  { id: 6, wk: 1, bat: 3, al: 4, bow: 3 },
  { id: 7, wk: 2, bat: 3, al: 3, bow: 3 },
  { id: 8, wk: 2, bat: 3, al: 2, bow: 4 },
  { id: 9, wk: 2, bat: 4, al: 2, bow: 3 },
  { id: 10, wk: 3, bat: 3, al: 2, bow: 3 },
]

export default function TeamCombinationsPage() {
  const [selectedCombinations, setSelectedCombinations] = useState<number[]>([])
  const [currentTab, setCurrentTab] = useState<"old" | "new">("old")
  const [showCustom, setShowCustom] = useState(false)
  const [customCombination, setCustomCombination] = useState({ wk: 1, bat: 3, al: 2, bow: 5 })
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

  const handleCombinationSelect = (combinationId: number) => {
    if (combinationId !== 999) {
      localStorage.removeItem("useCustomCombination")
    }
    setSelectedCombinations((prev) =>
      prev.includes(combinationId) ? prev.filter((id) => id !== combinationId) : [...prev, combinationId],
    )
  }

  const handleSuggestion = () => {
    // AI suggests top performing combinations for cricket
    setSelectedCombinations([1, 2, 3])
  }

  const handleCustomClick = () => {
    setShowCustom(true)
  }

  const handleCustomSave = () => {
    // Add custom combination to selected
    const customId = 999
    localStorage.setItem("customCombination", JSON.stringify(customCombination))
    localStorage.setItem("useCustomCombination", "true")
    setSelectedCombinations((prev) => [...prev, customId])
    setShowCustom(false)
  }

  const handleContinue = () => {
    router.push(`/generate-teams?matchId=${matchId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => router.push(`/credit-range?matchId=${matchId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="text-center">
              <h1 className="font-bold text-lg">🏏 Team Combinations</h1>
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

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🎯 Winning Combinations</h2>
          <p className="text-sm text-gray-600 mb-1">Select optimal player combinations</p>
          <p className="text-sm text-orange-600 font-medium">
            Choose <span className="font-semibold">1 or More</span> for maximum success
          </p>
        </div>

        {/* Combination Tabs */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={currentTab === "old" ? "default" : "ghost"}
            className={`flex-1 rounded-md ${currentTab === "old" ? "bg-orange-500 text-white" : "text-gray-600"}`}
            onClick={() => setCurrentTab("old")}
          >
            🏆 Proven
          </Button>
          <Button
            variant={currentTab === "new" ? "default" : "ghost"}
            className={`flex-1 rounded-md ${currentTab === "new" ? "bg-red-500 text-white" : "text-gray-600"}`}
            onClick={() => setCurrentTab("new")}
          >
            ⚡ Trending
          </Button>
        </div>

        {/* Custom Combination Modal */}
        {showCustom && (
          <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-purple-700">🎨 Custom Combination</h3>
                <Button size="sm" variant="ghost" onClick={() => setShowCustom(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm text-gray-600">🧤 WK (1-4)</Label>
                  <select
                    value={customCombination.wk}
                    onChange={(e) => setCustomCombination((prev) => ({ ...prev, wk: Number.parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded-md text-center"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">🏏 BAT (1-6)</Label>
                  <select
                    value={customCombination.bat}
                    onChange={(e) =>
                      setCustomCombination((prev) => ({ ...prev, bat: Number.parseInt(e.target.value) }))
                    }
                    className="w-full p-2 border rounded-md text-center"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">⚡ ALL (1-6)</Label>
                  <select
                    value={customCombination.al}
                    onChange={(e) => setCustomCombination((prev) => ({ ...prev, al: Number.parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded-md text-center"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">🎳 BOW (1-7)</Label>
                  <select
                    value={customCombination.bow}
                    onChange={(e) =>
                      setCustomCombination((prev) => ({ ...prev, bow: Number.parseInt(e.target.value) }))
                    }
                    className="w-full p-2 border rounded-md text-center"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleCustomSave} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Save Custom Combination
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Combination Cards */}
        <div className="space-y-3 mb-6">
          {combinations.map((combination) => (
            <Card
              key={combination.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedCombinations.includes(combination.id)
                  ? "ring-2 ring-orange-400 border-orange-300 bg-orange-50"
                  : "border-gray-200 hover:border-orange-200"
              }`}
              onClick={() => handleCombinationSelect(combination.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">🧤 WK</div>
                      <div className="text-lg font-bold text-blue-600">{combination.wk}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">🏏 BAT</div>
                      <div className="text-lg font-bold text-green-600">{combination.bat}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">⚡ ALL</div>
                      <div className="text-lg font-bold text-purple-600">{combination.al}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">🎳 BOW</div>
                      <div className="text-lg font-bold text-red-600">{combination.bow}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-transparent border-orange-300">
                    <Plus className="h-4 w-4 text-orange-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
            onClick={handleCustomClick}
          >
            <Settings className="h-4 w-4 mr-2" />🎨 Custom
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
            onClick={handleSuggestion}
          >
            <Sparkles className="h-4 w-4 mr-2" />✨ Gemini Suggest
          </Button>
          <Button onClick={handleContinue} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
            Continue 🚀
          </Button>
        </div>
      </div>
    </div>
  )
}
