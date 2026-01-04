"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

interface PricingStrategy {
  pricing_tiers: Array<{
    tier_name: string
    price: string
    features: string[]
    target_customer: string
    justification: string
  }>
  pricing_analysis: {
    cost_plus: { calculation: string; recommended_price: string }
    value_based: { analysis: string; recommended_price: string }
    competitive: { analysis: string; recommended_price: string }
    recommended_approach: string
  }
  margin_analysis: {
    gross_margin_by_tier: Array<{
      tier: string
      gross_margin: string
      contribution_margin: string
    }>
    break_even_analysis: string
    profitability_insights: string
  }
  price_sensitivity: {
    price_elasticity: string
    optimal_price_points: string[]
    price_floor: string
    price_ceiling: string
    demand_impact: string
  }
  recommendations: {
    initial_strategy: string
    optimization_opportunities: string[]
    discount_strategies: string[]
    upsell_opportunities: string[]
  }
  implementation: {
    testing_approach: string
    ab_testing_recommendations: string[]
    adjustment_strategy: string
  }
}

export default function PricingStrategyCalculatorPage() {
  const [productDescription, setProductDescription] = useState("")
  const [costStructure, setCostStructure] = useState("")
  const [targetMargin, setTargetMargin] = useState("")
  const [competitorPricing, setCompetitorPricing] = useState("")
  const [customerWillingnessToPay, setCustomerWillingnessToPay] = useState("")
  const [pricingModel, setPricingModel] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [pricing, setPricing] = useState<PricingStrategy | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculatePricing() {
    if (!productDescription.trim()) {
      setError("Product description is required")
      return
    }

    setIsCalculating(true)
    setError(null)
    setPricing(null)

    try {
      const response = await fetch("/api/pricing-strategy-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: productDescription.trim(),
          costStructure: costStructure.trim() || undefined,
          targetMargin: targetMargin.trim() || undefined,
          competitorPricing: competitorPricing.trim() || undefined,
          customerWillingnessToPay: customerWillingnessToPay.trim() || undefined,
          pricingModel: pricingModel.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate pricing strategy")
      }

      const data = await response.json()
      setPricing(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate pricing strategy. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing Strategy Calculator</h1>
          <p className="text-xl text-gray-600">
            Determine optimal pricing based on costs, margins, and market positioning
          </p>
        </div>

        {!pricing ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Description *
                </label>
                <Textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe your product or service in detail..."
                  rows={6}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="costStructure" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Structure (Optional)
                  </label>
                  <Textarea
                    id="costStructure"
                    value={costStructure}
                    onChange={(e) => setCostStructure(e.target.value)}
                    placeholder="e.g., Fixed costs: $10k/month, Variable costs: $5 per unit"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="targetMargin" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Margin % (Optional)
                  </label>
                  <Input
                    id="targetMargin"
                    type="number"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(e.target.value)}
                    placeholder="e.g., 70"
                  />
                </div>

                <div>
                  <label htmlFor="competitorPricing" className="block text-sm font-medium text-gray-700 mb-2">
                    Competitor Pricing (Optional)
                  </label>
                  <Input
                    id="competitorPricing"
                    value={competitorPricing}
                    onChange={(e) => setCompetitorPricing(e.target.value)}
                    placeholder="e.g., Competitor A: $99/month, Competitor B: $149/month"
                  />
                </div>

                <div>
                  <label htmlFor="customerWillingnessToPay" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Willingness to Pay (Optional)
                  </label>
                  <Input
                    id="customerWillingnessToPay"
                    value={customerWillingnessToPay}
                    onChange={(e) => setCustomerWillingnessToPay(e.target.value)}
                    placeholder="e.g., $50-200/month based on research"
                  />
                </div>

                <div>
                  <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Pricing Model (Optional)
                  </label>
                  <Input
                    id="pricingModel"
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value)}
                    placeholder="e.g., Subscription, One-time, Usage-based"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculatePricing}
                disabled={isCalculating || !productDescription.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isCalculating ? "Calculating Pricing Strategy..." : "Calculate Pricing Strategy"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pricing Strategy Analysis</h2>
                <p className="text-gray-600 mt-1">{pricing.pricing_analysis.recommended_approach}</p>
              </div>
              <Button
                onClick={() => {
                  setPricing(null)
                  setProductDescription("")
                  setCostStructure("")
                  setTargetMargin("")
                  setCompetitorPricing("")
                  setCustomerWillingnessToPay("")
                  setPricingModel("")
                }}
                variant="outline"
              >
                Calculate New Strategy
              </Button>
            </div>

            {/* Pricing Tiers */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommended Pricing Tiers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {pricing.pricing_tiers.map((tier, idx) => (
                  <div key={idx} className="border-l-4 border-gray-900 pl-6 py-4 bg-gray-50 rounded-r-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.tier_name}</h3>
                    <p className="text-3xl font-bold text-blue-900 mb-4">{tier.price}</p>
                    <p className="text-sm text-gray-600 mb-3">Target: {tier.target_customer}</p>
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Features:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {tier.features.map((feature, fIdx) => (
                          <li key={fIdx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-gray-700">{tier.justification}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Analysis */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Pricing Analysis</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost-Plus</h3>
                  <p className="text-2xl font-bold text-blue-900 mb-2">{pricing.pricing_analysis.cost_plus.recommended_price}</p>
                  <p className="text-sm text-gray-700">{pricing.pricing_analysis.cost_plus.calculation}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Value-Based</h3>
                  <p className="text-2xl font-bold text-green-900 mb-2">{pricing.pricing_analysis.value_based.recommended_price}</p>
                  <p className="text-sm text-gray-700">{pricing.pricing_analysis.value_based.analysis}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive</h3>
                  <p className="text-2xl font-bold text-yellow-900 mb-2">{pricing.pricing_analysis.competitive.recommended_price}</p>
                  <p className="text-sm text-gray-700">{pricing.pricing_analysis.competitive.analysis}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Recommended Approach:</p>
                <p className="text-gray-900">{pricing.pricing_analysis.recommended_approach}</p>
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Margin Analysis</h2>
              <div className="space-y-4 mb-6">
                {pricing.margin_analysis.gross_margin_by_tier.map((tier, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tier.tier}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Gross Margin</p>
                      <p className="text-xl font-bold text-gray-900">{tier.gross_margin}</p>
                      <p className="text-sm text-gray-600 mt-1">Contribution Margin: {tier.contribution_margin}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">{pricing.margin_analysis.break_even_analysis}</p>
                <p className="text-gray-700">{pricing.margin_analysis.profitability_insights}</p>
              </div>
            </div>

            {/* Price Sensitivity */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Price Sensitivity Analysis</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price Floor</p>
                  <p className="text-2xl font-bold text-gray-900">{pricing.price_sensitivity.price_floor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price Ceiling</p>
                  <p className="text-2xl font-bold text-gray-900">{pricing.price_sensitivity.price_ceiling}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Optimal Price Points:</p>
                <div className="flex gap-2">
                  {pricing.price_sensitivity.optimal_price_points.map((point, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm font-semibold">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700">{pricing.price_sensitivity.price_elasticity}</p>
                <p className="text-gray-700">{pricing.price_sensitivity.demand_impact}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommendations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Initial Strategy</h3>
                  <p className="text-gray-700">{pricing.recommendations.initial_strategy}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimization Opportunities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {pricing.recommendations.optimization_opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Discount Strategies</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {pricing.recommendations.discount_strategies.map((strategy, idx) => (
                      <li key={idx}>{strategy}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upsell Opportunities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {pricing.recommendations.upsell_opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Implementation Plan</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Testing Approach</h3>
                  <p className="text-gray-700">{pricing.implementation.testing_approach}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">A/B Testing Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {pricing.implementation.ab_testing_recommendations.map((test, idx) => (
                      <li key={idx}>{test}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Adjustment Strategy</h3>
                  <p className="text-gray-700">{pricing.implementation.adjustment_strategy}</p>
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

