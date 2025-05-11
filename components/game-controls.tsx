"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Users, MessageSquare, Share2 } from "lucide-react"
import AddQuestionForm from "@/components/add-question-form"
import ShareRoom from "@/components/share-room"

interface GameControlsProps {
  questions: string[]
  onAddQuestion: (question: string) => void
  participants: string[]
  onAddParticipant: (name: string) => void
  roomId: string
  roomName: string
}

export default function GameControls({
  questions,
  onAddQuestion,
  participants,
  onAddParticipant,
  roomId,
  roomName,
}: GameControlsProps) {
  return (
    <div className="absolute top-4 right-4 w-80 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-700">
          <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-gray-800">
            <MessageSquare className="h-4 w-4" /> Cards
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2 data-[state=active]:bg-gray-800">
            <Users className="h-4 w-4" /> Players
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2 data-[state=active]:bg-gray-800">
            <Share2 className="h-4 w-4" /> Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-0">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-4">
              <AddQuestionForm onAddQuestion={onAddQuestion} />

              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3 text-gray-300">Card Deck ({questions.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {questions.map((q, index) => (
                    <div key={index} className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="mt-0">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-3 text-gray-300">Players ({participants.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {participants.map((name, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 border border-gray-600 rounded-lg flex items-center text-gray-200"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${index === 0 ? "bg-yellow-500" : "bg-blue-500"} flex items-center justify-center mr-3`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span>
                      {name} {index === 0 ? "(Host)" : ""}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-2">Add a player to the table:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Player name"
                    id="new-participant"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                    onClick={() => {
                      const input = document.getElementById("new-participant") as HTMLInputElement
                      if (input && input.value.trim()) {
                        onAddParticipant(input.value)
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="mt-0">
          <ShareRoom roomId={roomId} roomName={roomName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
