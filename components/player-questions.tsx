"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PlayerQuestionsProps {
  playerName: string
  questions: string[]
  onClose: () => void
}

export default function PlayerQuestions({ playerName, questions, onClose }: PlayerQuestionsProps) {
  return (
    <Card className="w-80 bg-gray-800 border-gray-700 text-white shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-gray-700">
        <CardTitle className="text-lg font-bold">{playerName}'s Questions</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {questions.length > 0 ? (
          <ul className="space-y-2">
            {questions.map((question, index) => (
              <li key={index} className="p-2 bg-gray-700 rounded border border-gray-600 text-sm">
                {question}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-4">No questions remaining</p>
        )}
      </CardContent>
    </Card>
  )
}
