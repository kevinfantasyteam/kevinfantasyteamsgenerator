"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

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

interface PlayerCardProps {
  player: Player
  isSelected: boolean
  onSelect: (playerId: string) => void
  showCaptainInfo?: boolean
  showViceCaptainInfo?: boolean
}

export function PlayerCard({ player, isSelected, onSelect, showCaptainInfo, showViceCaptainInfo }: PlayerCardProps) {
  return (
    <Card className={`${isSelected ? "ring-2 ring-primary" : ""}`}>
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={player.avatar || "/placeholder.svg?height=32&width=32"}
              alt={player.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <Badge
              variant="secondary"
              className={`absolute -bottom-1 -right-1 text-xs px-1 py-0 ${
                player.team === "PK-W" ? "bg-green-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              {player.team}
            </Badge>
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-xs">{player.name}</h3>
            <p className="text-xs text-muted-foreground">Sel by {player.selectedBy}%</p>
            {showCaptainInfo && <p className="text-xs text-orange-500">Captain Sel: {player.captainSel || "4.6"}%</p>}
            {showViceCaptainInfo && (
              <p className="text-xs text-purple-500">Vice Captain Sel: {player.viceCaptainSel || "4.7"}%</p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs font-medium">{player.credits}</p>
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className="w-6 h-6 p-0 mt-1"
              onClick={() => onSelect(player.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
