interface LogoIconProps {
  className?: string
  size?: number
  color?: string
}

export function LogoIcon({ className = "", size = 32, color = "#111827" }: LogoIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="2" fill="white"/>
      {/* Pi symbol with serif flares */}
      {/* Horizontal bar - thick with subtle flares */}
      <path d="M9 12 L9.5 11.3 L22.5 11.3 L23 12 L22.5 12.7 L9.5 12.7 Z" fill={color}/>
      {/* Left vertical - thick with subtle flare at top */}
      <path d="M11 12 L11.3 11 L11.7 11 L12 12 L12 20 L11 20 Z" fill={color}/>
      {/* Right vertical - thick with subtle flare at top */}
      <path d="M20 12 L20.3 11 L20.7 11 L21 12 L21 20 L20 20 Z" fill={color}/>
    </svg>
  )
}

