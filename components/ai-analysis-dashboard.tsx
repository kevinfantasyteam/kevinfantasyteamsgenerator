"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, TrendingUp, Target, AlertCircle, Check } from "lucide-react"

interface AdvancedAnalysis {
  playerId: string
  playerName: string
  position: string
  credits: number
  winProbability: number
  formScore: number
  headsToHeadScore: number
  teamSynergyScore: number
  riskLevel: "Low" | "Medium" | "High"
  recommendations: string[]
  historicalStats: {
    averagePoints: number
    consistency: number
    matchesPlayed: number
  }
}

export function AIAnalysisDashboard({ analysis }: { analysis: AdvancedAnalysis[] }) {
  if (!analysis.length) return null

  const topPerformers = [...analysis].sort((a, b) => b.winProbability - a.winProbability).slice(0, 5)
  const riskPlayers = analysis.filter((a) => a.riskLevel === "High").slice(0, 3)
  const synergy = analysis.filter((a) => a.teamSynergyScore > 75).length

  return (
    <div className="space-y-4">
      {/* Advanced Metrics Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">AI Confidence</p>
                <p className="text-lg font-bold text-blue-700">{Math.round(topPerformers[0]?.winProbability || 0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600">Team Synergy</p>
                <p className="text-lg font-bold text-purple-700">
                  {synergy}/{analysis.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Top Performers (AI Ranked)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topPerformers.map((player) => (
            <div key={player.playerId} className="bg-white p-2 rounded border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{player.playerName}</p>
                  <p className="text-xs text-gray-500">
                    {player.position} • {player.credits} credits
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    {player.winProbability}%
                  </Badge>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Form: {player.formScore}/100 • H2H: {player.headsToHeadScore}/100
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {riskPlayers.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskPlayers.map((player) => (
              <div key={player.playerId} className="bg-white p-2 rounded border-l-4 border-red-500">
                <p className="font-semibold text-sm text-red-700">{player.playerName}</p>
                <p className="text-xs text-gray-600 mt-1">{player.recommendations.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card className="border-2 border-indigo-200 bg-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            Gemini AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analysis.slice(0, 4).map((player) => (
            <div key={player.playerId} className="flex gap-2">
              <Check className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-indigo-900">
                  {player.playerName} - {Math.round(player.teamSynergyScore)}% synergy fit
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
