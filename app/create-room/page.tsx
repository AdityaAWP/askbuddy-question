"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createGuestUser, getGuestUser } from "@/lib/guest-session"
import { createRoom } from "@/app/actions/room-actions"

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // Pre-fill player name if guest user exists
  useEffect(() => {
    const guestUser = getGuestUser()
    if (guestUser) {
      setPlayerName(guestUser.name)
    }
  }, [])

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) return

    setIsCreating(true)

    try {
      // Create or get guest user
      let guestUser = getGuestUser()

      if (!guestUser || guestUser.name !== playerName) {
        // Create a new guest user with the current name
        guestUser = createGuestUser(playerName)
      }

      // Create form data for server action
      const formData = new FormData()
      formData.append("roomName", roomName)
      formData.append("playerName", playerName)
      formData.append("guestId", guestUser.id)

      // Call server action to create room
      const result = await createRoom(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Room created!",
        description: "Your room has been created successfully.",
      })

      router.push(`/room/${result.roomId}`)
    } catch (error: any) {
      toast({
        title: "Error creating room",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="border-b border-gray-700">
          <Link href="/" className="text-gray-400 hover:text-gray-300 inline-flex items-center mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
          <CardTitle className="text-2xl text-red-500">Create a New Room</CardTitle>
          <CardDescription className="text-gray-400">
            Set up your question room and invite your friends to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="room-name" className="text-gray-300">
              Room Name
            </Label>
            <Input
              id="room-name"
              placeholder="e.g., Friday Night Questions"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
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
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCreateRoom}
            disabled={isCreating || !roomName.trim() || !playerName.trim()}
          >
            {isCreating ? "Creating Room..." : "Create Room"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
