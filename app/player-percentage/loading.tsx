import { PlaneLoader } from "@/components/plane-loader"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#2e0249] to-[#57059e]">
      <PlaneLoader label="Loading selection strategies..." />
    </div>
  )
}
