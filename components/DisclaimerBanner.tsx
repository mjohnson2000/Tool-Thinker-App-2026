"use client"

import Link from "next/link"

interface DisclaimerBannerProps {
  variant?: "full" | "compact"
  className?: string
}

export function DisclaimerBanner({ variant = "compact", className = "" }: DisclaimerBannerProps) {
  if (variant === "compact") {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-700">
          <strong>Disclaimer:</strong> Tool Thinker provides informational tools only. Not professional advice.{" "}
          <Link href="/disclaimer" className="underline hover:text-gray-900">
            Learn more
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 border-l-4 border-gray-400 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Disclaimer</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        <strong>Tool Thinker provides informational tools and frameworks only.</strong> The Service is not intended to provide professional, legal, financial, or business advice. All content, including AI-generated content, is for informational and educational purposes only.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        Tool Thinker is not responsible for any losses, damages, or consequences resulting from your use of the Service. Always consult with qualified professionals before making important business decisions.
      </p>
      <Link href="/disclaimer" className="text-sm text-gray-900 underline hover:text-gray-700 font-medium">
        Read full disclaimer →
      </Link>
    </div>
  )
}

