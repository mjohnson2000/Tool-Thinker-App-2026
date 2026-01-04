"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

interface Runway {
  current_runway: {
    months_remaining: number
    break_even_date: string
    net_burn_rate: string
    calculation: string
  }
  projected_runway?: {
    monthly_projection: Array<{
      month: string
      starting_cash: string
      revenue: string
      expenses: string
      ending_cash: string
    }>
    break_even_month: string
    runway_with_growth: string
  }
  funding_impact?: {
    new_runway_months: number
    extended_break_even: string
    recommended_funding: string
    calculation: string
  }
  scenarios: {
    best_case: { runway_months: number; assumptions: string[] }
    most_likely: { runway_months: number; assumptions: string[] }
    worst_case: { runway_months: number; assumptions: string[] }
  }
  recommendations: {
    extend_runway: string[]
    cost_reduction: string[]
    revenue_acceleration: string[]
    funding_timeline: string
  }
}

export default function RunwayCalculatorPage() {
  const [currentCash, setCurrentCash] = useState("")
  const [monthlyBurnRate, setMonthlyBurnRate] = useState("")
  const [monthlyRevenue, setMonthlyRevenue] = useState("")
  const [revenueGrowthRate, setRevenueGrowthRate] = useState("")
  const [expectedFunding, setExpectedFunding] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [runway, setRunway] = useState<Runway | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculateRunway() {
    if (!currentCash || !monthlyBurnRate) {
      setError("Current cash and monthly burn rate are required")
      return
    }

    setIsCalculating(true)
    setError(null)
    setRunway(null)

    try {
      const response = await fetch("/api/runway-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCash: currentCash.trim(),
          monthlyBurnRate: monthlyBurnRate.trim(),
          monthlyRevenue: monthlyRevenue.trim() || undefined,
          revenueGrowthRate: revenueGrowthRate.trim() || undefined,
          expectedFunding: expectedFunding.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate runway")
      }

      const data = await response.json()
      setRunway(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate runway. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Runway Calculator" toolId="runway-calculator" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg mx-auto">
              <Clock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Runway Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate how long your startup can operate with current cash
          </p>
        </div>

        {!runway ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentCash" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Cash *
                  </label>
                  <Input
                    id="currentCash"
                    type="number"
                    value={currentCash}
                    onChange={(e) => setCurrentCash(e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label htmlFor="monthlyBurnRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Burn Rate *
                  </label>
                  <Input
                    id="monthlyBurnRate"
                    type="number"
                    value={monthlyBurnRate}
                    onChange={(e) => setMonthlyBurnRate(e.target.value)}
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label htmlFor="monthlyRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Revenue (Optional)
                  </label>
                  <Input
                    id="monthlyRevenue"
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="e.g., 5000"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank if pre-revenue</p>
                </div>

                <div>
                  <label htmlFor="revenueGrowthRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Growth Rate %/Month (Optional)
                  </label>
                  <Input
                    id="revenueGrowthRate"
                    type="number"
                    value={revenueGrowthRate}
                    onChange={(e) => setRevenueGrowthRate(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label htmlFor="expectedFunding" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Funding (Optional)
                  </label>
                  <Input
                    id="expectedFunding"
                    type="number"
                    value={expectedFunding}
                    onChange={(e) => setExpectedFunding(e.target.value)}
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateRunway}
                disabled={isCalculating || !currentCash || !monthlyBurnRate}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isCalculating ? "Calculating Runway..." : "Calculate Runway"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Runway Analysis</h2>
                <p className="text-gray-600 mt-1">Net Burn Rate: {runway.current_runway.net_burn_rate}</p>
              </div>
              <div className="flex gap-2">
                <ShareButton toolName="Runway Calculator" toolId="runway-calculator" />
                <Button
                  onClick={() => {
                    setRunway(null)
                  setCurrentCash("")
                  setMonthlyBurnRate("")
                  setMonthlyRevenue("")
                  setRevenueGrowthRate("")
                  setExpectedFunding("")
                }}
                variant="outline"
              >
                Calculate New Runway
              </Button>
              </div>
            </div>

            {/* Current Runway */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Current Runway</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-1">Months Remaining</p>
                  <p className="text-4xl font-bold text-red-900">{runway.current_runway.months_remaining}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Break-Even Date</p>
                  <p className="text-2xl font-bold text-green-900">{runway.current_runway.break_even_date}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Net Burn Rate</p>
                  <p className="text-3xl font-bold text-blue-900">{runway.current_runway.net_burn_rate}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-700">{runway.current_runway.calculation}</p>
              </div>
            </div>

            {/* Projected Runway */}
            {runway.projected_runway && runway.projected_runway.monthly_projection.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Projected Runway</h2>
                <div className="mb-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Break-Even Month</p>
                    <p className="text-2xl font-bold text-gray-900">{runway.projected_runway.break_even_month}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Runway with Growth</p>
                    <p className="text-2xl font-bold text-gray-900">{runway.projected_runway.runway_with_growth}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Starting Cash</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ending Cash</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {runway.projected_runway.monthly_projection.slice(0, 12).map((month, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">{month.month}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{month.starting_cash}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">{month.revenue}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600">{month.expenses}</td>
                          <td className={`px-4 py-3 text-sm text-right font-semibold ${parseFloat(month.ending_cash.replace(/[^0-9.-]/g, '')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {month.ending_cash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Funding Impact */}
            {runway.funding_impact && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Funding Impact</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">New Runway</p>
                    <p className="text-4xl font-bold text-green-900">{runway.funding_impact.new_runway_months} months</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Extended Break-Even</p>
                    <p className="text-2xl font-bold text-blue-900">{runway.funding_impact.extended_break_even}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600 mb-1">Recommended Funding</p>
                    <p className="text-2xl font-bold text-yellow-900">{runway.funding_impact.recommended_funding}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">{runway.funding_impact.calculation}</p>
                </div>
              </div>
            )}

            {/* Scenarios */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Runway Scenarios</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Case</h3>
                  <p className="text-4xl font-bold text-green-900 mb-4">{runway.scenarios.best_case.runway_months} months</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {runway.scenarios.best_case.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Likely</h3>
                  <p className="text-4xl font-bold text-blue-900 mb-4">{runway.scenarios.most_likely.runway_months} months</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {runway.scenarios.most_likely.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Worst Case</h3>
                  <p className="text-4xl font-bold text-red-900 mb-4">{runway.scenarios.worst_case.runway_months} months</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {runway.scenarios.worst_case.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommendations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Extend Runway</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {runway.recommendations.extend_runway.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Reduction</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {runway.recommendations.cost_reduction.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Acceleration</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {runway.recommendations.revenue_acceleration.map((strategy, idx) => (
                      <li key={idx}>{strategy}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding Timeline</h3>
                  <p className="text-gray-700">{runway.recommendations.funding_timeline}</p>
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

