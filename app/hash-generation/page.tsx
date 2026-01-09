"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, ArrowLeft, Home, Hash, Copy, Info } from "lucide-react"
import Link from "next/link"
import { generateDream11Hash, generateTeamHash } from "@/lib/hash-generator"

export default function HashGenerationPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")

  const [matchIdentifier, setMatchIdentifier] = useState("")
  const [hashValue, setHashValue] = useState("")
  const [teamHash, setTeamHash] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (matchId) {
      const matches = JSON.parse(localStorage.getItem("adminMatches") || "[]")
      const match = matches.find((m: any) => m.id === matchId)
      if (match) {
        setMatchIdentifier(`${match.team1}-vs-${match.team2}-${match.matchType || "T20"}`)
      }
    }
  }, [matchId])

  const generateHash = async () => {
    if (!matchIdentifier.trim()) return

    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const savedPlayers = localStorage.getItem(`selectedPlayers_${matchId}`)
    const selectedPlayers = savedPlayers ? JSON.parse(savedPlayers) : []

    const dream11Hash = generateDream11Hash(matchIdentifier)
    const teamGenerationHash = generateTeamHash({
      matchId: matchIdentifier,
      selectedPlayers: selectedPlayers.map((p: any) => p.id),
      strategies: ["smart-generation"],
      creditRange: { min: 83.5, max: 88.5 },
      teamPartition: [{ team1: 4, team2: 7 }],
    })

    setHashValue(dream11Hash)
    setTeamHash(teamGenerationHash)
    setIsGenerating(false)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${type} hash copied to clipboard!`)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleContinue = () => {
    if (hashValue && teamHash) {
      window.location.href = `/team-management?matchId=${matchId}`
    }
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
            onClick={() => (window.location.href = `/team-strategies?matchId=${matchId}`)}
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
          <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
            <Hash className="h-6 w-6" />
            Dream11 Hash Generator
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate unique hash values for team verification and creation
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Match ID</label>
                <Input
                  type="text"
                  value={matchIdentifier}
                  onChange={(e) => setMatchIdentifier(e.target.value)}
                  placeholder="Enter Match ID"
                  className="w-full"
                />
              </div>

              <Button
                onClick={generateHash}
                disabled={!matchIdentifier.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? "Generating..." : "Generate Hash"}
              </Button>

              {/* Dream11 Hash */}
              {hashValue && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Dream11 Verification Hash</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(hashValue, "Dream11")}
                        className="bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm font-mono bg-background p-2 rounded border break-all">{hashValue}</div>
                  </div>

                  {/* Team Generation Hash */}
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Team Generation Hash</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(teamHash, "Team")}
                        className="bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm font-mono bg-background p-2 rounded border break-all">{teamHash}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Instructions:
            </h3>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Match ID is auto-filled from your selection</li>
              <li>Click on Generate Hash button</li>
              <li>Copy the generated hash values</li>
              <li>Use Dream11 hash for team verification</li>
              <li>Use Team hash for strategy tracking</li>
            </ol>
          </CardContent>
        </Card>

        {/* Continue Button */}
        {hashValue && teamHash && (
          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Team Management
          </Button>
        )}

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-medium">
            Developed By <span className="text-green-600">Believer01</span>
          </p>
          <p className="text-xs text-muted-foreground">Refer your friends for benefits</p>
        </div>
      </div>
    </div>
  )
}
