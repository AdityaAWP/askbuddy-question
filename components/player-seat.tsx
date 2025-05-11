"use client"

import type React from "react"
import { User } from "lucide-react"

interface PlayerSeatProps {
  name: string
  isHost?: boolean
  isActive?: boolean
  cardCount?: number
  style?: React.CSSProperties
  onClick?: () => void
}

export default function PlayerSeat({
  name,
  isHost = false,
  isActive = false,
  cardCount = 0,
  style,
  onClick,
}: PlayerSeatProps) {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      {/* Player avatar */}
      <div
        className={`w-12 h-12 rounded-full ${isHost ? "bg-yellow-500" : isActive ? "bg-green-500" : "bg-blue-500"} 
        flex items-center justify-center shadow-lg ${isActive ? "ring-4 ring-white animate-pulse" : ""}`}
      >
        <User className="h-6 w-6 text-white" />
      </div>

      {/* Player name */}
      <div className="mt-1 px-2 py-1 bg-gray-800 rounded-full text-xs text-white whitespace-nowrap">
        {name} {isHost && "👑"}
      </div>

      {/* Card count */}
      {cardCount > 0 && (
        <div className="mt-2 relative">
          {/* Stack of cards */}
          {Array.from({ length: Math.min(cardCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-12 bg-red-600 rounded border border-white shadow-sm"
              style={{
                transform: `translateX(${i * 3}px) translateY(${-i * 2}px) rotate(${i * 5}deg)`,
                zIndex: i,
              }}
            ></div>
          ))}

          {/* Card count badge */}
          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-xs flex items-center justify-center text-gray-900 font-bold">
            {cardCount}
          </div>
        </div>
      )}
    </div>
  )
}
