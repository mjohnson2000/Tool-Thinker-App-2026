"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { Gem } from "lucide-react"

interface Valuation {
  methodology: {
    primary_method: string
    methods_used: string[]
    explanation: string
  }
  pre_money_valuation: {
    conservative: { value: string; justification: string }
    most_likely: { value: string; justification: string }
    optimistic: { value: string; justification: string }
  }
  post_money_valuation?: {
    value: string
    investor_equity_percentage: string
    founder_dilution_percentage: string
    calculation: string
  }
  valuation_factors: {
    revenue_multiple: string
    growth_impact: string
    market_size_impact: string
    stage_considerations: string
    industry_benchmarks: string
  }
  comparable_analysis?: {
    similar_companies: Array<{
      name: string
      valuation: string
      revenue: string
      comparison: string
    }>
    how_this_compares: string
  }
  assumptions: string[]
  recommendations: {
    suggested_range: string
    factors_to_increase: string[]
    risks_to_decrease: string[]
  }
}

export default function ValuationCalculatorPage() {
  const [currentRevenue, setCurrentRevenue] = useState("")
  const [revenueGrowthRate, setRevenueGrowthRate] = useState("")
  const [marketSize, setMarketSize] = useState("")
  const [stage, setStage] = useState("")
  const [industry, setIndustry] = useState("")
  const [fundingAmount, setFundingAmount] = useState("")
  const [comparableCompanies, setComparableCompanies] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [valuation, setValuation] = useState<Valuation | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculateValuation() {
    setIsCalculating(true)
    setError(null)
    setValuation(null)

    try {
      const response = await fetch("/api/valuation-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentRevenue: currentRevenue.trim() || undefined,
          revenueGrowthRate: revenueGrowthRate.trim() || undefined,
          marketSize: marketSize.trim() || undefined,
          stage: stage.trim() || undefined,
          industry: industry.trim() || undefined,
          fundingAmount: fundingAmount.trim() || undefined,
          comparableCompanies: comparableCompanies.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate valuation")
      }

      const data = await response.json()
      setValuation(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate valuation. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg mx-auto">
              <Gem className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Valuation Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Estimate your startup valuation for fundraising and investor conversations
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {!valuation ? (
          <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-gray-100">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Annual Revenue (Optional)
                  </label>
                  <Input
                    id="currentRevenue"
                    type="number"
                    value={currentRevenue}
                    onChange={(e) => setCurrentRevenue(e.target.value)}
                    placeholder="e.g., 500000"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank if pre-revenue</p>
                </div>

                <div>
                  <label htmlFor="revenueGrowthRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Growth Rate % (Optional)
                  </label>
                  <Input
                    id="revenueGrowthRate"
                    type="number"
                    value={revenueGrowthRate}
                    onChange={(e) => setRevenueGrowthRate(e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>

                <div>
                  <label htmlFor="marketSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Addressable Market - TAM (Optional)
                  </label>
                  <Input
                    id="marketSize"
                    type="text"
                    value={marketSize}
                    onChange={(e) => setMarketSize(e.target.value)}
                    placeholder="e.g., 10B or 10,000,000,000"
                  />
                </div>

                <div>
                  <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Stage (Optional)
                  </label>
                  <Input
                    id="stage"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    placeholder="e.g., Seed, Series A, Series B"
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry (Optional)
                  </label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., SaaS, E-commerce, FinTech"
                  />
                </div>

                <div>
                  <label htmlFor="fundingAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Amount Being Raised (Optional)
                  </label>
                  <Input
                    id="fundingAmount"
                    type="text"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="e.g., 1000000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comparableCompanies" className="block text-sm font-medium text-gray-700 mb-2">
                  Comparable Companies (Optional)
                </label>
                <Textarea
                  id="comparableCompanies"
                  value={comparableCompanies}
                  onChange={(e) => setComparableCompanies(e.target.value)}
                  placeholder="List similar companies and their valuations, e.g., 'Company A: $50M at $5M revenue, Company B: $100M at $10M revenue'"
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateValuation}
                disabled={isCalculating}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating Valuation...
                  </span>
                ) : (
                  "Calculate Valuation"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Valuation Analysis</h2>
                <p className="text-gray-600 mt-1">{valuation.methodology.primary_method}</p>
              </div>
              <Button
                onClick={() => {
                  setValuation(null)
                  setCurrentRevenue("")
                  setRevenueGrowthRate("")
                  setMarketSize("")
                  setStage("")
                  setIndustry("")
                  setFundingAmount("")
                  setComparableCompanies("")
                }}
                variant="outline"
              >
                Calculate New Valuation
              </Button>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Valuation Methodology</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Method</h3>
                  <p className="text-gray-700">{valuation.methodology.primary_method}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Methods Used</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {valuation.methodology.methods_used.map((method, idx) => (
                      <li key={idx}>{method}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Explanation</h3>
                  <p className="text-gray-700 whitespace-pre-line">{valuation.methodology.explanation}</p>
                </div>
              </div>
            </div>

            {/* Pre-Money Valuation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Pre-Money Valuation Range</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Conservative</h3>
                  <p className="text-3xl font-bold text-red-900 mb-2">{valuation.pre_money_valuation.conservative.value}</p>
                  <p className="text-sm text-gray-700">{valuation.pre_money_valuation.conservative.justification}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Likely</h3>
                  <p className="text-3xl font-bold text-blue-900 mb-2">{valuation.pre_money_valuation.most_likely.value}</p>
                  <p className="text-sm text-gray-700">{valuation.pre_money_valuation.most_likely.justification}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimistic</h3>
                  <p className="text-3xl font-bold text-green-900 mb-2">{valuation.pre_money_valuation.optimistic.value}</p>
                  <p className="text-sm text-gray-700">{valuation.pre_money_valuation.optimistic.justification}</p>
                </div>
              </div>
            </div>

            {/* Post-Money Valuation */}
            {valuation.post_money_valuation && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Post-Money Valuation</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Post-Money Valuation</p>
                    <p className="text-3xl font-bold text-gray-900">{valuation.post_money_valuation.value}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Investor Equity</p>
                    <p className="text-3xl font-bold text-gray-900">{valuation.post_money_valuation.investor_equity_percentage}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-1">Founder Dilution</p>
                    <p className="text-3xl font-bold text-gray-900">{valuation.post_money_valuation.founder_dilution_percentage}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">{valuation.post_money_valuation.calculation}</p>
                </div>
              </div>
            )}

            {/* Valuation Factors */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Valuation Factors</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Multiple</h3>
                  <p className="text-gray-700">{valuation.valuation_factors.revenue_multiple}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth Impact</h3>
                  <p className="text-gray-700">{valuation.valuation_factors.growth_impact}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Size Impact</h3>
                  <p className="text-gray-700">{valuation.valuation_factors.market_size_impact}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Stage Considerations</h3>
                  <p className="text-gray-700">{valuation.valuation_factors.stage_considerations}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Benchmarks</h3>
                  <p className="text-gray-700">{valuation.valuation_factors.industry_benchmarks}</p>
                </div>
              </div>
            </div>

            {/* Comparable Analysis */}
            {valuation.comparable_analysis && valuation.comparable_analysis.similar_companies.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Comparable Analysis</h2>
                <div className="space-y-4 mb-6">
                  {valuation.comparable_analysis.similar_companies.map((company, idx) => (
                    <div key={idx} className="border-l-4 border-gray-900 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-600">Valuation: {company.valuation} | Revenue: {company.revenue}</p>
                      <p className="text-sm text-gray-700 mt-1">{company.comparison}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-700">{valuation.comparable_analysis.how_this_compares}</p>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommendations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Suggested Valuation Range</h3>
                  <p className="text-2xl font-bold text-gray-900">{valuation.recommendations.suggested_range}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Factors to Increase Valuation</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {valuation.recommendations.factors_to_increase.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Risks to Decrease Valuation</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {valuation.recommendations.risks_to_decrease.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Assumptions</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {valuation.assumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

