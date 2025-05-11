import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-gray-500 hover:text-gray-700 inline-flex items-center mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Creating a Room</h2>
              <p className="text-gray-700 mb-4">
                Start by creating a room where you and your friends can gather. Give your room a name that reflects the
                occasion or group.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click on "Create a Room" on the homepage</li>
                  <li>Enter a room name (e.g., "Friday Night Hangout")</li>
                  <li>Enter your name as the host</li>
                  <li>Click "Create Room" to generate your unique room</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Adding Questions</h2>
              <p className="text-gray-700 mb-4">
                Your room comes pre-loaded with some starter questions, but the real fun begins when you add your own!
              </p>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to the "Questions" tab in your room</li>
                  <li>Type your question in the text area</li>
                  <li>Click "Add Question" to add it to the deck</li>
                  <li>Add as many questions as you'd like</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Inviting Friends</h2>
              <p className="text-gray-700 mb-4">
                Share your room with friends so they can join the fun. Everyone who joins can see and answer the
                questions.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to the "Share" tab in your room</li>
                  <li>Copy the room link or use the QR code</li>
                  <li>Share the link via email, SMS, or your favorite messaging app</li>
                  <li>Friends can join by simply opening the link</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Playing the Game</h2>
              <p className="text-gray-700 mb-4">
                Once everyone is in the room, it's time to start drawing random questions and having conversations!
              </p>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click "Draw Random Question" to get a random card from the deck</li>
                  <li>The question appears on the card for everyone to see</li>
                  <li>Take turns answering the question in real life</li>
                  <li>Draw another question when you're ready to continue</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Tips for Great Conversations</h2>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ul className="list-disc list-inside space-y-2">
                  <li>Create a mix of light-hearted and deeper questions</li>
                  <li>Give everyone a chance to answer before moving to the next question</li>
                  <li>Follow up on interesting answers to keep the conversation flowing</li>
                  <li>Remember there are no right or wrong answers - it's about sharing and connecting</li>
                  <li>Feel free to skip a question if someone isn't comfortable answering</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link href="/create-room">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full">
                Create Your First Room
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
