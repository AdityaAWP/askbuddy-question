"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface AddQuestionFormProps {
  onAddQuestion: (question: string) => void
}

export default function AddQuestionForm({ onAddQuestion }: AddQuestionFormProps) {
  const [question, setQuestion] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      onAddQuestion(question)
      setQuestion("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Type your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[100px] bg-gray-700 border-gray-600 text-white"
      />
      <Button type="submit" disabled={!question.trim()} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Question
      </Button>
    </form>
  )
}
