"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

interface MarketSize {
  tam: {
    value: string
    calculation: string
    methodology: string
    assumptions: string[]
    data_sources: string[]
  }
  sam: {
    value: string
    calculation: string
    how_derived_from_tam: string
    constraints: string[]
    assumptions: string[]
  }
  som: {
    year_1: { value: string; market_share: string; assumptions: string[] }
    year_3: { value: string; market_share: string; assumptions: string[] }
    year_5: { value: string; market_share: string; assumptions: string[] }
    penetration_strategy: string
  }
  market_segmentation: Array<{
    segment_name: string
    size: string
    growth_rate: string
    description: string
  }>
  market_growth: {
    historical_cagr: string
    projected_cagr: string
    growth_drivers: string[]
  }
  assumptions: string[]
  validation: {
    how_to_validate: string[]
    data_sources: string[]
    industry_benchmarks: string
  }
}

export default function MarketSizeCalculatorPage() {
  const [productDescription, setProductDescription] = useState("")
  const [targetCustomer, setTargetCustomer] = useState("")
  const [geographicScope, setGeographicScope] = useState("")
  const [marketData, setMarketData] = useState("")
  const [pricingAssumptions, setPricingAssumptions] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [marketSize, setMarketSize] = useState<MarketSize | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculateMarketSize() {
    if (!productDescription.trim()) {
      setError("Product description is required")
      return
    }

    setIsCalculating(true)
    setError(null)
    setMarketSize(null)

    try {
      const response = await fetch("/api/market-size-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription: productDescription.trim(),
          targetCustomer: targetCustomer.trim() || undefined,
          geographicScope: geographicScope.trim() || undefined,
          marketData: marketData.trim() || undefined,
          pricingAssumptions: pricingAssumptions.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate market size")
      }

      const data = await response.json()
      setMarketSize(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate market size. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Market Size Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate TAM, SAM, and SOM for your startup
          </p>
        </div>

        {!marketSize ? (
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
                  <label htmlFor="targetCustomer" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Customer (Optional)
                  </label>
                  <Input
                    id="targetCustomer"
                    value={targetCustomer}
                    onChange={(e) => setTargetCustomer(e.target.value)}
                    placeholder="e.g., Small businesses, Enterprise companies"
                  />
                </div>

                <div>
                  <label htmlFor="geographicScope" className="block text-sm font-medium text-gray-700 mb-2">
                    Geographic Scope (Optional)
                  </label>
                  <Input
                    id="geographicScope"
                    value={geographicScope}
                    onChange={(e) => setGeographicScope(e.target.value)}
                    placeholder="e.g., United States, Global, North America"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="marketData" className="block text-sm font-medium text-gray-700 mb-2">
                  Market Data (Optional)
                </label>
                <Textarea
                  id="marketData"
                  value={marketData}
                  onChange={(e) => setMarketData(e.target.value)}
                  placeholder="Any market research data, industry reports, or statistics you have..."
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="pricingAssumptions" className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Assumptions (Optional)
                </label>
                <Input
                  id="pricingAssumptions"
                  value={pricingAssumptions}
                  onChange={(e) => setPricingAssumptions(e.target.value)}
                  placeholder="e.g., Average price: $100/month per customer"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateMarketSize}
                disabled={isCalculating || !productDescription.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isCalculating ? "Calculating Market Size..." : "Calculate Market Size"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Market Size Analysis</h2>
                <p className="text-gray-600 mt-1">TAM, SAM, and SOM Breakdown</p>
              </div>
              <Button
                onClick={() => {
                  setMarketSize(null)
                  setProductDescription("")
                  setTargetCustomer("")
                  setGeographicScope("")
                  setMarketData("")
                  setPricingAssumptions("")
                }}
                variant="outline"
              >
                Calculate New Market Size
              </Button>
            </div>

            {/* TAM, SAM, SOM */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-8 shadow-sm border-l-4 border-blue-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">TAM</h3>
                <p className="text-sm text-gray-600 mb-4">Total Addressable Market</p>
                <p className="text-4xl font-bold text-blue-900 mb-4">{marketSize.tam.value}</p>
                <p className="text-sm text-gray-700">{marketSize.tam.methodology}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-8 shadow-sm border-l-4 border-green-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">SAM</h3>
                <p className="text-sm text-gray-600 mb-4">Serviceable Addressable Market</p>
                <p className="text-4xl font-bold text-green-900 mb-4">{marketSize.sam.value}</p>
                <p className="text-sm text-gray-700">{marketSize.sam.how_derived_from_tam}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-8 shadow-sm border-l-4 border-yellow-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">SOM</h3>
                <p className="text-sm text-gray-600 mb-4">Serviceable Obtainable Market</p>
                <p className="text-3xl font-bold text-yellow-900 mb-2">Year 1: {marketSize.som.year_1.value}</p>
                <p className="text-sm text-gray-700">{marketSize.som.year_1.market_share} market share</p>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Detailed Breakdown</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">TAM Calculation</h3>
                  <p className="text-gray-700 mb-2">{marketSize.tam.calculation}</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Data Sources:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {marketSize.tam.data_sources.map((source, idx) => (
                        <li key={idx}>{source}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">SAM Calculation</h3>
                  <p className="text-gray-700 mb-2">{marketSize.sam.calculation}</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Constraints:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {marketSize.sam.constraints.map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">SOM Projections</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border-l-4 border-gray-900 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Year 1</h4>
                      <p className="text-2xl font-bold text-gray-900">{marketSize.som.year_1.value}</p>
                      <p className="text-sm text-gray-600">{marketSize.som.year_1.market_share} market share</p>
                    </div>
                    <div className="border-l-4 border-gray-900 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Year 3</h4>
                      <p className="text-2xl font-bold text-gray-900">{marketSize.som.year_3.value}</p>
                      <p className="text-sm text-gray-600">{marketSize.som.year_3.market_share} market share</p>
                    </div>
                    <div className="border-l-4 border-gray-900 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Year 5</h4>
                      <p className="text-2xl font-bold text-gray-900">{marketSize.som.year_5.value}</p>
                      <p className="text-sm text-gray-600">{marketSize.som.year_5.market_share} market share</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Penetration Strategy:</p>
                    <p className="text-gray-700">{marketSize.som.penetration_strategy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Segmentation */}
            {marketSize.market_segmentation.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Segmentation</h2>
                <div className="space-y-4">
                  {marketSize.market_segmentation.map((segment, idx) => (
                    <div key={idx} className="border-l-4 border-gray-900 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900">{segment.segment_name}</h3>
                      <p className="text-gray-700">{segment.description}</p>
                      <div className="mt-2 flex gap-4">
                        <span className="text-sm text-gray-600">Size: <strong>{segment.size}</strong></span>
                        <span className="text-sm text-gray-600">Growth: <strong>{segment.growth_rate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Growth */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Market Growth</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Historical CAGR</p>
                  <p className="text-3xl font-bold text-gray-900">{marketSize.market_growth.historical_cagr}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Projected CAGR</p>
                  <p className="text-3xl font-bold text-gray-900">{marketSize.market_growth.projected_cagr}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Growth Drivers:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {marketSize.market_growth.growth_drivers.map((driver, idx) => (
                    <li key={idx}>{driver}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Validation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Validation & Next Steps</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Validate</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {marketSize.validation.how_to_validate.map((method, idx) => (
                      <li key={idx}>{method}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Sources</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {marketSize.validation.data_sources.map((source, idx) => (
                      <li key={idx}>{source}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Benchmarks</h3>
                  <p className="text-gray-700">{marketSize.validation.industry_benchmarks}</p>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Assumptions</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {marketSize.assumptions.map((assumption, idx) => (
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

