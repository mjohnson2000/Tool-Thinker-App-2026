"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"
import { FileCheck } from "lucide-react"

interface BusinessPlan {
  executive_summary: {
    business_name: string
    mission_statement: string
    business_overview: string
    key_objectives: string[]
    financial_highlights: string
  }
  company_description: {
    company_name: string
    legal_structure: string
    location: string
    history: string
    products_services: string[]
    competitive_advantages: string[]
  }
  market_analysis: {
    industry_overview: string
    target_market: string
    market_size: string
    market_trends: string[]
    customer_analysis: string
    competitor_analysis: {
      competitors: string[]
      competitive_positioning: string
    }
  }
  organization_management: {
    organizational_structure: string
    management_team: Array<{
      name: string
      role: string
      experience: string
    }>
    advisors: string[]
    hiring_plan: string
  }
  service_product_line: {
    products_services: Array<{
      name: string
      description: string
      pricing: string
      target_market: string
    }>
    research_development: string
    intellectual_property: string
  }
  marketing_sales: {
    marketing_strategy: string
    sales_strategy: string
    pricing_strategy: string
    distribution_channels: string[]
    promotional_activities: string[]
    sales_forecast: string
  }
  financial_projections: {
    startup_costs: Array<{
      item: string
      amount: string
    }>
    revenue_projections: {
      year_1: string
      year_2: string
      year_3: string
      assumptions: string[]
    }
    expense_projections: {
      year_1: string
      year_2: string
      year_3: string
    }
    break_even_analysis: string
    funding_requirements: string
    use_of_funds: Array<{
      category: string
      amount: string
      description: string
    }>
  }
  risk_analysis: {
    risks: Array<{
      risk: string
      impact: string
      mitigation: string
    }>
  }
  implementation_timeline: {
    milestones: Array<{
      phase: string
      timeline: string
      activities: string[]
    }>
  }
}

export default function BusinessPlanGeneratorPage() {
  const [businessIdea, setBusinessIdea] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [industry, setIndustry] = useState("")
  const [targetMarket, setTargetMarket] = useState("")
  const [fundingNeeded, setFundingNeeded] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generateBusinessPlan() {
    if (!businessIdea.trim()) {
      setError("Please describe your business idea")
      return
    }

    setIsGenerating(true)
    setError(null)
    setBusinessPlan(null)

    try {
      const response = await fetch("/api/business-plan-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIdea: businessIdea.trim(),
          businessName: businessName.trim() || undefined,
          industry: industry.trim() || undefined,
          targetMarket: targetMarket.trim() || undefined,
          fundingNeeded: fundingNeeded.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate business plan")
      }

      const data = await response.json()
      setBusinessPlan(data)
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate business plan. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadBusinessPlan() {
    if (!businessPlan) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    function addText(text: string, fontSize: number, isBold: boolean = false, color: string = "#000000") {
      doc.setFontSize(fontSize)
      doc.setTextColor(color)
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

    function addSection(title: string, content: string | string[] | any) {
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        yPosition = margin
      }
      addText(title, 16, true)
      yPosition += 3

      if (Array.isArray(content)) {
        content.forEach((item) => {
          if (typeof item === "object") {
            Object.entries(item).forEach(([key, value]) => {
              addText(`${key}: ${value}`, 11)
            })
          } else {
            addText(`• ${item}`, 11)
          }
        })
      } else if (typeof content === "object" && content !== null) {
        Object.entries(content).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            addText(`${key}:`, 12, true)
            value.forEach((item: any) => {
              if (typeof item === "object") {
                Object.entries(item).forEach(([k, v]) => {
                  addText(`  ${k}: ${v}`, 10)
                })
              } else {
                addText(`  • ${item}`, 10)
              }
            })
          } else if (typeof value === "object" && value !== null) {
            addText(`${key}:`, 12, true)
            Object.entries(value).forEach(([k, v]) => {
              addText(`  ${k}: ${v}`, 10)
            })
          } else {
            addText(`${key}: ${value}`, 11)
          }
        })
      } else {
        addText(content, 11)
      }
      yPosition += 5
    }

    // Title Page
    addText("BUSINESS PLAN", 24, true)
    yPosition += 10
    addText(businessPlan.executive_summary.business_name, 18, true)
    yPosition += 10
    addText(`Generated: ${new Date().toLocaleDateString()}`, 10)
    yPosition += 20

    // Executive Summary
    addSection("1. EXECUTIVE SUMMARY", businessPlan.executive_summary.business_overview)
    addText("Mission Statement:", 12, true)
    addText(businessPlan.executive_summary.mission_statement, 11)
    yPosition += 5
    addText("Key Objectives:", 12, true)
    businessPlan.executive_summary.key_objectives.forEach((obj) => addText(`• ${obj}`, 11))
    yPosition += 5
    addText("Financial Highlights:", 12, true)
    addText(businessPlan.executive_summary.financial_highlights, 11)
    yPosition += 10

    // Company Description
    addSection("2. COMPANY DESCRIPTION", {
      "Company Name": businessPlan.company_description.company_name,
      "Legal Structure": businessPlan.company_description.legal_structure,
      "Location": businessPlan.company_description.location,
      "History": businessPlan.company_description.history,
    })
    addText("Products/Services:", 12, true)
    businessPlan.company_description.products_services.forEach((ps) => addText(`• ${ps}`, 11))
    yPosition += 5
    addText("Competitive Advantages:", 12, true)
    businessPlan.company_description.competitive_advantages.forEach((ca) => addText(`• ${ca}`, 11))
    yPosition += 10

    // Market Analysis
    addSection("3. MARKET ANALYSIS", businessPlan.market_analysis.industry_overview)
    addText("Target Market:", 12, true)
    addText(businessPlan.market_analysis.target_market, 11)
    yPosition += 5
    addText("Market Size:", 12, true)
    addText(businessPlan.market_analysis.market_size, 11)
    yPosition += 5
    addText("Market Trends:", 12, true)
    businessPlan.market_analysis.market_trends.forEach((trend) => addText(`• ${trend}`, 11))
    yPosition += 5
    addText("Customer Analysis:", 12, true)
    addText(businessPlan.market_analysis.customer_analysis, 11)
    yPosition += 5
    addText("Competitor Analysis:", 12, true)
    addText(`Competitors: ${businessPlan.market_analysis.competitor_analysis.competitors.join(", ")}`, 11)
    addText(businessPlan.market_analysis.competitor_analysis.competitive_positioning, 11)
    yPosition += 10

    // Organization & Management
    addSection("4. ORGANIZATION & MANAGEMENT", businessPlan.organization_management.organizational_structure)
    addText("Management Team:", 12, true)
    businessPlan.organization_management.management_team.forEach((member) => {
      addText(`${member.name} - ${member.role}`, 11, true)
      addText(`  Experience: ${member.experience}`, 10)
    })
    yPosition += 5
    addText("Advisors:", 12, true)
    businessPlan.organization_management.advisors.forEach((advisor) => addText(`• ${advisor}`, 11))
    yPosition += 5
    addText("Hiring Plan:", 12, true)
    addText(businessPlan.organization_management.hiring_plan, 11)
    yPosition += 10

    // Service/Product Line
    addSection("5. SERVICE/PRODUCT LINE", "")
    businessPlan.service_product_line.products_services.forEach((product) => {
      addText(product.name, 12, true)
      addText(`Description: ${product.description}`, 11)
      addText(`Pricing: ${product.pricing}`, 11)
      addText(`Target Market: ${product.target_market}`, 11)
      yPosition += 3
    })
    addText("Research & Development:", 12, true)
    addText(businessPlan.service_product_line.research_development, 11)
    yPosition += 5
    addText("Intellectual Property:", 12, true)
    addText(businessPlan.service_product_line.intellectual_property, 11)
    yPosition += 10

    // Marketing & Sales
    addSection("6. MARKETING & SALES STRATEGY", businessPlan.marketing_sales.marketing_strategy)
    addText("Sales Strategy:", 12, true)
    addText(businessPlan.marketing_sales.sales_strategy, 11)
    yPosition += 5
    addText("Pricing Strategy:", 12, true)
    addText(businessPlan.marketing_sales.pricing_strategy, 11)
    yPosition += 5
    addText("Distribution Channels:", 12, true)
    businessPlan.marketing_sales.distribution_channels.forEach((channel) => addText(`• ${channel}`, 11))
    yPosition += 5
    addText("Promotional Activities:", 12, true)
    businessPlan.marketing_sales.promotional_activities.forEach((activity) => addText(`• ${activity}`, 11))
    yPosition += 5
    addText("Sales Forecast:", 12, true)
    addText(businessPlan.marketing_sales.sales_forecast, 11)
    yPosition += 10

    // Financial Projections
    addSection("7. FINANCIAL PROJECTIONS", "")
    addText("Startup Costs:", 12, true)
    businessPlan.financial_projections.startup_costs.forEach((cost) => {
      addText(`${cost.item}: ${cost.amount}`, 11)
    })
    yPosition += 5
    addText("Revenue Projections:", 12, true)
    addText(`Year 1: ${businessPlan.financial_projections.revenue_projections.year_1}`, 11)
    addText(`Year 2: ${businessPlan.financial_projections.revenue_projections.year_2}`, 11)
    addText(`Year 3: ${businessPlan.financial_projections.revenue_projections.year_3}`, 11)
    addText("Assumptions:", 12, true)
    businessPlan.financial_projections.revenue_projections.assumptions.forEach((assumption) =>
      addText(`• ${assumption}`, 10)
    )
    yPosition += 5
    addText("Expense Projections:", 12, true)
    addText(`Year 1: ${businessPlan.financial_projections.expense_projections.year_1}`, 11)
    addText(`Year 2: ${businessPlan.financial_projections.expense_projections.year_2}`, 11)
    addText(`Year 3: ${businessPlan.financial_projections.expense_projections.year_3}`, 11)
    yPosition += 5
    addText("Break-Even Analysis:", 12, true)
    addText(businessPlan.financial_projections.break_even_analysis, 11)
    yPosition += 5
    addText("Funding Requirements:", 12, true)
    addText(businessPlan.financial_projections.funding_requirements, 11)
    yPosition += 5
    if (businessPlan.financial_projections.use_of_funds.length > 0) {
      addText("Use of Funds:", 12, true)
      businessPlan.financial_projections.use_of_funds.forEach((fund) => {
        addText(`${fund.category} (${fund.amount}): ${fund.description}`, 11)
      })
    }
    yPosition += 10

    // Risk Analysis
    addSection("8. RISK ANALYSIS", "")
    businessPlan.risk_analysis.risks.forEach((riskItem) => {
      addText(`Risk: ${riskItem.risk}`, 12, true)
      addText(`Impact: ${riskItem.impact}`, 11)
      addText(`Mitigation: ${riskItem.mitigation}`, 11)
      yPosition += 3
    })
    yPosition += 10

    // Implementation Timeline
    addSection("9. IMPLEMENTATION TIMELINE", "")
    businessPlan.implementation_timeline.milestones.forEach((milestone) => {
      addText(`${milestone.phase} (${milestone.timeline})`, 12, true)
      milestone.activities.forEach((activity) => addText(`• ${activity}`, 11))
      yPosition += 3
    })

    // Footer
    yPosition = doc.internal.pageSize.getHeight() - 15
    doc.setFontSize(10)
    doc.setTextColor("#666666")
    doc.text("Generated by Tool Thinker Business Plan Generator", margin, yPosition)

    doc.save(`business-plan-${businessPlan.executive_summary.business_name.replace(/\s+/g, "-")}-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Business Plan Generator" toolId="business-plan-generator" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <FileCheck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Business Plan Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create a comprehensive, professional business plan with AI-powered assistance
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {!businessPlan ? (
          <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-gray-100">
            <div className="space-y-8">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-gray-900 mb-3">
                  Business Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., TechStart Solutions"
                  className="border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl py-3"
                />
                <p className="mt-2 text-sm text-gray-500">
                  The name of your business or startup
                </p>
              </div>

              <div>
                <label htmlFor="businessIdea" className="block text-sm font-semibold text-gray-900 mb-3">
                  Describe Your Business Idea <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="businessIdea"
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="e.g., A SaaS platform that helps small businesses manage their inventory and track sales in real-time. The platform will include features like automated reordering, sales analytics, and multi-location support..."
                  rows={6}
                  className="resize-none border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Provide a detailed description of your business concept, products/services, and what problem you're solving
                </p>
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-semibold text-gray-900 mb-3">
                  Industry <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., SaaS, E-commerce, Healthcare, FinTech, Education..."
                  className="border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl py-3"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Specify the industry or sector your business operates in
                </p>
              </div>

              <div>
                <label htmlFor="targetMarket" className="block text-sm font-semibold text-gray-900 mb-3">
                  Target Market <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  id="targetMarket"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="e.g., Small to medium-sized retail businesses with 10-50 employees, located in urban areas, currently using manual inventory management systems..."
                  rows={3}
                  className="resize-none border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Describe your ideal customers and target market
                </p>
              </div>

              <div>
                <label htmlFor="fundingNeeded" className="block text-sm font-semibold text-gray-900 mb-3">
                  Funding Requirements <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  id="fundingNeeded"
                  value={fundingNeeded}
                  onChange={(e) => setFundingNeeded(e.target.value)}
                  placeholder="e.g., $250,000 seed funding"
                  className="border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl py-3"
                />
                <p className="mt-2 text-sm text-gray-500">
                  If you're seeking funding, specify the amount and type (seed, Series A, etc.)
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={generateBusinessPlan}
                disabled={isGenerating || !businessIdea.trim()}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Business Plan...
                  </span>
                ) : (
                  "Generate Business Plan"
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
                  <h2 className="text-3xl font-bold mb-2">Your Business Plan</h2>
                  <p className="text-gray-300 text-lg">{businessPlan.executive_summary.business_name}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ShareButton toolName="Business Plan Generator" toolId="business-plan-generator" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" />
                  <Button 
                    onClick={downloadBusinessPlan} 
                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    📥 Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setBusinessPlan(null)
                      setBusinessIdea("")
                      setBusinessName("")
                      setIndustry("")
                      setTargetMarket("")
                      setFundingNeeded("")
                    }}
                    className="bg-gray-700 text-white hover:bg-gray-600 font-semibold px-6 py-3 rounded-xl border-2 border-gray-600 transition-all"
                  >
                    Create New Plan
                  </Button>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">1. Executive Summary</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Name</h3>
                  <p className="text-gray-700">{businessPlan.executive_summary.business_name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mission Statement</h3>
                  <p className="text-gray-700">{businessPlan.executive_summary.mission_statement}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Overview</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.executive_summary.business_overview}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Objectives</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.executive_summary.key_objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Highlights</h3>
                  <p className="text-gray-700">{businessPlan.executive_summary.financial_highlights}</p>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">2. Company Description</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Name</h3>
                  <p className="text-gray-700">{businessPlan.company_description.company_name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Structure</h3>
                  <p className="text-gray-700">{businessPlan.company_description.legal_structure}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-700">{businessPlan.company_description.location}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">History</h3>
                  <p className="text-gray-700">{businessPlan.company_description.history}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Products/Services</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.company_description.products_services.map((ps, idx) => (
                      <li key={idx}>{ps}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Advantages</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.company_description.competitive_advantages.map((ca, idx) => (
                      <li key={idx}>{ca}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">3. Market Analysis</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry Overview</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.market_analysis.industry_overview}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Market</h3>
                  <p className="text-gray-700">{businessPlan.market_analysis.target_market}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Size</h3>
                  <p className="text-gray-700">{businessPlan.market_analysis.market_size}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Trends</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.market_analysis.market_trends.map((trend, idx) => (
                      <li key={idx}>{trend}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Analysis</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.market_analysis.customer_analysis}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitor Analysis</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Main Competitors:</strong> {businessPlan.market_analysis.competitor_analysis.competitors.join(", ")}
                  </p>
                  <p className="text-gray-700">{businessPlan.market_analysis.competitor_analysis.competitive_positioning}</p>
                </div>
              </div>
            </div>

            {/* Organization & Management */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">4. Organization & Management</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizational Structure</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.organization_management.organizational_structure}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Management Team</h3>
                  <div className="space-y-3">
                    {businessPlan.organization_management.management_team.map((member, idx) => (
                      <div key={idx} className="border-l-4 border-gray-300 pl-4">
                        <p className="font-semibold text-gray-900">{member.name} - {member.role}</p>
                        <p className="text-gray-700 text-sm">{member.experience}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advisors</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.organization_management.advisors.map((advisor, idx) => (
                      <li key={idx}>{advisor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiring Plan</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.organization_management.hiring_plan}</p>
                </div>
              </div>
            </div>

            {/* Service/Product Line */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">5. Service/Product Line</h2>
              </div>
              <div className="space-y-6">
                {businessPlan.service_product_line.products_services.map((product, idx) => (
                  <div key={idx} className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-700 mb-2">{product.description}</p>
                    <p className="text-gray-700 mb-1"><strong>Pricing:</strong> {product.pricing}</p>
                    <p className="text-gray-700"><strong>Target Market:</strong> {product.target_market}</p>
                  </div>
                ))}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Research & Development</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.service_product_line.research_development}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Intellectual Property</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.service_product_line.intellectual_property}</p>
                </div>
              </div>
            </div>

            {/* Marketing & Sales */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">6. Marketing & Sales Strategy</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Strategy</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.marketing_sales.marketing_strategy}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Strategy</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.marketing_sales.sales_strategy}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Strategy</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.marketing_sales.pricing_strategy}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Distribution Channels</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.marketing_sales.distribution_channels.map((channel, idx) => (
                      <li key={idx}>{channel}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Promotional Activities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {businessPlan.marketing_sales.promotional_activities.map((activity, idx) => (
                      <li key={idx}>{activity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Forecast</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.marketing_sales.sales_forecast}</p>
                </div>
              </div>
            </div>

            {/* Financial Projections */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">7. Financial Projections</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Startup Costs</h3>
                  <div className="space-y-2">
                    {businessPlan.financial_projections.startup_costs.map((cost, idx) => (
                      <div key={idx} className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-700">{cost.item}</span>
                        <span className="text-gray-900 font-semibold">{cost.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Projections</h3>
                  <div className="space-y-2 mb-3">
                    <p className="text-gray-700"><strong>Year 1:</strong> {businessPlan.financial_projections.revenue_projections.year_1}</p>
                    <p className="text-gray-700"><strong>Year 2:</strong> {businessPlan.financial_projections.revenue_projections.year_2}</p>
                    <p className="text-gray-700"><strong>Year 3:</strong> {businessPlan.financial_projections.revenue_projections.year_3}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Assumptions:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                      {businessPlan.financial_projections.revenue_projections.assumptions.map((assumption, idx) => (
                        <li key={idx}>{assumption}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense Projections</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700"><strong>Year 1:</strong> {businessPlan.financial_projections.expense_projections.year_1}</p>
                    <p className="text-gray-700"><strong>Year 2:</strong> {businessPlan.financial_projections.expense_projections.year_2}</p>
                    <p className="text-gray-700"><strong>Year 3:</strong> {businessPlan.financial_projections.expense_projections.year_3}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Break-Even Analysis</h3>
                  <p className="text-gray-700 whitespace-pre-line">{businessPlan.financial_projections.break_even_analysis}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding Requirements</h3>
                  <p className="text-gray-700">{businessPlan.financial_projections.funding_requirements}</p>
                </div>
                {businessPlan.financial_projections.use_of_funds.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Use of Funds</h3>
                    <div className="space-y-2">
                      {businessPlan.financial_projections.use_of_funds.map((fund, idx) => (
                        <div key={idx} className="border-l-4 border-gray-300 pl-4">
                          <p className="font-semibold text-gray-900">{fund.category} ({fund.amount})</p>
                          <p className="text-gray-700 text-sm">{fund.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">8. Risk Analysis</h2>
              </div>
              <div className="space-y-4">
                {businessPlan.risk_analysis.risks.map((riskItem, idx) => (
                  <div key={idx} className="border-l-4 border-yellow-400 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk: {riskItem.risk}</h3>
                    <p className="text-gray-700 mb-2"><strong>Impact:</strong> {riskItem.impact}</p>
                    <p className="text-gray-700"><strong>Mitigation:</strong> {riskItem.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-200">
                <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">9. Implementation Timeline</h2>
              </div>
              <div className="space-y-4">
                {businessPlan.implementation_timeline.milestones.map((milestone, idx) => (
                  <div key={idx} className="border-l-4 border-gray-900 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {milestone.phase} <span className="text-gray-600 font-normal">({milestone.timeline})</span>
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                      {milestone.activities.map((activity, actIdx) => (
                        <li key={actIdx}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

