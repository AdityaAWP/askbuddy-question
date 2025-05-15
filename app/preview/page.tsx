"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shuffle, Play } from "lucide-react"
import QuestionCard from "@/components/question-card"
import { useToast } from "@/hooks/use-toast"
import PlayerSeat from "@/components/player-seat"
import PlayerQuestions from "@/components/player-questions"

const PLAYERS = [
  {
    name: "Alex",
    isHost: true,
    questions: [
      "If you could travel anywhere in the world, where would you go and why?",
      "What's your favorite childhood memory?",
      "If you could have dinner with any historical figure, who would it be?",
    ],
  },
  {
    name: "Taylor",
    questions: [
      "What's your dream job?",
      "What's the best piece of advice you've ever received?",
      "If you could master any skill instantly, what would it be?",
    ],
  },
  {
    name: "Jordan",
    questions: [
      "What's your favorite book or movie and why?",
      "If you could live in any fictional world, which would you choose?",
      "What's something you've always wanted to try but haven't yet?",
    ],
  },
  {
    name: "Morgan",
    questions: [
      "What's your favorite way to relax after a long day?",
      "If you could have any superpower, what would it be?",
      "What's the most beautiful place you've ever been?",
    ],
  },
  {
    name: "Casey",
    questions: [
      "What's something that always makes you laugh?",
      "If you could solve one world problem, what would it be?",
      "What's your favorite food to cook or eat?",
    ],
  },
]

const ALL_QUESTIONS = PLAYERS.flatMap((player) => player.questions)

export default function PreviewPage() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [dealtCards, setDealtCards] = useState<{ [key: string]: string[] }>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [showPlayerQuestions, setShowPlayerQuestions] = useState<string | null>(null)
  const { toast } = useToast()

  const getPlayerPositions = () => {
    const positions = []
    const totalPlayers = PLAYERS.length
    const radius = 42

    for (let i = 0; i < totalPlayers; i++) {
      const angle = i * ((2 * Math.PI) / totalPlayers) - Math.PI / 2 
      const x = 50 + radius * Math.cos(angle)
      const y = 50 + radius * Math.sin(angle)

      positions.push({
        ...PLAYERS[i],
        x: `${x}%`,
        y: `${y}%`,
        active: i === currentPlayerIndex && gameStarted,
      })
    }

    return positions
  }

  const playerPositions = getPlayerPositions()

  const startGame = () => {
    const shuffledQuestions = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
    const dealt: { [key: string]: string[] } = {}

    PLAYERS.forEach((player, index) => {
      dealt[player.name] = shuffledQuestions.slice(index * 3, index * 3 + 3)
    })

    setDealtCards(dealt)
    setGameStarted(true)
    setCurrentPlayerIndex(0)

    toast({
      title: "Game Started!",
      description: "Questions have been dealt to all players. Alex goes first!",
    })
  }

  const drawRandomQuestion = () => {
    if (!gameStarted) {
      toast({
        title: "Game not started",
        description: "Start the game first to draw questions!",
        variant: "destructive",
      })
      return
    }

    const currentPlayer = PLAYERS[currentPlayerIndex]
    const playerCards = dealtCards[currentPlayer.name]

    if (playerCards && playerCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * playerCards.length)
      const question = playerCards[randomIndex]

      const updatedCards = { ...dealtCards }
      updatedCards[currentPlayer.name] = playerCards.filter((_, i) => i !== randomIndex)
      setDealtCards(updatedCards)

      setCurrentQuestion(question)

      setCurrentPlayerIndex((currentPlayerIndex + 1) % PLAYERS.length)

      const card = document.getElementById("question-card")
      if (card) {
        card.classList.add("flip")
        setTimeout(() => {
          card.classList.remove("flip")
        }, 500)
      }

      toast({
        title: `${currentPlayer.name}'s turn`,
        description: "Card drawn! Next player's turn.",
      })
    } else {
      toast({
        title: "No more cards",
        description: `${currentPlayer.name} has no more cards to draw!`,
        variant: "destructive",
      })

      const anyCardsLeft = Object.values(dealtCards).some((cards) => cards.length > 0)

      if (!anyCardsLeft) {
        toast({
          title: "Game Over!",
          description: "All questions have been answered!",
        })
      } else {
        let nextPlayerIndex = (currentPlayerIndex + 1) % PLAYERS.length
        while (dealtCards[PLAYERS[nextPlayerIndex].name].length === 0) {
          nextPlayerIndex = (nextPlayerIndex + 1) % PLAYERS.length

          if (nextPlayerIndex === currentPlayerIndex) {
            break
          }
        }

        setCurrentPlayerIndex(nextPlayerIndex)
      }
    }
  }

  const togglePlayerQuestions = (playerName: string) => {
    if (showPlayerQuestions === playerName) {
      setShowPlayerQuestions(null)
    } else {
      setShowPlayerQuestions(playerName)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Friday Night Questions <span className="text-gray-400 text-sm">#PREVIEW</span>
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
              <div className="text-sm text-gray-300 flex items-center">
                <span className="font-bold text-green-400 mr-2">{PLAYERS[currentPlayerIndex].name}'s Turn</span>
                {Object.entries(dealtCards).map(([name, cards]) => (
                  <span key={name} className="mx-1">
                    {name}: {cards.length} cards
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[95vw] h-[95vw] md:w-[80vw] md:h-[80vw] lg:w-[70vw] lg:h-[70vw] xl:w-[60vw] xl:h-[60vw] max-w-[800px] max-h-[800px]">
            <div className="absolute inset-0 rounded-full bg-yellow-900 border-8 border-yellow-800"></div>

            <div className="absolute inset-[16px] rounded-full bg-green-800 border-4 border-green-900 shadow-inner">
              <div className="absolute inset-0 rounded-full opacity-10 bg-[radial-gradient(circle,_transparent_20%,_#000_20%,_#000_80%,_transparent_80%,_transparent),radial-gradient(circle,_transparent_20%,_#000_20%,_#000_80%,_transparent_80%,_transparent)_25px_25px,linear-gradient(#000_2px,_transparent_2px)_0_-1px,linear-gradient(90deg,_#000_2px,_transparent_2px)_-1px_0] bg-[length:50px_50px,_50px_50px,_25px_25px,_25px_25px]"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-green-700 border-2 border-green-900 flex items-center justify-center z-10">
                <div className="text-xl font-bold text-yellow-400 text-center">
                  {!gameStarted ? "READY TO PLAY" : "QUESTION CARDS"}
                </div>
              </div>
            </div>

            {!gameStarted && (
              <div className="absolute top-1/2 left-1/2 -translate-x-[80px] -translate-y-[120px] transform rotate-[15deg] z-20">
                <div className="w-16 h-24 bg-red-600 rounded-lg border-2 border-white shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">?</span>
                </div>
              </div>
            )}

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              <QuestionCard question={currentQuestion} />
            </div>

            {playerPositions.map((player, index) => (
              <div key={index} style={{ position: "absolute", left: player.x, top: player.y, zIndex: 40 }}>
                <PlayerSeat
                  name={player.name}
                  isHost={player.isHost}
                  isActive={player.active}
                  cardCount={gameStarted ? dealtCards[player.name]?.length || 0 : 3}
                  onClick={() => togglePlayerQuestions(player.name)}
                />
              </div>
            ))}

            {showPlayerQuestions && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                <PlayerQuestions
                  playerName={showPlayerQuestions}
                  questions={
                    gameStarted
                      ? dealtCards[showPlayerQuestions] || []
                      : PLAYERS.find((p) => p.name === showPlayerQuestions)?.questions || []
                  }
                  onClose={() => setShowPlayerQuestions(null)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <Button
            onClick={drawRandomQuestion}
            disabled={!gameStarted}
            className={`px-6 py-6 text-lg rounded-full flex items-center gap-2 shadow-lg ${
              gameStarted ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Shuffle className="h-5 w-5" /> Draw Card
          </Button>
        </div>

        {!gameStarted && (
          <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md z-50">
            <h3 className="font-bold text-lg mb-2 text-yellow-400">Game Preview</h3>
            <p className="text-gray-300 mb-3">
              This is a preview of 5 players at the table. Each player has created 3 questions.
            </p>
            <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
              <li>Click on any player to see their questions</li>
              <li>Click "Start Game" to deal the questions randomly</li>
              <li>After the game starts, players take turns drawing cards</li>
              <li>When a card is drawn, the question is revealed and that player's turn ends</li>
              <li>The game continues until all questions have been answered</li>
            </ol>
          </div>
        )}

        {gameStarted && (
          <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md z-50">
            <h3 className="font-bold text-lg mb-2 text-green-400">Game In Progress</h3>
            <p className="text-gray-300 mb-2">
              Questions have been dealt randomly to all players. Click on any player to see their current cards.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="font-bold text-yellow-400">Current turn: {PLAYERS[currentPlayerIndex].name}</p>
              <p>Cards remaining:</p>
              <ul className="ml-4 space-y-1">
                {Object.entries(dealtCards).map(([name, cards]) => (
                  <li key={name} className="flex justify-between">
                    <span>{name}:</span>
                    <span className="font-mono">{cards.length} cards</span>
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
