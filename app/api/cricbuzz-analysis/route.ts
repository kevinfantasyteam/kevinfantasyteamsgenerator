import { type NextRequest, NextResponse } from "next/server"

interface Player {
  id?: string
  name: string
  team: string
  role: string
  credit: number
  selectionPercentage?: number
  quantumScore?: number
  formScore?: number
  recentForm?: string
}

interface AnalysisRequest {
  matchId: string
  players: Player[]
  team1Name: string
  team2Name: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { players, team1Name, team2Name } = body

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players provided" }, { status: 400 })
    }

    // Prepare player data for analysis
    const playerSummary = players
      .map((p) => `${p.name} (${p.role}, Credits: ${p.credit}, Selection: ${p.selectionPercentage}%)`)
      .join("\n")

    const analysisPrompt = `
You are a cricket analyst. Analyze the following 22 players from a Dream11 match between ${team1Name} and ${team2Name}.

Players:
${playerSummary}

Based on this player pool, create an optimal 11-player Dream11 team following these criteria:
1. Position Distribution: WK (1-3), BAT (1-5), ALL (1-6), BOW (1-6)
2. Balance: Mix high-selection reliable players with low-selection differential picks
3. Select a Captain (2x points) and Vice Captain (1.5x points)
4. Explain your selection rationale

Return the team in this exact format:
TEAM_NAME: Cricbuzz Analysis Team
PLAYERS:
1. Player Name - Role - Credits - Selection%
2. Player Name - Role - Credits - Selection%
... (continue for 11 players)
CAPTAIN: Player Name
VICE_CAPTAIN: Player Name
ANALYSIS: Brief explanation of team strategy
`

    // Use the Vercel AI SDK default model (OpenAI GPT)
    const { generateText } = await import("ai")

    const { text } = await generateText({
      model: "openai/gpt-4.1",
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the response
    const lines = text.split("\n")
    const selectedPlayers: string[] = []
    let captain = ""
    let viceCaptain = ""
    let analysis = ""

    let section = ""
    for (const line of lines) {
      if (line.includes("CAPTAIN:")) {
        captain = line.replace("CAPTAIN:", "").trim()
      } else if (line.includes("VICE_CAPTAIN:")) {
        viceCaptain = line.replace("VICE_CAPTAIN:", "").trim()
      } else if (line.includes("ANALYSIS:")) {
        analysis = line.replace("ANALYSIS:", "").trim()
      } else if (line.includes("PLAYERS:")) {
        section = "players"
      } else if (section === "players" && line.trim().match(/^\d+\./)) {
        const playerName = line
          .split("-")[0]
          .replace(/^\d+\./, "")
          .trim()
        selectedPlayers.push(playerName)
      }
    }

    // Match selected players with original data
    const cricbuzzTeamPlayers = selectedPlayers
      .map((name) => players.find((p) => p.name.toLowerCase() === name.toLowerCase()))
      .filter((p): p is Player => p !== undefined)
      .slice(0, 11)

    return NextResponse.json({
      success: true,
      team: {
        id: "cricbuzz-" + Date.now(),
        type: "CRICBUZZ",
        players: cricbuzzTeamPlayers.map((p, idx) => ({
          ...p,
          position: idx + 1,
          isCaptain: p.name === captain,
          isViceCaptain: p.name === viceCaptain,
        })),
        totalCredits: cricbuzzTeamPlayers.reduce((sum, p) => sum + (p.credit || 0), 0),
        lowSelectionCount: cricbuzzTeamPlayers.filter((p) => (p.selectionPercentage || 50) <= 50).length,
        captain,
        viceCaptain,
        analysis,
      },
    })
  } catch (error) {
    console.error("[v0] Cricbuzz analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze team", details: String(error) }, { status: 500 })
  }
}
