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
import { AlertCircle, Copy, Users } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

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

  const guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : null
  const isRoomCreator = roomData?.created_by === guestId

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
        // Refresh user list when someone joins
        fetchRoomData()
      })
      .on("broadcast", { event: "question_added" }, (payload) => {
        // Refresh questions when a new one is added
        fetchRoomData()
      })
      .on("broadcast", { event: "game_started" }, (payload) => {
        // Update game state when game starts
        setGameStarted(true)
        fetchRoomData()
      })
      .subscribe()

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
    <main className="min-h-screen p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Room: {roomCode}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyRoomCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button variant="default" size="sm" onClick={copyRoomLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
            <CardDescription className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {users.length} {users.length === 1 ? "player" : "players"} in room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {users.map((user, index) => (
                <Badge key={user.id} variant={user.guest_id === guestId ? "default" : "outline"}>
                  Player {index + 1} {user.guest_id === guestId ? "(You)" : ""}
                  {user.guest_id === roomData.created_by ? " (Host)" : ""}
                </Badge>
              ))}
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
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Your Received Question Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedCards.map((card, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <p className="text-lg">{card.card}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
