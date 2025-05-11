import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut, Users } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user's active rooms
  const { data: hostedRooms } = await supabase
    .from("rooms")
    .select("*, players(count)")
    .eq("host_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get rooms where user is a player but not host
  const { data: joinedRooms } = await supabase
    .from("players")
    .select("rooms(*)")
    .eq("user_id", session.user.id)
    .neq("is_host", true)
    .order("created_at", { ascending: false })

  // Format joined rooms
  const formattedJoinedRooms =
    joinedRooms?.map((item) => ({
      ...item.rooms,
      players: { count: 0 }, // We don't have the count here, but we need the structure
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Question Card Game</h1>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" className="text-gray-300 border-gray-600">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Rooms</h2>
              <Link href="/create-room">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" /> Create Room
                </Button>
              </Link>
            </div>

            {hostedRooms && hostedRooms.length > 0 ? (
              <div className="space-y-4">
                {hostedRooms.map((room) => (
                  <Card key={room.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Room Code: <span className="font-mono text-yellow-400">{room.code}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{room.players?.count || 0} players</span>
                        <span className="mx-2">•</span>
                        <span>Status: {room.status}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/room/${room.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-gray-600">
                          Enter Room
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-400">You haven't created any rooms yet.</p>
                  <Link href="/create-room" className="mt-4 inline-block">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" /> Create Your First Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Joined Rooms</h2>
              <Link href="/join">
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Plus className="h-4 w-4 mr-2" /> Join Room
                </Button>
              </Link>
            </div>

            {formattedJoinedRooms && formattedJoinedRooms.length > 0 ? (
              <div className="space-y-4">
                {formattedJoinedRooms.map((room) => (
                  <Card key={room.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle>{room.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        Room Code: <span className="font-mono text-yellow-400">{room.code}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-gray-400">
                        <span>Status: {room.status}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/room/${room.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-gray-600">
                          Enter Room
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-400">You haven't joined any rooms yet.</p>
                  <Link href="/join" className="mt-4 inline-block">
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <Plus className="h-4 w-4 mr-2" /> Join a Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
