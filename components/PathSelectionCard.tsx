"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { FolderOpen, Lightbulb, Compass } from "lucide-react"

interface PathSelectionCardProps {
  path: "project" | "discovery" | "explore"
  title: string
  description: string
  benefits: string[]
  iconName: "folder" | "lightbulb" | "compass"
  iconColor: string
  iconBgColor: string
  href: string
  className?: string
}

const iconMap = {
  folder: FolderOpen,
  lightbulb: Lightbulb,
  compass: Compass,
}

export function PathSelectionCard({
  path,
  title,
  description,
  benefits,
  iconName,
  iconColor,
  iconBgColor,
  href,
  className = "",
}: PathSelectionCardProps) {
  const Icon = iconMap[iconName]
  const { user } = useAuth()
  const router = useRouter()

  async function handleClick() {
    // Track path selection for new users
    if (user) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          // Update user preferences to track path selection
          await supabase
            .from("user_preferences")
            .upsert(
              {
                user_id: user.id,
                preferences: {
                  onboarding_path: path,
                  onboarding_started: true,
                },
              },
              { onConflict: "user_id" }
            )
        }
      } catch (error) {
        console.error("Error saving path selection:", error)
      }
    }

    // Navigate with onboarding parameter if it's a new user
    const onboardingParam = path === "project" ? "?onboarding=project" : path === "discovery" ? "?onboarding=true" : "?onboarding=true"
    router.push(href + onboardingParam)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`group p-6 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-white transition-all border-2 border-white/20 hover:border-white shadow-xl hover:shadow-2xl transform hover:scale-105 ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center mb-3 group-hover:opacity-80 transition-opacity`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {description}
        </p>
        <div className="text-xs text-gray-500 space-y-0.5">
          {benefits.map((benefit, idx) => (
            <p key={idx}>✓ {benefit}</p>
          ))}
        </div>
      </div>
    </Link>
  )
}

