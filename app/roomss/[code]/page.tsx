"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { distributeCards } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Copy, Users, X, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function RoomPage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const roomCode = params.code.toUpperCase()

  const [roomData, setRoomData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [myQuestions, setMyQuestions] = useState<any[]>([])
  const [receivedCards, setReceivedCards] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showGuide, setShowGuide] = useState(false)

  // Generate guestId if not exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      let currentGuestId = localStorage.getItem("guestId")
      if (!currentGuestId) {
        currentGuestId = Math.random().toString(36).substring(2) + Date.now().toString(36)
        localStorage.setItem("guestId", currentGuestId)
      }
    }
  }, [])

  const guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null
  const isRoomCreator = roomData?.created_by === guestId

  // Add user to room when component mounts
  useEffect(() => {
    const addUserToRoom = async () => {
      if (!guestId || !roomData) return

      try {
        // Check if user already exists in room
        const { data: existingUser } = await supabase
          .from("room_users")
          .select("*")
          .eq("room_id", roomData.id)
          .eq("guest_id", guestId)
          .single()

        if (!existingUser) {
          // Add user to room if not exists
          const { error } = await supabase.from("room_users").insert({
            room_id: roomData.id,
            guest_id: guestId,
            joined_at: new Date().toISOString(),
          })

          if (error) throw error

          // Notify other users
          const roomChannel = supabase.channel(`room:${roomCode}`)
          roomChannel.send({
            type: "broadcast",
            event: "user_joined",
            payload: { guest_id: guestId },
          })
        }
      } catch (err: any) {
        console.error("Error adding user to room:", err)
      }
    }

    if (roomData) {
      addUserToRoom()
    }
  }, [guestId, roomData, roomCode])

  // Initialize Supabase Realtime subscription
  useEffect(() => {
    if (!guestId) {
      router.push("/")
      return
    }

    const fetchRoomData = async () => {
      try {
        setLoading(true)

        // Get room data
        const { data: room, error: roomError } = await supabase
          .from("rooms")
          .select("*")
          .eq("room_code", roomCode)
          .single()

        if (roomError) throw roomError
        setRoomData(room)

        // Check if game has already started
        if (room.status === "playing") {
          setGameStarted(true)
        }

        // Get users in room
        const { data: roomUsers, error: usersError } = await supabase
          .from("room_users")
          .select("*")
          .eq("room_id", room.id)

        if (usersError) throw usersError
        console.log("Room users:", roomUsers) // Debug log
        setUsers(roomUsers)

        // Get questions for this room
        const { data: questionCards, error: questionsError } = await supabase
          .from("question_cards")
          .select("*")
          .eq("room_id", room.id)

        if (questionsError) throw questionsError
        setQuestions(questionCards)

        // Filter my questions
        const myCards = questionCards.filter((q: any) => q.guest_id === guestId)
        setMyQuestions(myCards)

        // Get received cards if game has started
        if (room.status === "playing") {
          const { data: gameSession, error: sessionError } = await supabase
            .from("game_sessions")
            .select("*")
            .eq("room_id", room.id)
            .eq("guest_id", guestId)

          if (!sessionError && gameSession) {
            setReceivedCards(gameSession)
          }
        }
      } catch (err: any) {
        console.error("Error fetching room data:", err)
        setError(err.message || "Failed to load room data")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()

    // Set up realtime subscription for room updates
    const roomChannel = supabase.channel(`room:${roomCode}`)

    roomChannel
      .on("presence", { event: "sync" }, () => {
        // Handle presence sync
      })
      .on("broadcast", { event: "user_joined" }, (payload) => {
        console.log("User joined event received:", payload) // Debug log
        fetchRoomData()
      })
      .on("broadcast", { event: "question_added" }, (payload) => {
        fetchRoomData()
      })
      .on("broadcast", { event: "game_started" }, (payload) => {
        setGameStarted(true)
        fetchRoomData()
      })
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "room_users" 
      }, (payload) => {
        console.log("Room users changed:", payload) // Debug log
        fetchRoomData()
      })
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "question_cards" 
      }, (payload) => {
        fetchRoomData()
      })
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "game_sessions" 
      }, (payload) => {
        fetchRoomData()
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await roomChannel.track({
            user_id: guestId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(roomChannel)
    }
  }, [roomCode, guestId, router])

  const addQuestion = async () => {
    if (!newQuestion.trim() || !roomData || !guestId) return

    try {
      // Check if user already has 3 questions
      if (myQuestions.length >= 3) {
        toast({
          title: "Limit Reached",
          description: "You can only create 3 question cards",
          variant: "destructive",
        })
        return
      }

      // Add question to database
      const { error } = await supabase.from("question_cards").insert({
        room_id: roomData.id,
        guest_id: guestId,
        question: newQuestion,
      })

      if (error) throw error

      // Notify other users
      const roomChannel = supabase.channel(`room:${roomCode}`)
      roomChannel.send({
        type: "broadcast",
        event: "question_added",
        payload: { guest_id: guestId },
      })

      // Clear input and refresh questions
      setNewQuestion("")

      // Update local state
      const newCard = {
        room_id: roomData.id,
        guest_id: guestId,
        question: newQuestion,
      }
      setMyQuestions([...myQuestions, newCard])
      setQuestions([...questions, newCard])

      toast({
        title: "Question Added",
        description: "Your question card has been added to the game",
      })
    } catch (err: any) {
      console.error("Error adding question:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to add question",
        variant: "destructive",
      })
    }
  }

  const startGame = async () => {
    if (!roomData || !isRoomCreator) return

    try {
      // Check if all users have created 3 questions
      const { data: roomUsers, error: usersError } = await supabase
        .from("room_users")
        .select("*")
        .eq("room_id", roomData.id)

      if (usersError) throw usersError

      const { data: allQuestions, error: questionsError } = await supabase
        .from("question_cards")
        .select("*")
        .eq("room_id", roomData.id)

      if (questionsError) throw questionsError

      // Check if each user has created exactly 3 questions
      const userQuestionCounts: Record<string, number> = {}
      allQuestions.forEach((q: any) => {
        userQuestionCounts[q.guest_id] = (userQuestionCounts[q.guest_id] || 0) + 1
      })

      const incompleteUsers = roomUsers.filter(
        (user: any) => !userQuestionCounts[user.guest_id] || userQuestionCounts[user.guest_id] < 3,
      )

      if (incompleteUsers.length > 0) {
        toast({
          title: "Cannot Start Game",
          description: "All players must create 3 question cards first",
          variant: "destructive",
        })
        return
      }

      // Update room status
      const { error: updateError } = await supabase.from("rooms").update({ status: "playing" }).eq("id", roomData.id)

      if (updateError) throw updateError

      // Distribute cards
      const userIds = roomUsers.map((user: any) => user.guest_id)
      const cardDistribution = distributeCards(allQuestions, userIds)

      // Record card distribution in game_sessions
      const gameSessionRecords = []

      for (const [userId, cards] of Object.entries(cardDistribution)) {
        for (const card of cards) {
          gameSessionRecords.push({
            room_id: roomData.id,
            guest_id: userId,
            card: card.question,
            action: "received",
          })
        }
      }

      const { error: sessionError } = await supabase.from("game_sessions").insert(gameSessionRecords)

      if (sessionError) throw sessionError

      // Notify all users that game has started
      const roomChannel = supabase.channel(`room:${roomCode}`)
      roomChannel.send({
        type: "broadcast",
        event: "game_started",
        payload: { started_by: guestId },
      })

      setGameStarted(true)

      toast({
        title: "Game Started",
        description: "Cards have been distributed to all players",
      })
    } catch (err: any) {
      console.error("Error starting game:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to start game",
        variant: "destructive",
      })
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    })
  }

  const copyRoomLink = () => {
    // Get the full URL to the current room
    const roomUrl = `${window.location.origin}/roomss/${roomCode}`
    navigator.clipboard.writeText(roomUrl)
    toast({
      title: "Link Copied!",
      description: "Room link copied to clipboard. Share it with friends to join directly!",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => router.push("/")} variant="outline">
                Return to Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-4 bg-[#004647]">
      <Header/>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 mt-20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Room: {roomCode}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>How to Play</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Joining the Game</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Share the room code with your friends</li>
                          <li>Players can join using the room code</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Creating Questions</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Each player must create 3 question cards</li>
                          <li>Questions should be thought-provoking and fun</li>
                          <li>Wait for all players to create their questions</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Starting the Game</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Only the room host can start the game</li>
                          <li>Game can only start when all players have created 3 questions</li>
                          <li>Questions will be distributed randomly to players</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">During the Game</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Click on cards around the table to view questions</li>
                          <li>Read and discuss the questions with other players</li>
                          <li>Have fun and enjoy the conversation!</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {users.length} {users.length === 1 ? "player" : "players"} in room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[1/1] max-w-2xl mx-auto bg-green-800 rounded-full border-8 border-brown-800 mb-8 shadow-2xl">
              {/* Efek cahaya pada meja */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-700 to-green-900 opacity-50"></div>
              
              {/* Meja Casino */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-2xl font-bold drop-shadow-lg">{roomCode}</div>
              </div>
              
              {/* Pemain mengelilingi meja */}
              <div className="absolute inset-0">
                {users.map((user, index) => {
                  const angle = (index * (360 / users.length)) * (Math.PI / 180);
                  const radius = 42;
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  
                  // Filter kartu untuk pemain ini
                  const playerCards = receivedCards.filter(card => card.guest_id === user.guest_id);
                  
                  return (
                    <div
                      key={user.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                    >
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          user.guest_id === guestId ? 'bg-blue-500' : 'bg-gray-600'
                        } shadow-lg border-2 border-white`}>
                          <span className="text-white font-bold">P{index + 1}</span>
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-sm drop-shadow-md">
                          {user.guest_id === guestId ? '(Anda)' : ''}
                          {user.guest_id === roomData.created_by ? ' (Host)' : ''}
                        </div>
                        
                        {/* Kartu di samping avatar */}
                        {gameStarted && playerCards.length > 0 && (
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                            }}
                            onClick={() => setSelectedCard({ cards: playerCards, playerIndex: index + 1 })}
                          >
                            <div className="relative w-12 h-16">
                              <Image
                                src="/images/card.png"
                                alt="Question Card"
                                fill
                                className="object-contain drop-shadow-lg"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                {/* <span className="text-white font-bold text-sm drop-shadow-md">
                                  {playerCards.length}
                                </span> */}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-4" />

            {!gameStarted ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Create Your Question Cards ({myQuestions.length}/3)</h3>
                  <div className="space-y-4">
                    {myQuestions.map((q, index) => (
                      <Card key={index} className="bg-muted">
                        <CardContent className="p-4">
                          <p>{q.question}</p>
                        </CardContent>
                      </Card>
                    ))}

                    {myQuestions.length < 3 && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your question here..."
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {isRoomCreator && (
                  <div className="text-center">
                    <Button onClick={startGame} disabled={questions.length < users.length * 3} className="w-full">
                      Start Game
                    </Button>
                    {questions.length < users.length * 3 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Waiting for all players to create 3 question cards
                      </p>
                    )}
                  </div>
                )}

                {!isRoomCreator && (
                  <Alert>
                    <AlertTitle>Waiting for host to start the game</AlertTitle>
                    <AlertDescription>Make sure you've created all 3 of your question cards</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Click on the cards around the table to view questions</p>
              </div>
            )}

            {/* Dialog untuk menampilkan pertanyaan */}
            <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Player {selectedCard?.playerIndex}'s Questions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  {selectedCard?.cards.map((card: any, index: number) => (
                    <Card key={index} className="bg-muted">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">Q{index + 1}</Badge>
                          <p className="text-lg">{card.card}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      <Footer/>
    </main>
  )
}
