"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface QuestionCardProps {
  question: string | null
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [displayQuestion, setDisplayQuestion] = useState(question)

  useEffect(() => {
    if (question !== displayQuestion) {
      setIsFlipped(true)

      // After the card flips, update the question
      const timer = setTimeout(() => {
        setDisplayQuestion(question)
        setIsFlipped(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [question, displayQuestion])

  return (
    <div className="perspective-1000">
      <motion.div
        id="question-card"
        className="w-64 h-96 cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full rounded-xl shadow-2xl ${
            displayQuestion ? "bg-white text-gray-900" : "bg-red-600"
          } flex items-center justify-center p-6 text-center border-4 border-gray-200 relative preserve-3d`}
        >
          {/* Card back */}
          {!displayQuestion && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-red-600 border-4 border-white">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-red-600 text-5xl font-bold">?</span>
              </div>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)",
                }}
              ></div>
            </div>
          )}

          {/* Card front */}
          {displayQuestion && (
            <div className="absolute inset-0 flex flex-col rounded-lg bg-white border-4 border-gray-200 p-4">
              <div className="bg-red-600 text-white text-center py-2 rounded-t-lg -mt-4 -mx-4 mb-4">
                <h3 className="font-bold">QUESTION</h3>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-medium">{displayQuestion}</p>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">Tap card to flip</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
