import Link from "next/link"
import { cn } from "@/lib/utils"
import { LogoIcon } from "./LogoIcon"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md", variant = "dark" }: LogoProps & { variant?: "dark" | "light" }) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 64,
  }

  const isLight = variant === "light"
  const textColor = isLight ? "text-white" : "text-gray-900"
  const iconColor = isLight ? "#ffffff" : "#111827"

  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <LogoIcon size={sizeMap[size]} color={iconColor} />
      {showText && (
        <span className={cn("text-2xl font-bold", textColor)}>Tool Thinker</span>
      )}
    </Link>
  )
}

