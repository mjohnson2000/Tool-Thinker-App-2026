"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

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

  async function calculateDilution() {
    setIsCalculating(true)
    setError(null)
    setDilution(null)

    try {
      let fundingRounds: FundingRound[] | undefined = undefined
      if (fundingRoundsJson.trim()) {
        try {
          fundingRounds = JSON.parse(fundingRoundsJson)
        } catch {
          throw new Error("Invalid JSON format for funding rounds")
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
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate equity dilution. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Equity Dilution Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate how funding rounds affect your ownership percentage
          </p>
        </div>

        {!dilution ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentOwnership" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Founder Ownership %
                  </label>
                  <Input
                    id="currentOwnership"
                    type="number"
                    value={currentOwnership}
                    onChange={(e) => setCurrentOwnership(e.target.value)}
                    placeholder="100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Default: 100% (before any rounds)</p>
                </div>

                <div>
                  <label htmlFor="optionPoolPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Option Pool % (Optional)
                  </label>
                  <Input
                    id="optionPoolPercentage"
                    type="number"
                    value={optionPoolPercentage}
                    onChange={(e) => setOptionPoolPercentage(e.target.value)}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fundingRoundsJson" className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Rounds (JSON Format - Optional)
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
                  className="font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave blank to see a sample scenario. Include round_name, funding_amount, pre_money_valuation, and optionally option_pool_percentage for each round.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateDilution}
                disabled={isCalculating}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isCalculating ? "Calculating Dilution..." : "Calculate Equity Dilution"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Equity Dilution Analysis</h2>
                <p className="text-gray-600 mt-1">Initial Ownership: {dilution.initial_ownership.founder_percentage}</p>
              </div>
              <Button
                onClick={() => {
                  setDilution(null)
                  setCurrentOwnership("100")
                  setOptionPoolPercentage("")
                  setFundingRoundsJson("")
                }}
                variant="outline"
              >
                Calculate New Dilution
              </Button>
            </div>

            {/* Final Ownership */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Final Ownership</h2>
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
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Round-by-Round Breakdown</h2>
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
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Ownership Breakdown</h2>
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
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Insights</h2>
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

