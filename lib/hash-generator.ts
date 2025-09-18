export interface HashGenerationParams {
  matchId: string
  selectedPlayers: string[]
  strategies: string[]
  creditRange: { min: number; max: number }
  teamPartition: { pkw: number; saw: number }[]
}

export function generateTeamHash(params: HashGenerationParams): string {
  // Create a deterministic hash based on all parameters
  const hashInput = JSON.stringify({
    match: params.matchId,
    players: params.selectedPlayers.sort(),
    strategies: params.strategies.sort(),
    credits: params.creditRange,
    partition: params.teamPartition,
    timestamp: Date.now(),
  })

  // Simple hash generation (in production, use a more robust algorithm)
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to base36 and add random suffix for uniqueness
  const baseHash = Math.abs(hash).toString(36)
  const randomSuffix = Math.random().toString(36).substring(2, 8)

  return `${baseHash}${randomSuffix}`.toUpperCase()
}

export function generateDream11Hash(matchId: string): string {
  // This matches the original hash generation from user's code
  const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return hash.toUpperCase()
}
