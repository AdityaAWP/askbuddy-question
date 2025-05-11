"use client"

import { motion, AnimatePresence } from "framer-motion"

interface Player {
  id: number
  name: string
  color: string
  isHost?: boolean
  questions?: string[]
}

interface PlayerWithCardsProps {
  player: Player
  questions: string[]
  position: { x: string; y: string }
  isExpanded: boolean
  onClick: () => void
  gameStarted: boolean
}

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Avatar styles for each player based on their ID
const getPlayerAvatar = (id: number, color: string) => {
  const avatars = [
    { emoji: "👨‍💼", bgColor: "bg-gradient-to-br from-red-400 to-red-600", textColor: "text-white" },
    { emoji: "👩‍🎤", bgColor: "bg-gradient-to-br from-blue-400 to-blue-600", textColor: "text-white" },
    { emoji: "🧔", bgColor: "bg-gradient-to-br from-green-400 to-green-600", textColor: "text-white" },
    { emoji: "👩‍🔬", bgColor: "bg-gradient-to-br from-purple-400 to-purple-600", textColor: "text-white" },
    { emoji: "👨‍🎨", bgColor: "bg-gradient-to-br from-yellow-400 to-yellow-600", textColor: "text-gray-900" },
    { emoji: "👩‍🍳", bgColor: "bg-gradient-to-br from-pink-400 to-pink-600", textColor: "text-white" },
    { emoji: "👨‍🚀", bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600", textColor: "text-white" },
    { emoji: "👩‍⚕️", bgColor: "bg-gradient-to-br from-orange-400 to-orange-600", textColor: "text-white" },
  ]

  // Use modulo to handle more players than we have predefined avatars
  const index = (id - 1) % avatars.length

  // If we have a predefined avatar, use it, otherwise use the color
  return (
    avatars[index] || {
      emoji: "👤",
      bgColor: color.includes("gradient")
        ? color
        : `bg-gradient-to-br from-${color.replace("bg-", "")}-400 to-${color.replace("bg-", "")}-600`,
      textColor: "text-white",
    }
  )
}

export default function PlayerWithCards({
  player,
  questions,
  position,
  isExpanded,
  onClick,
  gameStarted,
}: PlayerWithCardsProps) {
  const avatar = getPlayerAvatar(player.id, player.color)

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex flex-col items-center">
        {/* Player avatar */}
        <div
          className={`w-16 h-16 rounded-full ${avatar.bgColor} flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110 ${
            isExpanded ? "ring-4 ring-white" : ""
          }`}
          onClick={onClick}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl">{avatar.emoji}</span>
            <span className={`text-xs font-bold ${avatar.textColor} -mt-1`}>{getInitials(player.name)}</span>
          </div>
        </div>

        {/* Player name */}
        <div className="mt-1 px-3 py-1 bg-gray-800 rounded-full text-sm text-white whitespace-nowrap">
          {player.name} {player.isHost && "👑"}
        </div>

        {/* Cards visualization */}
        {gameStarted && !isExpanded && (
          <div className="mt-3 relative h-16 w-20">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`absolute w-10 h-14 ${player.color} rounded border border-white shadow-sm`}
                style={{
                  left: `${i * 5}px`,
                  transform: `rotate(${(i - 1) * 10}deg)`,
                  zIndex: i,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold">?</div>
              </div>
            ))}
            {questions.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center text-gray-900 font-bold">
                {questions.length}
              </div>
            )}
          </div>
        )}

        {/* Expanded cards view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute top-20 z-50"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl w-64">
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold text-${player.color.replace("bg-", "")}`}>{player.name}'s Questions</h3>
                  <span className="text-xs text-gray-400">{questions.length} cards</span>
                </div>
                {questions.length > 0 ? (
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {questions.map((question, index) => (
                      <li
                        key={index}
                        className={`p-2 ${player.color.replace("bg-", "bg-").replace("500", "900")} bg-opacity-20 rounded border border-gray-700 text-sm`}
                      >
                        {question}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-center py-4">No questions</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
