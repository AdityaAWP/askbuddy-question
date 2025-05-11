"use client"

import { motion } from "framer-motion"

interface SwapAnimationProps {
  from: { x: string; y: string }
  to: { x: string; y: string }
  color: string
  question: string
}

export default function SwapAnimation({ from, to, color, question }: SwapAnimationProps) {
  // Convert percentage positions to viewport units for animation
  const fromX = Number.parseFloat(from.x)
  const fromY = Number.parseFloat(from.y)
  const toX = Number.parseFloat(to.x)
  const toY = Number.parseFloat(to.y)

  // Calculate a curved path through the center
  const controlX = 50 // Center of the table
  const controlY = 50

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <path
            id={`path-${fromX}-${fromY}-${toX}-${toY}`}
            d={`M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
        </defs>
      </svg>

      <motion.div
        className={`absolute w-12 h-16 ${color} rounded-lg border-2 border-white shadow-lg flex items-center justify-center text-white font-bold z-50`}
        style={{
          left: `${fromX}%`,
          top: `${fromY}%`,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          offsetPath: `path('M ${fromX}% ${fromY}% Q ${controlX}% ${controlY}% ${toX}% ${toY}%')`,
          offsetDistance: "100%",
          scale: [0.5, 1, 1, 0.5],
          opacity: [0, 1, 1, 0],
          rotateY: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          times: [0, 0.3, 0.7, 1],
          ease: "easeInOut",
        }}
      >
        ?
        <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black bg-opacity-80 rounded-lg flex items-center justify-center p-2 text-xs text-center transition-opacity">
          {question.length > 50 ? question.substring(0, 50) + "..." : question}
        </div>
      </motion.div>
    </div>
  )
}
