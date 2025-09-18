export interface Player {
  id: string
  name: string
  team: "PK-W" | "SA-W"
  position: "WK" | "BAT" | "AL" | "BOWL"
  credits: number
  selectedBy: number
  captainSel: number
  viceCaptainSel: number
  avatar: string
}

export const mockPlayers: Player[] = [
  // Wicket Keepers
  {
    id: "1",
    name: "M Ali",
    team: "PK-W",
    position: "WK",
    credits: 8.5,
    selectedBy: 88.9,
    captainSel: 4.6,
    viceCaptainSel: 4.77,
    avatar: "/cricket-player-m-ali.jpg",
  },
  {
    id: "2",
    name: "S Jafta",
    team: "SA-W",
    position: "WK",
    credits: 6.5,
    selectedBy: 11.31,
    captainSel: 0.48,
    viceCaptainSel: 0.43,
    avatar: "/cricket-player-s-jafta.jpg",
  },
  {
    id: "3",
    name: "S Nawaz",
    team: "PK-W",
    position: "WK",
    credits: 6.5,
    selectedBy: 11.04,
    captainSel: 0.6,
    viceCaptainSel: 0.54,
    avatar: "/cricket-player-s-nawaz.jpg",
  },
  {
    id: "4",
    name: "K Meso",
    team: "SA-W",
    position: "WK",
    credits: 6,
    selectedBy: 2.81,
    captainSel: 0.19,
    viceCaptainSel: 0.17,
    avatar: "/cricket-player-k-meso.jpg",
  },
  // Batsmen
  {
    id: "5",
    name: "L Wolvaart",
    team: "SA-W",
    position: "BAT",
    credits: 11.5,
    selectedBy: 78.71,
    captainSel: 19.6,
    viceCaptainSel: 11.15,
    avatar: "/cricket-player-l-wolvaart.jpg",
  },
  {
    id: "6",
    name: "T Brits",
    team: "SA-W",
    position: "BAT",
    credits: 9.5,
    selectedBy: 68.15,
    captainSel: 6.9,
    viceCaptainSel: 7.19,
    avatar: "/cricket-player-t-brits.jpg",
  },
  {
    id: "7",
    name: "A Dercksen",
    team: "SA-W",
    position: "BAT",
    credits: 8.5,
    selectedBy: 73.44,
    captainSel: 6.53,
    viceCaptainSel: 7.47,
    avatar: "/cricket-player-a-dercksen.jpg",
  },
  {
    id: "8",
    name: "A Riaz",
    team: "PK-W",
    position: "BAT",
    credits: 7.5,
    selectedBy: 53.96,
    captainSel: 2.46,
    viceCaptainSel: 3.7,
    avatar: "/cricket-player-a-riaz.jpg",
  },
  {
    id: "9",
    name: "S Ameen",
    team: "PK-W",
    position: "BAT",
    credits: 7,
    selectedBy: 31.1,
    captainSel: 1.32,
    viceCaptainSel: 1.88,
    avatar: "/cricket-player-s-ameen.jpg",
  },
]
