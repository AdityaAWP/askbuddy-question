"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, generateGuestId, generateRoomCode } from "@/lib/supabase"

export default function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Set guest ID in localStorage if it doesn't exist
  useEffect(() => {
    if (!localStorage.getItem("guestId")) {
      localStorage.setItem("guestId", generateGuestId())
    }
  }, [])

  const createRoom = async () => {
    try {
      setLoading(true)
      setError("")

      const guestId = localStorage.getItem("guestId")
      if (!guestId) {
        throw new Error("Guest ID not found")
      }

      const newRoomCode = generateRoomCode()

      // Insert new room
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .insert({
          room_code: newRoomCode,
          created_by: guestId,
          status: "waiting",
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Add creator to room_users
      const { error: userError } = await supabase.from("room_users").insert({
        room_id: roomData.id,
        guest_id: guestId,
      })

      if (userError) throw userError

      router.push(`/roomss/${newRoomCode}`)
    } catch (err: any) {
      console.error("Error creating room:", err)
      setError(err.message || "Failed to create room")
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    try {
      setLoading(true)
      setError("")

      if (!roomCode.trim()) {
        throw new Error("Please enter a room code")
      }

      const guestId = localStorage.getItem("guestId")
      if (!guestId) {
        throw new Error("Guest ID not found")
      }

      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", roomCode.toUpperCase())
        .single()

      if (roomError) throw new Error("Room not found")

      // Check if user is already in the room
      const { data: existingUser } = await supabase
        .from("room_users")
        .select("*")
        .eq("room_id", roomData.id)
        .eq("guest_id", guestId)
        .single()

      // Add user to room if not already there
      if (!existingUser) {
        const { error: userError } = await supabase.from("room_users").insert({
          room_id: roomData.id,
          guest_id: guestId,
        })

        if (userError) throw userError
      }

      router.push(`/roomss/${roomCode}`)
    } catch (err: any) {
      console.error("Error joining room:", err)
      setError(err.message || "Failed to join room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4  bg-[#004647]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Question Card Game</CardTitle>
          <CardDescription className="text-center">Create or join a room to play with friends</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new game room and invite your friends to join
                </p>
                <Button onClick={createRoom} disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create New Room"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="join" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Enter Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                </div>
                <Button onClick={joinRoom} disabled={loading || !roomCode.trim()} className="w-full">
                  {loading ? "Joining..." : "Join Room"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && <div className="mt-4 p-2 bg-red-50 text-red-500 rounded text-sm text-center">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Create 3 question cards and exchange them with other players!
        </CardFooter>
      </Card>
    </main>
  )
}
