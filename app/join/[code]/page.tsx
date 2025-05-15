"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { createGuestUser, getGuestUser } from "@/lib/guest-session"
import { joinRoom } from "@/app/actions/room-actions"

export default function JoinRoomWithCodePage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [roomDetails, setRoomDetails] = useState<{ id: string; name: string } | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()
  const roomCode = params.code.toUpperCase()

  useEffect(() => {
    const guestUser = getGuestUser()
    if (guestUser) {
      setPlayerName(guestUser.name)
    }
  }, [])

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data: room, error } = await supabase.from("rooms").select("id, name").eq("code", roomCode).single()

        if (error) {
          throw error
        }

        setRoomDetails(room)
      } catch (error: any) {
        toast({
          title: "Room not found",
          description: "The room code is invalid or the room no longer exists.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoomDetails()
  }, [roomCode, supabase, toast])

  const handleJoinRoom = async () => {
    if (!roomDetails || !playerName.trim()) return

    setIsJoining(true)

    try {
      let guestUser = getGuestUser()

      if (!guestUser || guestUser.name !== playerName) {
        guestUser = createGuestUser(playerName)
      }

      const formData = new FormData()
      formData.append("roomCode", roomCode)
      formData.append("playerName", playerName)
      formData.append("guestId", guestUser.id)

      const result = await joinRoom(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.message) {
        toast({
          title: "Rejoining room",
          description: "You're already a member of this room.",
        })
      } else {
        toast({
          title: "Joined room!",
          description: `You've joined ${roomDetails.name} successfully.`,
        })
      }

      router.push(`/room/${result.roomId}`)
    } catch (error: any) {
      toast({
        title: "Error joining room",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-400">Loading room details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!roomDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
          <CardHeader className="border-b border-gray-700">
            <Link href="/" className="text-gray-400 hover:text-gray-300 inline-flex items-center mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Link>
            <CardTitle className="text-2xl text-red-500">Room Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              The room code {roomCode} is invalid or the room no longer exists.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t border-gray-700 pt-4">
            <Link href="/join" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Try Another Code</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="border-b border-gray-700">
          <Link href="/" className="text-gray-400 hover:text-gray-300 inline-flex items-center mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
          <CardTitle className="text-2xl text-blue-500">Join Room</CardTitle>
          <CardDescription className="text-gray-400">
            You're joining <span className="font-semibold text-white">{roomDetails.name}</span> with code{" "}
            <span className="font-mono text-yellow-400">{roomCode}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="player-name" className="text-gray-300">
              Your Display Name
            </Label>
            <Input
              id="player-name"
              placeholder="e.g., Alex"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-gray-700 pt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleJoinRoom}
            disabled={isJoining || !playerName.trim()}
          >
            {isJoining ? "Joining Room..." : "Join Room"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
