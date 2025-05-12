import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const RoomsLanding = () => {
  return (
    <div className="min-h-screen  text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span>Play Together With Your Friends</span>
          </h1>
          <p className="text-xl text-white-300 mb-8">
            Create a virtual table, invite your friends, and let the conversation flow with randomly generated question
            cards. Just like a game night, but with fun twist!
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Link href="/create-room">
              <Button size="lg" className="bg-[#f2efde] hover:bg-white text-black px-8 py-6 text-lg rounded-full">
                Create a Room <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/join">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Join a Room
              </Button>
            </Link>
          </div>

          <div className="relative mt-16 mb-8">
            <div className="w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full bg-green-800 border-8 border-brown-800 shadow-2xl flex items-center justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-green-700 border-4 border-brown-700 flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-green-600 border-2 border-brown-600 flex items-center justify-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">DEAL ME IN</div>
                </div>
              </div>
            </div>

            {/* Decorative cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[120px] -translate-y-[140px] transform rotate-[-30deg]">
              <div className="w-16 h-24 bg-red-600 rounded-lg border-2 border-white shadow-lg"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-[20px] -translate-y-[160px] transform rotate-[15deg]">
              <div className="w-16 h-24 bg-blue-600 rounded-lg border-2 border-white shadow-lg"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 translate-x-[80px] -translate-y-[130px] transform rotate-[40deg]">
              <div className="w-16 h-24 bg-yellow-500 rounded-lg border-2 border-white shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomsLanding