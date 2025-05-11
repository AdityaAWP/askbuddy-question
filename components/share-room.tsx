"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Mail, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "@/components/qr-code"

interface ShareRoomProps {
  roomId: string
  roomName: string
}

export default function ShareRoom({ roomId, roomName }: ShareRoomProps) {
  const { toast } = useToast()
  const roomUrl =
    typeof window !== "undefined" ? window.location.href : `https://question-card-game.vercel.app/room/${roomId}`

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
      <h4 className="text-sm font-medium text-gray-400 mb-2">Share This Room</h4>

      <div className="flex items-center space-x-2">
        <Input value={roomUrl} readOnly className="flex-1 bg-gray-700 border-gray-600 text-white" />
        <Button variant="outline" onClick={copyLink} className="border-gray-600 text-gray-300">
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

      <div className="flex justify-center pt-2">
        <QRCode value={roomUrl} />
      </div>
    </div>
  )
}
