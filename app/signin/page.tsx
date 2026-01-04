"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()

  // For MVP, just redirect to dashboard
  // Replace with actual auth later
  function handleSignIn() {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          For MVP, authentication is simplified. Click below to continue.
        </p>
        <button
          onClick={handleSignIn}
          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          Continue to Dashboard
        </button>
        <p className="text-xs text-gray-500 mt-4 text-center">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}




