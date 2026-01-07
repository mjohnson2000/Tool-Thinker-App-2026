"use client"

import { useState } from "react"

interface ToolOutputPreviewProps {
  toolId: string
  toolName: string
  outputData: any
  compact?: boolean
}

/**
 * Preview component that shows key metrics from tool outputs
 * in a user-friendly format instead of raw JSON
 */
export function ToolOutputPreview({
  toolId,
  toolName,
  outputData,
  compact = false,
}: ToolOutputPreviewProps) {
  const [expanded, setExpanded] = useState(!compact)

  function extractKeyMetrics() {
    if (!outputData) return null

    switch (toolId) {
      case "valuation-calculator":
        return {
          title: "Valuation Range",
          metrics: [
            {
              label: "Most Likely",
              value: outputData.pre_money_valuation?.most_likely?.value || "N/A",
            },
            {
              label: "Suggested Range",
              value: outputData.recommendations?.suggested_range || "N/A",
            },
          ],
        }

      case "market-size-calculator":
        return {
          title: "Market Size",
          metrics: [
            {
              label: "TAM",
              value: outputData.tam || "N/A",
            },
            {
              label: "SAM",
              value: outputData.sam || "N/A",
            },
            {
              label: "SOM",
              value: outputData.som || "N/A",
            },
          ],
        }

      case "pricing-strategy-calculator":
        return {
          title: "Pricing Strategy",
          metrics: [
            {
              label: "Recommended Price",
              value: outputData.recommended_price || "N/A",
            },
            {
              label: "Strategy",
              value: outputData.pricing_strategy || "N/A",
            },
          ],
        }

      case "financial-model-calculator":
        return {
          title: "Financial Model",
          metrics: [
            {
              label: "Unit Economics",
              value: outputData.unit_economics
                ? JSON.stringify(outputData.unit_economics).substring(0, 50) + "..."
                : "N/A",
            },
            {
              label: "Revenue Projection",
              value: outputData.revenue_projection || "N/A",
            },
          ],
        }

      case "runway-calculator":
        return {
          title: "Runway",
          metrics: [
            {
              label: "Months Remaining",
              value: outputData.months_remaining || "N/A",
            },
            {
              label: "Burn Rate",
              value: outputData.burn_rate || "N/A",
            },
          ],
        }

      default:
        return null
    }
  }

  const keyMetrics = extractKeyMetrics()

  if (!keyMetrics) {
    // Fallback to JSON preview
    return (
      <div className="bg-white rounded p-2 max-h-32 overflow-y-auto">
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(outputData, null, 2).substring(0, 200)}
          {JSON.stringify(outputData, null, 2).length > 200 && "..."}
        </pre>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-semibold text-gray-900">{keyMetrics.title}</h5>
        {compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        )}
      </div>
      {expanded && (
        <div className="space-y-2">
          {keyMetrics.metrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <span className="text-xs text-gray-600">{metric.label}:</span>
              <span className="text-xs font-medium text-gray-900 text-right ml-2">
                {metric.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

