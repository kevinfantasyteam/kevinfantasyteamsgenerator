"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, ArrowLeft, Home, ArrowDown, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

export default function CreditRangePage() {
  const [minCredit, setMinCredit] = useState("")
  const [maxCredit, setMaxCredit] = useState("")
  const [matchName, setMatchName] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const matchId = searchParams.get("matchId")

  useEffect(() => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const match = matches.find((m: any) => m.id === matchId)
      if (match) {
        setMatchName(match.name)
        const allPlayers = [...match.team1Players, ...match.team2Players]
        const totalCredits = allPlayers.reduce((sum, player) => sum + Number.parseFloat(player.credits), 0)
        const averageCredit = totalCredits / allPlayers.length
        const baseCredit = averageCredit * 11

        setMinCredit((baseCredit - 2.5).toFixed(1))
        setMaxCredit((baseCredit + 2.5).toFixed(1))

        setAiSuggestion(
          `AI recommends ${(baseCredit - 1.5).toFixed(1)} - ${(baseCredit + 1.5).toFixed(1)} for balanced teams`,
        )
      }
    }
  }, [matchId])

  const handleAiSuggestion = () => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const match = matches.find((m: any) => m.id === matchId)
      if (match) {
        const allPlayers = [...match.team1Players, ...match.team2Players]
        const totalCredits = allPlayers.reduce((sum, player) => sum + Number.parseFloat(player.credits), 0)
        const averageCredit = totalCredits / allPlayers.length
        const baseCredit = averageCredit * 11

        // AI suggests tighter range for better optimization
        setMinCredit((baseCredit - 1.5).toFixed(1))
        setMaxCredit((baseCredit + 1.5).toFixed(1))
      }
    }
  }

  const handleContinue = () => {
    localStorage.setItem("creditRange", JSON.stringify({ min: minCredit, max: maxCredit }))
    router.push(`/team-combinations?matchId=${matchId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => router.push(`/player-percentage?matchId=${matchId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="text-center">
              <h1 className="font-bold text-lg">💰 Credit Range</h1>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🎯 Smart Credit Management</h2>
          <p className="text-sm text-gray-600 mb-1">Set optimal credit range for winning combinations</p>
          <p className="text-sm text-blue-600 font-medium">✨ Gemini AI-powered recommendations below!</p>
        </div>

        {/* AI Suggestion Card */}
        {aiSuggestion && (
          <Card className="mb-4 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">✨ Gemini Insight</span>
              </div>
              <p className="text-sm text-gray-700">{aiSuggestion}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">💵 Minimum Credits</label>
                <Input
                  type="number"
                  value={minCredit}
                  onChange={(e) => setMinCredit(e.target.value)}
                  className="text-center text-lg font-medium border-2 border-green-200 focus:border-green-400"
                  step="0.5"
                />
              </div>

              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 p-2 rounded-full">
                  <ArrowDown className="h-6 w-6 text-white" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">💰 Maximum Credits</label>
                <Input
                  type="number"
                  value={maxCredit}
                  onChange={(e) => setMaxCredit(e.target.value)}
                  className="text-center text-lg font-medium border-2 border-blue-200 focus:border-blue-400"
                  step="0.5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={handleAiSuggestion}
                >
                  <Sparkles className="h-4 w-4 mr-2" />✨ Gemini Suggest
                </Button>
                <Button variant="outline" className="flex-1 border-gray-300 bg-transparent">
                  <Info className="h-4 w-4 mr-2" />
                  Credit Info
                </Button>
                <Button onClick={handleContinue} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Continue 🚀
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">
            Powered by <span className="text-green-600">🏏 KevinFantasy AI</span>
          </p>
          <p className="text-xs text-gray-500">Smart cricket predictions & analysis</p>
        </div>
      </div>
    </div>
  )
}
