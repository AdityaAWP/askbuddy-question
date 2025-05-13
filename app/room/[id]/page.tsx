"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, Play, Minimize, Maximize, Share, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PlayerWithCards from "@/components/game/player-with-cards"
import SwapAnimation from "@/components/game/swap-animation"
import AddQuestionForm from "@/components/game/add-question-form"
import ShareRoom from "@/components/game/share-room"
import { createClient } from "@/lib/supabase/client"
import { getGuestUser } from "@/lib/guest-session"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { addQuestion, startGame, swapQuestion } from "@/app/actions/room-actions"
import Header from "@/components/header"

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const roomId = params.id
  const searchParams = useSearchParams()
  const roomName = searchParams.get("name") || "Question Room"

  // Room state
  const [room, setRoom] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [gamePhase, setGamePhase] = useState<"setup" | "playing" | "swapping">("setup")
  const [swapPairs, setSwapPairs] = useState<{ from: string; to: string; question: string }[]>([])
  const [showPlayerCards, setShowPlayerCards] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [minimizeBoard, setMinimizeBoard] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)

  // Load room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        // Get current guest user
        const guestUser = getGuestUser()

        if (!guestUser) {
          toast({
            title: "Not logged in",
            description: "You need to join this room first.",
            variant: "destructive",
          })
          router.push(`/join/${room?.code || ""}`)
          return
        }

        setCurrentUser(guestUser)

        // Get room details
        const { data: roomData, error: roomError } = await supabase.from("rooms").select("*").eq("id", roomId).single()

        if (roomError) throw roomError
        setRoom(roomData)
        setGamePhase(roomData.status as any)

        // Get players in this room
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })

        if (playersError) throw playersError
        setPlayers(playersData)

        // Find current player by checking if the name contains the guest ID
        const guestIdShort = guestUser.id.substring(0, 8)
        const currentPlayerData = playersData.find((p) => {
          const nameParts = p.name.split("#")
          return nameParts.length > 1 && nameParts[1] === guestIdShort
        })

        if (!currentPlayerData) {
          toast({
            title: "Not a member",
            description: "You're not a member of this room.",
            variant: "destructive",
          })
          router.push(`/join/${roomData.code}`)
          return
        }
        setCurrentPlayer(currentPlayerData)

        // Get questions for this room
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("room_id", roomId)

        if (questionsError) throw questionsError
        setQuestions(questionsData)
      } catch (error: any) {
        toast({
          title: "Error loading room",
          description: error.message,
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoomData()

    // Set up real-time subscriptions
    const playersSubscription = supabase
      .channel("players-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPlayers((prevPlayers: any[]) => [...prevPlayers, payload.new])
          }
          if (payload.eventType === "UPDATE") {
            setPlayers((prevPlayers: any[]) =>
              prevPlayers.map((player) => (player.id === payload.new.id ? payload.new : player)),
            )
          }
          if (payload.eventType === "DELETE") {
            setPlayers((prevPlayers: any[]) => prevPlayers.filter((player) => player.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    const questionsSubscription = supabase
      .channel("questions-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setQuestions((prevQuestions: any[]) => [...prevQuestions, payload.new])
          }
          if (payload.eventType === "UPDATE") {
            setQuestions((prevQuestions: any[]) =>
              prevQuestions.map((question) => (question.id === payload.new.id ? payload.new : question)),
            )
          }
          if (payload.eventType === "DELETE") {
            setQuestions((prevQuestions: any[]) => prevQuestions.filter((question) => question.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    const roomSubscription = supabase
      .channel("room-status-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setRoom(payload.new)
          setGamePhase(payload.new.status)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersSubscription)
      supabase.removeChannel(questionsSubscription)
      supabase.removeChannel(roomSubscription)
    }
  }, [roomId, router, supabase, toast])

  const handleStartGame = async () => {
    if (!currentPlayer?.is_host) {
      toast({
        title: "Not authorized",
        description: "Only the host can start the game.",
        variant: "destructive",
      })
      return
    }

    // Check if all players have at least one question
    const playersWithoutQuestions = players.filter((player) => !questions.some((q) => q.current_owner_id === player.id))

    if (playersWithoutQuestions.length > 0) {
      const playerNames = playersWithoutQuestions
        .map((p) => {
          // Extract display name from the format "name#guestId"
          const nameParts = p.name.split("#")
          return nameParts[0]
        })
        .join(", ")

      toast({
        title: "Cannot start game",
        description: `${playerNames} ${playersWithoutQuestions.length === 1 ? "doesn't" : "don't"} have any questions.`,
        variant: "destructive",
      })
      return
    }

    try {
      const result = await startGame(roomId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Game Started!",
        description: "Each player has their own questions. Click 'Swap Questions' to mix them up!",
      })
    } catch (error: any) {
      toast({
        title: "Error starting game",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSwapQuestions = async () => {
    if (gamePhase === "swapping" || !currentPlayer?.is_host) return

    setGamePhase("swapping")
    const newSwapPairs: { from: string; to: string; question: string }[] = []

    try {
      // For each player with questions, randomly select one question to swap
      const playerQuestionMap = new Map()

      // Group questions by current owner
      questions.forEach((q) => {
        if (!playerQuestionMap.has(q.current_owner_id)) {
          playerQuestionMap.set(q.current_owner_id, [])
        }
        playerQuestionMap.get(q.current_owner_id).push(q)
      })

      // Create swap pairs
      const playersWithQuestions = Array.from(playerQuestionMap.keys())
      if (playersWithQuestions.length < 2) {
        throw new Error("Need at least 2 players with questions to swap")
      }

      // For each player, select a random question and a random recipient
      for (const playerId of playersWithQuestions) {
        const playerQuestions = playerQuestionMap.get(playerId)
        if (!playerQuestions || playerQuestions.length === 0) continue

        // Select random question
        const randomQuestionIndex = Math.floor(Math.random() * playerQuestions.length)
        const questionToSwap = playerQuestions[randomQuestionIndex]

        // Select random recipient (not the same player)
        const otherPlayers = playersWithQuestions.filter((id) => id !== playerId)
        if (otherPlayers.length === 0) continue

        const recipientId = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]

        // Record swap for animation
        newSwapPairs.push({
          from: playerId,
          to: recipientId,
          question: questionToSwap.content,
        })

        // Update question owner in database using server action
        const result = await swapQuestion(questionToSwap.id, recipientId)

        if (result.error) throw new Error(result.error)
      }

      setSwapPairs(newSwapPairs)

      // After animation completes, update the game phase
      setTimeout(async () => {
        setGamePhase("playing")
        setSwapPairs([])

        toast({
          title: "Questions Swapped!",
          description: "Players have received new questions from other players.",
        })
      }, 2000) // Match this with the animation duration
    } catch (error: any) {
      toast({
        title: "Error swapping questions",
        description: error.message,
        variant: "destructive",
      })
      setGamePhase("playing")
      setSwapPairs([])
    }
  }

  const handleAddQuestion = async (content: string) => {
    if (!content.trim() || !currentPlayer) return

    setIsAddingQuestion(true)

    try {
      const result = await addQuestion(roomId, currentPlayer.id, content)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Question added",
        description: "Your question has been added to the deck.",
      })
    } catch (error: any) {
      toast({
        title: "Error adding question",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAddingQuestion(false)
    }
  }

  const togglePlayerCards = (playerId: string) => {
    if (showPlayerCards === playerId) {
      setShowPlayerCards(null)
    } else {
      setShowPlayerCards(playerId)
    }
  }

  const copyRoomLink = () => {
    const url = `${window.location.origin}/join/${room?.code}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied!",
      description: "Room link copied to clipboard",
    })
  }

  const toggleSharePanel = () => {
    setShowSharePanel(!showSharePanel)
    // If opening share panel, make sure controls are visible
    if (!showSharePanel && !showControls) {
      setShowControls(true)
    }
  }

  // Helper function to get display name from the format "name#guestId"
  const getDisplayName = (fullName: string) => {
    const nameParts = fullName.split("#")
    return nameParts[0]
  }

  // Calculate positions for players around the table
  const getPlayerPositions = () => {
    const positions = []
    const totalPlayers = players.length
    const radius = 42 // % from center

    for (let i = 0; i < totalPlayers; i++) {
      // Calculate position around the circle
      const angle = i * ((2 * Math.PI) / totalPlayers) - Math.PI / 2 // Start from top
      const x = 50 + radius * Math.cos(angle)
      const y = 50 + radius * Math.sin(angle)

      // Create a modified player object with the display name
      const player = {
        ...players[i],
        displayName: getDisplayName(players[i].name),
        x: `${x}%`,
        y: `${y}%`,
      }

      positions.push(player)
    }

    return positions
  }

  const playerPositions = getPlayerPositions()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#004647] text-white overflow-hidden">
      {/* Table header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            {room?.name} <span className="text-gray-400 text-sm">#{room?.code}</span>
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-600" onClick={toggleSharePanel}>
              <Share className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600"
              onClick={() => setShowControls(!showControls)}
            >
              {showControls ? "Hide Controls" : "Show Controls"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600"
              onClick={() => setMinimizeBoard(!minimizeBoard)}
            >
              {minimizeBoard ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
            </Button>
            {gamePhase === "setup" && currentPlayer?.is_host ? (
              <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleStartGame}>
                <Play className="h-4 w-4 mr-1" /> Start Game
              </Button>
            ) : gamePhase === "playing" && currentPlayer?.is_host ? (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
                onClick={handleSwapQuestions}
                disabled={gamePhase === "swapping"}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                {gamePhase === "swapping" ? "Swapping..." : "Swap Questions"}
              </Button>
            ) : null}
            <Link href="/">
              <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Game table */}
      <div className="relative w-full" style={{ height: "calc(100vh - 69px)" }}>
        {/* The table */}
        <div className="absolute inset-0 flex items-center justify-center">
          {minimizeBoard ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md">
              <h3 className="font-bold text-lg mb-2 text-yellow-400">Game Table Minimized</h3>
              <p className="text-gray-300 mb-3">
                The game table is currently minimized. Click the expand button in the header to show the full table.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {playerPositions.map((player) => (
                  <div
                    key={player.id}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-lg flex items-center text-gray-200"
                  >
                    <div className={`w-8 h-8 rounded-full ${player.color} flex items-center justify-center mr-2`}>
                      {player.avatar_emoji}
                    </div>
                    <span>
                      {player.displayName} {player.is_host ? "👑" : ""} {player.id === currentPlayer?.id ? "(You)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative w-[80vw] h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[70vw] lg:h-[70vw] xl:w-[60vw] xl:h-[60vw] max-w-[600px] max-h-[600px]">
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
                    {gamePhase === "setup"
                      ? "SETUP PHASE"
                      : gamePhase === "swapping"
                        ? "SWAPPING..."
                        : "QUESTION CARDS"}
                  </div>
                </div>
              </div>

              {/* Players with their cards */}
              {playerPositions.map((player) => (
                <PlayerWithCards
                  key={player.id}
                  player={{
                    ...player,
                    name: player.displayName,
                  }}
                  questions={questions.filter((q) => q.current_owner_id === player.id)}
                  position={{ x: player.x, y: player.y }}
                  isExpanded={showPlayerCards === player.id}
                  onClick={() => togglePlayerCards(player.id)}
                  gameStarted={gamePhase !== "setup"}
                  isCurrentUser={player.id === currentPlayer?.id}
                />
              ))}

              {/* Swap animations */}
              {gamePhase === "swapping" &&
                swapPairs.map((swap, index) => {
                  // Find the positions of the source and target players
                  const fromPlayer = players.find((p) => p.id === swap.from)!
                  const toPlayer = players.find((p) => p.id === swap.to)!

                  const fromIndex = players.findIndex((p) => p.id === swap.from)
                  const toIndex = players.findIndex((p) => p.id === swap.to)

                  const fromAngle = fromIndex * ((2 * Math.PI) / players.length) - Math.PI / 2
                  const toAngle = toIndex * ((2 * Math.PI) / players.length) - Math.PI / 2

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
          )}
        </div>

        {/* Share panel - always accessible */}
        {showSharePanel && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg text-gray-300">Share Room</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={toggleSharePanel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ShareRoom roomCode={room?.code} roomName={room?.name} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game controls panel - can be toggled */}
        {showControls && !minimizeBoard && (
          <div className="absolute top-4 right-4 w-80 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            {gamePhase === "setup" ? (
              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-3 text-gray-300">Game Setup</h3>

                  {/* Current players */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Current Players</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {playerPositions.map((player) => (
                        <div
                          key={player.id}
                          className="p-3 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-between text-gray-200"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${player.color} flex items-center justify-center mr-3`}
                            >
                              {player.avatar_emoji}
                            </div>
                            <span>
                              {player.displayName} {player.is_host ? "👑" : ""}{" "}
                              {player.id === currentPlayer?.id ? "(You)" : ""}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {questions.filter((q) => q.current_owner_id === player.id).length} questions
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add questions form */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Add Your Questions</h4>
                    <AddQuestionForm onAddQuestion={handleAddQuestion} isLoading={isAddingQuestion} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-3 text-gray-300">Game In Progress</h3>

                  {/* Player questions summary */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Player Questions</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {playerPositions.map((player) => (
                        <div
                          key={player.id}
                          className="p-3 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-between text-gray-200"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${player.color} flex items-center justify-center mr-3`}
                            >
                              {player.avatar_emoji}
                            </div>
                            <span>
                              {player.displayName} {player.is_host ? "👑" : ""}{" "}
                              {player.id === currentPlayer?.id ? "(You)" : ""}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {questions.filter((q) => q.current_owner_id === player.id).length} questions
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Share room button */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={toggleSharePanel}>
                    <Share className="h-4 w-4 mr-2" /> Share Room
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Game controls for minimized view */}
        {minimizeBoard && showControls && (
          <div className="absolute bottom-4 right-4 w-80 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4">
                <h3 className="font-medium text-lg mb-3 text-gray-300">Game Controls</h3>

                {gamePhase === "setup" ? (
                  <>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Add Your Questions</h4>
                    <AddQuestionForm onAddQuestion={handleAddQuestion} isLoading={isAddingQuestion} />
                  </>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-400">Game Status</h4>
                      <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
                        <p className="text-gray-300">
                          Game is in progress. {players.length} players with {questions.length} total questions.
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={toggleSharePanel}>
                      <Share className="h-4 w-4 mr-2" /> Share Room
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game instructions - only shown during setup */}
          {/* // <div className="absolute top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl max-w-md z-50">
          //   <h3 className="font-bold text-lg mb-2 text-yellow-400">Game Setup</h3>
          //   <p className="text-gray-300 mb-3">Welcome to your question card game! Follow these steps to get started:</p>
          //   <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
          //     <li>Add your questions using the control panel</li>
          //     <li>Share the room code with friends so they can join</li>
          //     <li>Wait for the host to start the game</li>
          //     <li>During the game, questions will be swapped between players</li>
          //     <li>Click on any player to see their current questions</li>
          //   </ol>
          // </div> */}
      </div>
    </div>
  )
}
