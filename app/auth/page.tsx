import AuthForm from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AuthPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-gray-400 hover:text-gray-300 inline-flex items-center mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>
        <AuthForm />
      </div>
    </div>
  )
}
