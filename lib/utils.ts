import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shuffle an array (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Distribute cards evenly among players
export function distributeCards(cards: any[], playerIds: string[]): Record<string, any[]> {
  const shuffledCards = shuffleArray(cards)
  const distribution: Record<string, any[]> = {}

  playerIds.forEach((id) => {
    distribution[id] = []
  })

  shuffledCards.forEach((card, index) => {
    const playerIndex = index % playerIds.length
    distribution[playerIds[playerIndex]].push(card)
  })

  return distribution
}
