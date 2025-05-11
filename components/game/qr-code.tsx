"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
}

export default function QRCode({ value, size = 150 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return

      // In a real implementation, we would use a QR code library
      // For this demo, we'll just show a placeholder
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw QR code placeholder
      ctx.fillStyle = "#1f2937"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid pattern
      ctx.fillStyle = "#ffffff"
      const cellSize = 10
      const margin = 20

      for (let y = margin; y < canvas.height - margin; y += cellSize) {
        for (let x = margin; x < canvas.width - margin; x += cellSize) {
          if (Math.random() > 0.7) {
            ctx.fillRect(x, y, cellSize - 1, cellSize - 1)
          }
        }
      }

      // Draw position markers
      ctx.fillStyle = "#ffffff"

      // Top-left marker
      ctx.fillRect(margin, margin, 30, 30)
      ctx.fillStyle = "#1f2937"
      ctx.fillRect(margin + 5, margin + 5, 20, 20)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(margin + 10, margin + 10, 10, 10)

      // Top-right marker
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(canvas.width - margin - 30, margin, 30, 30)
      ctx.fillStyle = "#1f2937"
      ctx.fillRect(canvas.width - margin - 25, margin + 5, 20, 20)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(canvas.width - margin - 20, margin + 10, 10, 10)

      // Bottom-left marker
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(margin, canvas.height - margin - 30, 30, 30)
      ctx.fillStyle = "#1f2937"
      ctx.fillRect(margin + 5, canvas.height - margin - 25, 20, 20)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(margin + 10, canvas.height - margin - 20, 10, 10)
    }

    generateQRCode()
  }, [value])

  return (
    <div className="border rounded-lg p-4 bg-gray-700 border-gray-600 inline-block">
      <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
    </div>
  )
}
