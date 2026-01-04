"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

interface FinancialModel {
  business_model: {
    revenue_model: string
    pricing_strategy: string
    customer_segments: string[]
  }
  unit_economics: {
    customer_acquisition_cost: {
      value: string
      calculation: string
      assumptions: string[]
    }
    lifetime_value: {
      value: string
      calculation: string
      assumptions: string[]
    }
    payback_period: {
      value: string
      calculation: string
    }
    ltv_cac_ratio: {
      value: string
      interpretation: string
    }
    gross_margin: {
      value: string
      calculation: string
    }
  }
  revenue_projections: {
    monthly: Array<{
      month: string
      new_customers: number
      total_customers: number
      revenue: number
      assumptions: string
    }>
    yearly: Array<{
      year: number
      revenue: number
      customers: number
      assumptions: string[]
    }>
  }
  expense_projections: {
    categories: Array<{
      category: string
      monthly_amount: number
      yearly_amount: number
      notes: string
    }>
    total_monthly: number
    total_yearly: number
  }
  cash_flow: {
    monthly: Array<{
      month: string
      revenue: number
      expenses: number
      net_cash_flow: number
      cumulative: number
    }>
    break_even_month: string
    runway_months: number
  }
  key_metrics: {
    burn_rate: string
    growth_rate: string
    churn_rate: string
    arpu: string
  }
  financial_health: {
    assessment: string
    risks: string[]
    recommendations: string[]
  }
}

export default function FinancialModelCalculatorPage() {
  const [businessModel, setBusinessModel] = useState("")
  const [pricing, setPricing] = useState("")
  const [monthlyCustomers, setMonthlyCustomers] = useState("")
  const [customerLifetime, setCustomerLifetime] = useState("")
  const [cac, setCac] = useState("")
  const [monthlyExpenses, setMonthlyExpenses] = useState("")
  const [startingCapital, setStartingCapital] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [financialModel, setFinancialModel] = useState<FinancialModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculateFinancialModel() {
    if (!businessModel.trim()) {
      setError("Please describe your business model")
      return
    }

    setIsGenerating(true)
    setError(null)
    setFinancialModel(null)

    try {
      const response = await fetch("/api/financial-model-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessModel: businessModel.trim(),
          pricing: pricing.trim() || undefined,
          monthlyCustomers: monthlyCustomers.trim() || undefined,
          customerLifetime: customerLifetime.trim() || undefined,
          cac: cac.trim() || undefined,
          monthlyExpenses: monthlyExpenses.trim() || undefined,
          startingCapital: startingCapital.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate financial model")
      }

      const data = await response.json()
      setFinancialModel(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate financial model. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadFinancialModel() {
    if (!financialModel) return

    const doc = new jsPDF()
    const margin = 20
    const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin
    let yPosition = margin

    function addText(text: string, fontSize: number, isBold: boolean = false) {
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont("helvetica", "bold")
      } else {
        doc.setFont("helvetica", "normal")
      }
      
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += fontSize * 0.4
      })
      yPosition += 5
    }

    function addSection(title: string) {
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        yPosition = margin
      }
      addText(title, 16, true)
      yPosition += 3
    }

    // Title
    addText("Financial Model", 20, true)
    yPosition += 10

    // Business Model
    addSection("Business Model")
    addText(`Revenue Model: ${financialModel.business_model.revenue_model}`, 11)
    addText(`Pricing Strategy: ${financialModel.business_model.pricing_strategy}`, 11)
    addText(`Customer Segments: ${financialModel.business_model.customer_segments.join(", ")}`, 11)
    yPosition += 10

    // Unit Economics
    addSection("Unit Economics")
    addText(`Customer Acquisition Cost (CAC): ${financialModel.unit_economics.customer_acquisition_cost.value}`, 12, true)
    addText(financialModel.unit_economics.customer_acquisition_cost.calculation, 10)
    financialModel.unit_economics.customer_acquisition_cost.assumptions.forEach((a) => addText(`• ${a}`, 9))
    yPosition += 3
    addText(`Lifetime Value (LTV): ${financialModel.unit_economics.lifetime_value.value}`, 12, true)
    addText(financialModel.unit_economics.lifetime_value.calculation, 10)
    financialModel.unit_economics.lifetime_value.assumptions.forEach((a) => addText(`• ${a}`, 9))
    yPosition += 3
    addText(`Payback Period: ${financialModel.unit_economics.payback_period.value}`, 12, true)
    addText(financialModel.unit_economics.payback_period.calculation, 10)
    yPosition += 3
    addText(`LTV:CAC Ratio: ${financialModel.unit_economics.ltv_cac_ratio.value}`, 12, true)
    addText(financialModel.unit_economics.ltv_cac_ratio.interpretation, 10)
    yPosition += 3
    addText(`Gross Margin: ${financialModel.unit_economics.gross_margin.value}`, 12, true)
    addText(financialModel.unit_economics.gross_margin.calculation, 10)
    yPosition += 10

    // Revenue Projections
    addSection("Revenue Projections")
    addText("Monthly Projections (First 12 Months):", 12, true)
    financialModel.revenue_projections.monthly.slice(0, 12).forEach((month) => {
      addText(`${month.month}: ${month.new_customers} new, ${month.total_customers} total customers, $${month.revenue.toLocaleString()} revenue`, 10)
    })
    yPosition += 3
    addText("Yearly Projections:", 12, true)
    financialModel.revenue_projections.yearly.forEach((year) => {
      addText(`Year ${year.year}: $${year.revenue.toLocaleString()} revenue, ${year.customers} customers`, 11, true)
      year.assumptions.forEach((a) => addText(`  • ${a}`, 9))
    })
    yPosition += 10

    // Expense Projections
    addSection("Expense Projections")
    financialModel.expense_projections.categories.forEach((cat) => {
      addText(`${cat.category}: $${cat.monthly_amount.toLocaleString()}/month, $${cat.yearly_amount.toLocaleString()}/year`, 11, true)
      addText(`  ${cat.notes}`, 9)
    })
    addText(`Total Monthly Expenses: $${financialModel.expense_projections.total_monthly.toLocaleString()}`, 12, true)
    addText(`Total Yearly Expenses: $${financialModel.expense_projections.total_yearly.toLocaleString()}`, 12, true)
    yPosition += 10

    // Cash Flow
    addSection("Cash Flow Analysis")
    addText("Monthly Cash Flow (First 12 Months):", 12, true)
    financialModel.cash_flow.monthly.slice(0, 12).forEach((month) => {
      const cashFlowColor = month.net_cash_flow >= 0 ? "positive" : "negative"
      addText(`${month.month}: Revenue $${month.revenue.toLocaleString()}, Expenses $${month.expenses.toLocaleString()}, Net $${month.net_cash_flow.toLocaleString()}, Cumulative $${month.cumulative.toLocaleString()}`, 10)
    })
    yPosition += 3
    addText(`Break-Even Month: ${financialModel.cash_flow.break_even_month}`, 12, true)
    addText(`Runway: ${financialModel.cash_flow.runway_months} months`, 12, true)
    yPosition += 10

    // Key Metrics
    addSection("Key Metrics")
    addText(`Monthly Burn Rate: ${financialModel.key_metrics.burn_rate}`, 11)
    addText(`Growth Rate: ${financialModel.key_metrics.growth_rate}`, 11)
    addText(`Churn Rate: ${financialModel.key_metrics.churn_rate}`, 11)
    addText(`ARPU (Average Revenue Per User): ${financialModel.key_metrics.arpu}`, 11)
    yPosition += 10

    // Financial Health
    addSection("Financial Health Assessment")
    addText(financialModel.financial_health.assessment, 11)
    yPosition += 3
    addText("Key Risks:", 12, true)
    financialModel.financial_health.risks.forEach((risk) => addText(`• ${risk}`, 10))
    yPosition += 3
    addText("Recommendations:", 12, true)
    financialModel.financial_health.recommendations.forEach((rec) => addText(`• ${rec}`, 10))

    doc.save(`financial-model-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Financial Model Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate unit economics, revenue projections, cash flow, and financial health metrics
          </p>
        </div>

        {!financialModel ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Model Description *
                </label>
                <Textarea
                  id="businessModel"
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  placeholder="Describe your business model, how you make money, and your revenue streams..."
                  rows={6}
                  className="resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Explain your revenue model (subscription, one-time, marketplace, etc.)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing (Optional)
                  </label>
                  <Input
                    id="pricing"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                    placeholder="e.g., $99/month or $1,000 one-time"
                  />
                </div>

                <div>
                  <label htmlFor="monthlyCustomers" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Monthly New Customers (Optional)
                  </label>
                  <Input
                    id="monthlyCustomers"
                    type="number"
                    value={monthlyCustomers}
                    onChange={(e) => setMonthlyCustomers(e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label htmlFor="customerLifetime" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Lifetime in Months (Optional)
                  </label>
                  <Input
                    id="customerLifetime"
                    type="number"
                    value={customerLifetime}
                    onChange={(e) => setCustomerLifetime(e.target.value)}
                    placeholder="e.g., 24"
                  />
                </div>

                <div>
                  <label htmlFor="cac" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Acquisition Cost - CAC (Optional)
                  </label>
                  <Input
                    id="cac"
                    type="number"
                    value={cac}
                    onChange={(e) => setCac(e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Operating Expenses (Optional)
                  </label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label htmlFor="startingCapital" className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Capital (Optional)
                  </label>
                  <Input
                    id="startingCapital"
                    type="number"
                    value={startingCapital}
                    onChange={(e) => setStartingCapital(e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateFinancialModel}
                disabled={isGenerating || !businessModel.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isGenerating ? "Calculating Financial Model..." : "Calculate Financial Model"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Financial Model</h2>
                <p className="text-gray-600 mt-1">{financialModel.business_model.revenue_model}</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={downloadFinancialModel} variant="outline">
                  Download PDF
                </Button>
                <Button
                  onClick={() => {
                    setFinancialModel(null)
                    setBusinessModel("")
                    setPricing("")
                    setMonthlyCustomers("")
                    setCustomerLifetime("")
                    setCac("")
                    setMonthlyExpenses("")
                    setStartingCapital("")
                  }}
                  variant="outline"
                >
                  Create New Model
                </Button>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Unit Economics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Acquisition Cost (CAC)</h3>
                  <p className="text-3xl font-bold text-blue-900 mb-2">{financialModel.unit_economics.customer_acquisition_cost.value}</p>
                  <p className="text-sm text-gray-700 mb-2">{financialModel.unit_economics.customer_acquisition_cost.calculation}</p>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Assumptions:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      {financialModel.unit_economics.customer_acquisition_cost.assumptions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime Value (LTV)</h3>
                  <p className="text-3xl font-bold text-green-900 mb-2">{financialModel.unit_economics.lifetime_value.value}</p>
                  <p className="text-sm text-gray-700 mb-2">{financialModel.unit_economics.lifetime_value.calculation}</p>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Assumptions:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      {financialModel.unit_economics.lifetime_value.assumptions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payback Period</h3>
                  <p className="text-3xl font-bold text-yellow-900 mb-2">{financialModel.unit_economics.payback_period.value}</p>
                  <p className="text-sm text-gray-700">{financialModel.unit_economics.payback_period.calculation}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">LTV:CAC Ratio</h3>
                  <p className="text-3xl font-bold text-purple-900 mb-2">{financialModel.unit_economics.ltv_cac_ratio.value}</p>
                  <p className="text-sm text-gray-700">{financialModel.unit_economics.ltv_cac_ratio.interpretation}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-500">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gross Margin</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{financialModel.unit_economics.gross_margin.value}</p>
                  <p className="text-sm text-gray-700">{financialModel.unit_economics.gross_margin.calculation}</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Metrics</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Burn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{financialModel.key_metrics.burn_rate}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{financialModel.key_metrics.growth_rate}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{financialModel.key_metrics.churn_rate}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">ARPU</p>
                  <p className="text-2xl font-bold text-gray-900">{financialModel.key_metrics.arpu}</p>
                </div>
              </div>
            </div>

            {/* Revenue Projections */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Revenue Projections</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Projections (First 12 Months)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Customers</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Customers</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialModel.revenue_projections.monthly.slice(0, 12).map((month, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">{month.month}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{month.new_customers}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{month.total_customers}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">${month.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Yearly Projections</h3>
                  <div className="space-y-3">
                    {financialModel.revenue_projections.yearly.map((year, idx) => (
                      <div key={idx} className="border-l-4 border-gray-900 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-gray-900">Year {year.year}</h4>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${year.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{year.customers} customers</p>
                          </div>
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {year.assumptions.map((a, aIdx) => (
                            <li key={aIdx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Projections */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Expense Projections</h2>
              <div className="space-y-4 mb-6">
                {financialModel.expense_projections.categories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{cat.category}</h3>
                      <p className="text-sm text-gray-600 mt-1">{cat.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${cat.monthly_amount.toLocaleString()}/mo</p>
                      <p className="text-sm text-gray-600">${cat.yearly_amount.toLocaleString()}/yr</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Expenses</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${financialModel.expense_projections.total_monthly.toLocaleString()}/month</p>
                  <p className="text-sm text-gray-600">${financialModel.expense_projections.total_yearly.toLocaleString()}/year</p>
                </div>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cash Flow Analysis</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">Break-Even Month</p>
                    <p className="text-2xl font-bold text-green-900">{financialModel.cash_flow.break_even_month}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                    <p className="text-sm text-gray-600 mb-1">Runway</p>
                    <p className="text-2xl font-bold text-red-900">{financialModel.cash_flow.runway_months} months</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow (First 12 Months)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expenses</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Cash Flow</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialModel.cash_flow.monthly.slice(0, 12).map((month, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">{month.month}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-700">${month.revenue.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-700">${month.expenses.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${month.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${month.net_cash_flow.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-semibold ${month.cumulative >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${month.cumulative.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Financial Health Assessment</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment</h3>
                  <p className="text-gray-700 whitespace-pre-line">{financialModel.financial_health.assessment}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Risks</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {financialModel.financial_health.risks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {financialModel.financial_health.recommendations.map((rec, idx) => (
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

