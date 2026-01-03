import Image from "next/image"

interface LogoIconProps {
  className?: string
  size?: number
  color?: string
}

export function LogoIcon({ className = "", size = 32, color = "#111827" }: LogoIconProps) {
  return (
    <Image
      src="/logo.png"
      alt="Tool Thinker Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  )
}

