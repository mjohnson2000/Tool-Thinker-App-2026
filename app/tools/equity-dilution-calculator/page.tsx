"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"
import { TrendingDown } from "lucide-react"
import { logger } from "@/lib/logger"

interface FundingRound {
  round_name: string
  funding_amount: string
  pre_money_valuation: string
  option_pool_percentage?: string
}

interface Dilution {
  initial_ownership: {
    founder_percentage: string
    total_shares: string
  }
  rounds: Array<{
    round_name: string
    pre_money_valuation: string
    funding_amount: string
    post_money_valuation: string
    investor_equity_percentage: string
    option_pool_percentage: string
    founder_ownership_before: string
    founder_ownership_after: string
    dilution_this_round: string
    cumulative_dilution: string
  }>
  final_ownership: {
    founder_percentage: string
    total_dilution: string
    remaining_equity_value: string
  }
  ownership_breakdown: {
    founders: string
    investors: string
    option_pool: string
    others: string
  }
  insights: {
    most_dilutive_round: string
    option_pool_impact: string
    recommendations: string[]
  }
}

export default function EquityDilutionCalculatorPage() {
  const [currentOwnership, setCurrentOwnership] = useState("100")
  const [optionPoolPercentage, setOptionPoolPercentage] = useState("")
  const [fundingRoundsJson, setFundingRoundsJson] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [dilution, setDilution] = useState<Dilution | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateDilution = useCallback(async () => {
    setIsCalculating(true)
    setError(null)
    setDilution(null)

    try {
      // Validate current ownership
      const ownershipNum = parseFloat(currentOwnership)
      if (isNaN(ownershipNum) || ownershipNum < 0 || ownershipNum > 100) {
        throw new Error("Current ownership must be a number between 0 and 100")
      }

      // Validate option pool if provided
      if (optionPoolPercentage.trim()) {
        const poolNum = parseFloat(optionPoolPercentage)
        if (isNaN(poolNum) || poolNum < 0 || poolNum > 100) {
          throw new Error("Option pool percentage must be a number between 0 and 100")
        }
      }

      let fundingRounds: FundingRound[] | undefined = undefined
      if (fundingRoundsJson.trim()) {
        try {
          const parsed = JSON.parse(fundingRoundsJson)
          if (!Array.isArray(parsed)) {
            throw new Error("Funding rounds must be a JSON array")
          }
          fundingRounds = parsed
        } catch (parseError: unknown) {
          const errorMsg = parseError instanceof Error ? parseError.message : "Invalid JSON format"
          throw new Error(`Invalid JSON format for funding rounds: ${errorMsg}`)
        }
      }

      const response = await fetch("/api/equity-dilution-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentOwnership: currentOwnership.trim() || "100",
          optionPoolPercentage: optionPoolPercentage.trim() || undefined,
          fundingRounds: fundingRounds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate dilution")
      }

      const data = await response.json()
      setDilution(data)
    } catch (err: unknown) {
      logger.error("Calculation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to calculate equity dilution. Please try again."
      setError(errorMessage)
    } finally {
      setIsCalculating(false)
    }
  }, [currentOwnership, optionPoolPercentage, fundingRoundsJson]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Equity Dilution Calculator" toolId="equity-dilution-calculator" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg mx-auto">
              <TrendingDown className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Equity Dilution Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Calculate how funding rounds affect your ownership percentage
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {!dilution ? (
          <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-gray-100">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentOwnership" className="block text-sm font-semibold text-gray-900 mb-3">
                    Current Founder Ownership %
                  </label>
                  <Input
                    id="currentOwnership"
                    type="number"
                    min="0"
                    max="100"
                    value={currentOwnership}
                    onChange={(e) => setCurrentOwnership(e.target.value)}
                    placeholder="100"
                    className="border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl py-3"
                  />
                  <p className="mt-2 text-xs text-gray-500">Default: 100% (before any rounds)</p>
                </div>

                <div>
                  <label htmlFor="optionPoolPercentage" className="block text-sm font-semibold text-gray-900 mb-3">
                    Option Pool % <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    id="optionPoolPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={optionPoolPercentage}
                    onChange={(e) => setOptionPoolPercentage(e.target.value)}
                    placeholder="e.g., 15"
                    className="border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl py-3"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fundingRoundsJson" className="block text-sm font-semibold text-gray-900 mb-3">
                  Funding Rounds (JSON Format) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  id="fundingRoundsJson"
                  value={fundingRoundsJson}
                  onChange={(e) => setFundingRoundsJson(e.target.value)}
                  placeholder={`[
  {
    "round_name": "Seed",
    "funding_amount": "500000",
    "pre_money_valuation": "3000000",
    "option_pool_percentage": "15"
  },
  {
    "round_name": "Series A",
    "funding_amount": "2000000",
    "pre_money_valuation": "8000000",
    "option_pool_percentage": "20"
  }
]`}
                  rows={12}
                  className="font-mono text-sm border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl resize-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave blank to see a sample scenario. Include round_name, funding_amount, pre_money_valuation, and optionally option_pool_percentage for each round.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateDilution}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating Dilution...
                  </span>
                ) : (
                  "Calculate Equity Dilution"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Equity Dilution Analysis</h2>
                  <p className="text-gray-300 text-lg">Initial Ownership: {dilution.initial_ownership.founder_percentage}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ShareButton toolName="Equity Dilution Calculator" toolId="equity-dilution-calculator" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" />
                <Button
                  onClick={() => {
                    setDilution(null)
                    setCurrentOwnership("100")
                    setOptionPoolPercentage("")
                    setFundingRoundsJson("")
                  }}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Calculate New Dilution
                </Button>
              </div>
            </div>

            {/* Final Ownership */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Final Ownership</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Founder Ownership</p>
                  <p className="text-4xl font-bold text-blue-900">{dilution.final_ownership.founder_percentage}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-1">Total Dilution</p>
                  <p className="text-4xl font-bold text-red-900">{dilution.final_ownership.total_dilution}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-500">
                  <p className="text-sm text-gray-600 mb-1">Remaining Equity Value</p>
                  <p className="text-2xl font-bold text-gray-900">{dilution.final_ownership.remaining_equity_value}</p>
                </div>
              </div>
            </div>

            {/* Round-by-Round Breakdown */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Round-by-Round Breakdown</h2>
              </div>
              <div className="space-y-4">
                {dilution.rounds.map((round, idx) => (
                  <div key={idx} className="border-l-4 border-gray-900 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{round.round_name}</h3>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Dilution this round</p>
                        <p className="text-2xl font-bold text-red-600">{round.dilution_this_round}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Pre-Money Valuation</p>
                        <p className="text-lg font-semibold text-gray-900">{round.pre_money_valuation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Funding Amount</p>
                        <p className="text-lg font-semibold text-gray-900">{round.funding_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Post-Money Valuation</p>
                        <p className="text-lg font-semibold text-gray-900">{round.post_money_valuation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Investor Equity</p>
                        <p className="text-lg font-semibold text-gray-900">{round.investor_equity_percentage}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Founder Ownership Before</p>
                        <p className="text-lg font-semibold text-gray-900">{round.founder_ownership_before}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Founder Ownership After</p>
                        <p className="text-lg font-semibold text-gray-900">{round.founder_ownership_after}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm text-gray-600">Cumulative Dilution</p>
                      <p className="text-xl font-bold text-red-600">{round.cumulative_dilution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership Breakdown */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Ownership Breakdown</h2>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Founders</p>
                  <p className="text-3xl font-bold text-blue-900">{dilution.ownership_breakdown.founders}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Investors</p>
                  <p className="text-3xl font-bold text-green-900">{dilution.ownership_breakdown.investors}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Option Pool</p>
                  <p className="text-3xl font-bold text-yellow-900">{dilution.ownership_breakdown.option_pool}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Others</p>
                  <p className="text-3xl font-bold text-gray-900">{dilution.ownership_breakdown.others}</p>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Key Insights</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Dilutive Round</h3>
                  <p className="text-gray-700">{dilution.insights.most_dilutive_round}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Option Pool Impact</h3>
                  <p className="text-gray-700">{dilution.insights.option_pool_impact}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {dilution.insights.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

