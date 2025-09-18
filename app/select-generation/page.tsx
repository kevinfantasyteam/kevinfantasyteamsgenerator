"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Home, Lightbulb, TrendingUp } from "lucide-react"
import Link from "next/link"

interface GenerationType {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
}

const generationTypes: GenerationType[] = [
  {
    id: "smart",
    title: "Smart Generation",
    subtitle: "Teams specifically for Mega GL",
    icon: <Lightbulb className="h-8 w-8" />,
    color: "text-yellow-500",
  },
  {
    id: "grand",
    title: "Grand League",
    subtitle: "Accurate GL teams",
    icon: <Trophy className="h-8 w-8" />,
    color: "text-green-500",
  },
  {
    id: "advanced",
    title: "Advanced Generation",
    subtitle: "Best Section every day winning",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "text-orange-500",
  },
]

export default function SelectGenerationPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
  }

  const handleContinue = () => {
    if (selectedType) {
      // Navigate to credit range selection
      window.location.href = "/credit-range"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
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
          <h2 className="text-xl font-semibold text-foreground mb-2">Select Section</h2>
        </div>

        <div className="space-y-4">
          {generationTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${type.color}`}>{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Continue</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm font-medium">
            Developed By <span className="text-green-600">Believer01</span> 📺
          </p>
          <p className="text-xs text-muted-foreground">Refer your friends for benefits</p>
        </div>
      </div>
    </div>
  )
}
