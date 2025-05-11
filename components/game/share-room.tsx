"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Mail, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "@/components/game/qr-code"

interface ShareRoomProps {
  roomCode: string
  roomName: string
}

export default function ShareRoom({ roomCode, roomName }: ShareRoomProps) {
  const { toast } = useToast()
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${roomCode}`
      : `https://question-card-game.vercel.app/join/${roomCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl)
    toast({
      title: "Link copied!",
      description: "Room link copied to clipboard",
    })
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join my Question Card Game: ${roomName}`)
    const body = encodeURIComponent(
      `Hey! I've created a table for us to play the Question Card Game. Join me here: ${roomUrl}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Join my Question Card Game table "${roomName}": ${roomUrl}`)
    window.open(`sms:?body=${message}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          value={roomUrl}
          readOnly
          className="flex-1 bg-gray-700 border-gray-600 text-white"
          aria-label="Room URL"
        />
        <Button variant="outline" onClick={copyLink} className="border-gray-600 text-gray-300" aria-label="Copy link">
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-gray-600 text-gray-300"
          onClick={copyLink}
        >
          <Copy className="h-4 w-4" /> Copy
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-gray-600 text-gray-300"
          onClick={shareViaEmail}
        >
          <Mail className="h-4 w-4" /> Email
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 border-gray-600 text-gray-300"
          onClick={shareViaSMS}
        >
          <MessageSquare className="h-4 w-4" /> SMS
        </Button>
      </div>

      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 text-center">
        <p className="text-lg font-bold text-white mb-2">Room Code</p>
        <p className="text-2xl font-mono tracking-wider text-yellow-400">{roomCode}</p>
        <p className="text-xs text-gray-400 mt-2">Share this code with your friends</p>
      </div>

      <div className="flex justify-center pt-2">
        <QRCode value={roomUrl} />
      </div>
    </div>
  )
}
