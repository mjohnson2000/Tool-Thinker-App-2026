"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

interface AuthPromptProps {
  title: string
  message: string
  redirectPath?: string
  redirectLabel?: string
}

export function AuthPrompt({
  title,
  message,
  redirectPath = "/signin",
  redirectLabel = "Sign In",
}: AuthPromptProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 text-center">
      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link href={redirectPath}>
        <Button className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
          {redirectLabel}
        </Button>
      </Link>
    </div>
  )
}
