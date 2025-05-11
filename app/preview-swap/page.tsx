"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PlayerWithCards from "@/components/player-with-cards"
import SwapAnimation from "@/components/swap-animation"

// Sample players with their questions
const PLAYERS = [
  {
    id: 1,
    name: "Alex",
    color: "bg-red-500",
    isHost: true,
    questions: [
      "If you could travel anywhere in the world, where would you go and why?",
      "What's your favorite childhood memory?",
      "If you could have dinner with any historical figure, who would it be?",
    ],
  },
  {
    id: 2,
    name: "Taylor",
    color: "bg-blue-500",
    questions: [
      "What's your dream job?",
      "What's the best piece of advice you've ever received?",
      "If you could master any skill instantly, what would it be?",
    ],
  },
  {
    id: 3,
    name: "Jordan",
    color: "bg-green-500",
    questions: [
      "What's your favorite book or movie and why?",
      "If you could live in any fictional world, which would you choose?",
      "What's something you've always wanted to try but haven't yet?",
    ],
  },
  {
    id: 4,
    name: "Morgan",
    color: "bg-purple-500",
    questions: [
      "What's your favorite way to relax after a long day?",
      "If you could have any superpower, what would it be?",
      "What's the most beautiful place you've ever been?",
    ],
  },
  {
    id: 5,
    name: "Casey",
    color: "bg-yellow-500",
    questions: [
      "What's something that always makes you laugh?",
      "If you could solve one world problem, what would it be?",
      "What's your favorite food to cook or eat?",
    ],
  },
]

export default function PreviewSwapPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerQuestions, setPlayerQuestions] = useState<{ [key: number]: string[] }>({})
  const [swapping, setSwapping] = useState(false)
  const [swapPairs, setSwapPairs] = useState<{ from: number; to: number; question: string }[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [showPlayerCards, setShowPlayerCards] = useState<number | null>(null)
  const { toast } = useToast()

  // Initialize player questions
  useEffect(() => {
    const initialQuestions: { [key: number]: string[] } = {}
    PLAYERS.forEach((player) => {
      initialQuestions[player.id] = [...player.questions]
    })
    setPlayerQuestions(initialQuestions)
  }, [])

  const startGame = () => {
    setGameStarted(true)
    setCurrentPlayerIndex(0)

    toast({
      title: "Game Started!",
      description: "Each player has their own questions. Click 'Swap Questions' to mix them up!",
    })
  }

  const swapQuestions = () => {
    if (swapping) return

    setSwapping(true)
    const newSwapPairs: { from: number; to: number; question: string }[] = []

    // Create a copy of the current questions
    const newPlayerQuestions = { ...playerQuestions }

    // For each player, randomly select one question to swap
    PLAYERS.forEach((player) => {
      const fromPlayerId = player.id

      // Skip if player has no questions
      if (newPlayerQuestions[fromPlayerId].length === 0) return

      // Select a random question from this player
      const questionIndex = Math.floor(Math.random() * newPlayerQuestions[fromPlayerId].length)
      const questionToSwap = newPlayerQuestions[fromPlayerId][questionIndex]

      // Select a random player to swap with (not the same player)
      let toPlayerId
      do {
        toPlayerId = PLAYERS[Math.floor(Math.random() * PLAYERS.length)].id
      } while (toPlayerId === fromPlayerId)

      // Record this swap for animation
      newSwapPairs.push({
        from: fromPlayerId,
        to: toPlayerId,
        question: questionToSwap,
      })

      // Remove the question from the source player
      newPlayerQuestions[fromPlayerId] = newPlayerQuestions[fromPlayerId].filter((_, i) => i !== questionIndex)
    })

    setSwapPairs(newSwapPairs)

    // After animation completes, update the player questions
    setTimeout(() => {
      const finalPlayerQuestions = { ...newPlayerQuestions }

      // Add the questions to their new owners
      newSwapPairs.forEach(({ to, question }) => {
        finalPlayerQuestions[to] = [...(finalPlayerQuestions[to] || []), question]
      })

      setPlayerQuestions(finalPlayerQuestions)
      setSwapping(false)
      setSwapPairs([])

      toast({
        title: "Questions Swapped!",
        description: "Players have received new questions from other players.",
      })
    }, 2000) // Match this with the animation duration
  }

  const togglePlayerCards = (playerId: number) => {
    if (showPlayerCards === playerId) {
      setShowPlayerCards(null)
    } else {
      setShowPlayerCards(playerId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Table header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Question Card Swap <span className="text-gray-400 text-sm">#PREVIEW</span>
          </h1>
          <div className="flex gap-2">
            {!gameStarted ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                onClick={startGame}
              >
                <Play className="h-4 w-4" /> Start Game
              </Button>
            ) : (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                onClick={swapQuestions}
                disabled={swapping}
              >
                <ArrowLeftRight className="h-4 w-4" />
                {swapping ? "Swapping..." : "Swap Questions"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Game table */}
      <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
        {/* The table */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[95vw] h-[95vw] md:w-[80vw] md:h-[80vw] lg:w-[70vw] lg:h-[70vw] xl:w-[60vw] xl:h-[60vw] max-w-[800px] max-h-[800px]">
            {/* Outer table border */}
            <div className="absolute inset-0 rounded-full bg-yellow-900 border-8 border-yellow-800"></div>

            {/* Table felt */}
            <div className="absolute inset-[16px] rounded-full bg-green-800 border-4 border-green-900 shadow-inner">
              {/* Table pattern */}
              <div className="absolute inset-0 rounded-full opacity-10 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_80%,_transparent_80%,_transparent),radial-gradient(circle,_transparent_20%,_#000_20%,_#000_80%,_transparent_80%,_transparent)_25px_25px,linear-gradient(#000_2px,_transparent_2px)_0_-1px,linear-gradient(90deg,_#000_2px,_transparent_2px)_-1px_0] bg-[length:50px_50px,_50px_50px,_25px_25px,_25px_25px]"></div>
            </div>

            {/* Table center logo/text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-green-700 border-2 border-green-900 flex items-center justify-center z-10">
                <div className="text-xl font-bold text-yellow-400 text-center">
                  {!gameStarted ? "READY TO PLAY" : "QUESTION SWAP"}
                </div>
              </div>
            </div>

            {/* Players with their cards */}
            {PLAYERS.map((player, index) => {
              // Calculate position around the circle
              const angle = index * ((2 * Math.PI) / PLAYERS.length) - Math.PI / 2 // Start from top
              const radius = 42 // % from center
              const x = 50 + radius * Math.cos(angle)
              const y = 50 + radius * Math.sin(angle)

              return (
                <PlayerWithCards
                  key={player.id}
                  player={player}
                  questions={playerQuestions[player.id] || []}
                  position={{ x: `${x}%`, y: `${y}%` }}
                  isExpanded={showPlayerCards === player.id}
                  onClick={() => togglePlayerCards(player.id)}
                  gameStarted={gameStarted}
                />
              )
            })}

            {/* Swap animations */}
            {swapping &&
              swapPairs.map((swap, index) => {
                // Find the positions of the source and target players
                const fromPlayer = PLAYERS.find((p) => p.id === swap.from)!
                const toPlayer = PLAYERS.find((p) => p.id === swap.to)!

                const fromIndex = PLAYERS.findIndex((p) => p.id === swap.from)
                const toIndex = PLAYERS.findIndex((p) => p.id === swap.to)

                const fromAngle = fromIndex * ((2 * Math.PI) / PLAYERS.length) - Math.PI / 2
                const toAngle = toIndex * ((2 * Math.PI) / PLAYERS.length) - Math.PI / 2

                const radius = 42
                const fromX = 50 + radius * Math.cos(fromAngle)
                const fromY = 50 + radius * Math.sin(fromAngle)
                const toX = 50 + radius * Math.cos(toAngle)
                const toY = 50 + radius * Math.sin(toAngle)

                return (
                  <SwapAnimation
                    key={index}
                    from={{ x: `${fromX}%`, y: `${fromY}%` }}
                    to={{ x: `${toX}%`, y: `${toY}%` }}
                    color={fromPlayer.color}
                    question={swap.question}
                  />
                )
              })}
          </div>
        </div>

        {/* Game instructions */}
        {!gameStarted && (
          <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md z-50">
            <h3 className="font-bold text-lg mb-2 text-yellow-400">Card Swap Preview</h3>
            <p className="text-gray-300 mb-3">
              This preview shows 5 players with their own question cards. The game allows players to randomly swap
              questions.
            </p>
            <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
              <li>Click on any player to see their questions</li>
              <li>Click "Start Game" to begin</li>
              <li>After the game starts, click "Swap Questions" to randomly exchange questions between players</li>
              <li>Watch as questions move between players</li>
              <li>Click on players again to see their updated questions</li>
            </ol>
          </div>
        )}

        {/* Game state info */}
        {gameStarted && (
          <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md z-50">
            <h3 className="font-bold text-lg mb-2 text-green-400">Game In Progress</h3>
            <p className="text-gray-300 mb-2">
              Each player has their own set of question cards. Click "Swap Questions" to randomly exchange questions
              between players.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Cards per player:</p>
              <ul className="ml-4 space-y-1">
                {PLAYERS.map((player) => (
                  <li key={player.id} className="flex justify-between">
                    <span>{player.name}:</span>
                    <span className="font-mono">{playerQuestions[player.id]?.length || 0} cards</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
