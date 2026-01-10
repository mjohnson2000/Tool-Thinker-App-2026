import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "default" | "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = "default",
  width,
  height 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded"
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === "number" ? `${width}px` : width
  if (height) style.height = typeof height === "number" ? `${height}px` : height

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

// Pre-built skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function SkeletonProjectCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function SkeletonStatsCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
      <Skeleton className="h-4 w-20 mb-4" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

