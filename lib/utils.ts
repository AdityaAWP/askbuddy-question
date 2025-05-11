import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Player colors
export const PLAYER_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

// Player avatars
export const PLAYER_AVATARS = [
  "👨‍💼", // Businessman
  "👩‍🎤", // Singer
  "🧔", // Bearded person
  "👩‍🔬", // Scientist
  "👨‍🎨", // Artist
  "👩‍🍳", // Chef
  "👨‍🚀", // Astronaut
  "👩‍⚕️", // Doctor
  "👨‍🏫", // Teacher
  "👩‍💻", // Programmer
  "🧙‍♂️", // Wizard
  "🧚‍♀️", // Fairy
  "🦸‍♂️", // Superhero
  "🦹‍♀️", // Supervillain
  "👮‍♂️", // Police
  "👷‍♀️", // Construction worker
]

// Sample starter questions
export const SAMPLE_QUESTIONS = [
  "If you could travel anywhere in the world, where would you go and why?",
  "What's your favorite childhood memory?",
  "If you could have dinner with any historical figure, who would it be?",
  "What's your dream job?",
  "What's the best piece of advice you've ever received?",
  "If you could master any skill instantly, what would it be?",
  "What's your favorite book or movie and why?",
  "If you could live in any fictional world, which would you choose?",
  "What's something you've always wanted to try but haven't yet?",
  "What's your favorite way to relax after a long day?",
  "If you could have any superpower, what would it be?",
  "What's the most beautiful place you've ever been?",
  "What's something that always makes you laugh?",
  "If you could solve one world problem, what would it be?",
  "What's your favorite food to cook or eat?",
]

// Function to get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// Function to get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Function to generate a random avatar and color
export function generatePlayerAvatar(index = 0) {
  return {
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    avatar_emoji: getRandomItem(PLAYER_AVATARS),
  }
}
