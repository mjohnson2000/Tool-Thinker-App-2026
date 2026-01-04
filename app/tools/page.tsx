"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  href: string
  category: string
  external?: boolean
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const tools: Tool[] = [
    {
      id: "framework-tools",
      title: "Framework Tools",
      description: "Explore proven business frameworks organized by stage: Clarify & Validate, Design Your Product, and Product Launch",
      icon: "📋",
      href: "/tools/frameworks",
      category: "Framework Tools",
    },
    {
      id: "framework-navigator",
      title: "Framework Navigator",
      description: "Navigate through all available business frameworks and find the right one for your needs",
      icon: "🧭",
      href: "/tools/framework-navigator",
      category: "Framework Tools",
    },
    {
      id: "business-model-generator",
      title: "Business Model Generator",
      description: "Generate and visualize your business model with AI-powered assistance",
      icon: "📊",
      href: "/tools/business-model-generator",
      category: "Generator Tools",
    },
    {
      id: "marketing-blueprint",
      title: "Marketing Blueprint",
      description: "Create a complete attention-to-scale marketing system based on proven Facebook Ads strategies",
      icon: "📱",
      href: "/tools/marketing-blueprint",
      category: "Generator Tools",
    },
    {
      id: "business-plan-generator",
      title: "Business Plan Generator",
      description: "Create a comprehensive, professional business plan with all essential sections and financial projections",
      icon: "📋",
      href: "/tools/business-plan-generator",
      category: "Generator Tools",
    },
    {
      id: "pitch-deck-generator",
      title: "Pitch Deck Generator",
      description: "Create an investor-ready pitch deck with all essential slides for fundraising",
      icon: "📊",
      href: "/tools/pitch-deck-generator",
      category: "Generator Tools",
    },
    {
      id: "customer-interview-generator",
      title: "Customer Interview Guide",
      description: "Generate comprehensive interview questions and scripts to validate your business idea with customers",
      icon: "🎤",
      href: "/tools/customer-interview-generator",
      category: "Generator Tools",
    },
    {
      id: "financial-model-calculator",
      title: "Financial Model Calculator",
      description: "Calculate unit economics, revenue projections, cash flow, and financial health metrics",
      icon: "💰",
      href: "/tools/financial-model-calculator",
      category: "Calculator Tools",
    },
    {
      id: "valuation-calculator",
      title: "Valuation Calculator",
      description: "Estimate your startup valuation for fundraising and investor conversations",
      icon: "💎",
      href: "/tools/valuation-calculator",
      category: "Calculator Tools",
    },
    {
      id: "equity-dilution-calculator",
      title: "Equity Dilution Calculator",
      description: "Calculate how funding rounds affect your ownership percentage",
      icon: "📊",
      href: "/tools/equity-dilution-calculator",
      category: "Calculator Tools",
    },
    {
      id: "market-size-calculator",
      title: "Market Size Calculator",
      description: "Calculate TAM, SAM, and SOM for your startup",
      icon: "📈",
      href: "/tools/market-size-calculator",
      category: "Calculator Tools",
    },
    {
      id: "pricing-strategy-calculator",
      title: "Pricing Strategy Calculator",
      description: "Determine optimal pricing based on costs, margins, and market positioning",
      icon: "💵",
      href: "/tools/pricing-strategy-calculator",
      category: "Calculator Tools",
    },
    {
      id: "runway-calculator",
      title: "Runway Calculator",
      description: "Calculate how long your startup can operate with current cash",
      icon: "⏱️",
      href: "/tools/runway-calculator",
      category: "Calculator Tools",
    },
    {
      id: "team-cost-calculator",
      title: "Team Cost Calculator",
      description: "Calculate total cost of employees including hidden costs",
      icon: "👥",
      href: "/tools/team-cost-calculator",
      category: "Calculator Tools",
    },
    {
      id: "competitor-analysis",
      title: "Competitor Analysis Tool",
      description: "Analyze your competitive landscape and identify positioning opportunities",
      icon: "🔍",
      href: "/tools/competitor-analysis",
      category: "Generator Tools",
    },
    {
      id: "startup-plan-generator",
      title: "Startup Plan Generator",
      description: "Turn your messy idea into a validated, structured, executable startup plan",
      icon: "🚀",
      href: "/tools/startup-plan-generator",
      category: "Generator Tools",
    },
    {
      id: "templates",
      title: "Downloadable Templates",
      description: "Access ready-to-use templates for various business needs",
      icon: "📄",
      href: "/tools/templates",
      category: "Template Tools",
    },
    {
      id: "alpha-hustler",
      title: "Alpha Hustler",
      description: "Accelerate your startup journey with powerful tools and resources",
      icon: "⚡",
      href: "https://alphahustler.tech/",
      category: "External Tools",
      external: true,
    },
    {
      id: "consultation",
      title: "Free Consultation",
      description: "Get AI-powered startup advice and guidance from an expert consultant",
      icon: "💬",
      href: "/consultation",
      category: "AI Tools",
    },
  ]

  // Popular tools (most used by users)
  const popularToolIds = [
    "alpha-hustler",
    "framework-navigator",
    "business-model-generator",
    "startup-plan-generator",
    "consultation",
  ]

  // Filter tools based on search query
  const filterTools = (toolList: Tool[]) => {
    if (!searchQuery.trim()) return toolList
    
    const query = searchQuery.toLowerCase().trim()
    return toolList.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    )
  }

  const filteredTools = filterTools(tools)
  const popularTools = filterTools(tools.filter((tool) => popularToolIds.includes(tool.id))).slice(0, 4)
  // Show all tools in their categories, even if they're popular (popular tools appear in both sections)
  const otherTools = filterTools(tools)

  // Group all tools by category (including popular ones)
  const toolsByCategory = otherTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, Tool[]>)

  const categoryOrder = [
    "Framework Tools",
    "Generator Tools",
    "Calculator Tools",
    "Template Tools",
    "AI Tools",
    "External Tools",
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Practical tools that help founders make quick progress. From frameworks to generators, everything you need to build your startup.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">No tools found</p>
            <p className="text-gray-500 text-sm">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Popular Tools Section */}
            {popularTools.length > 0 && (
              <div id="popular-tools" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Popular Tools</h2>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    Most Used
                  </span>
                </div>
              <div className="grid md:grid-cols-2 gap-6">
                {popularTools.map((tool) => {
                  const content = (
                    <div className="flex flex-col h-full">
                      <div className="text-5xl mb-5 flex items-start">
                        {tool.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        {tool.title}
                        {tool.external && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            External ↗
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                    </div>
                  )

                  if (tool.external) {
                    return (
                      <a
                        key={tool.id}
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col h-full"
                      >
                        {content}
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col h-full"
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Other Categories */}
          {categoryOrder.map((category) => {
            const categoryTools = toolsByCategory[category]
            if (!categoryTools || categoryTools.length === 0) return null

            // Create URL-friendly ID from category name
            const categoryId = category.toLowerCase().replace(/\s+/g, '-')

            return (
              <div key={category} id={categoryId} className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {categoryTools.map((tool) => {
                    const content = (
                      <div className="flex flex-col h-full">
                        <div className="text-5xl mb-5 flex items-start">
                          {tool.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                          {tool.title}
                          {tool.external && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                              External ↗
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
                      </div>
                    )

                    if (tool.external) {
                      return (
                        <a
                          key={tool.id}
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col h-full"
                        >
                          {content}
                        </a>
                      )
                    }

                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex flex-col h-full"
                      >
                        {content}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
          </div>
        )}

        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use Our Tools?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Clarity and Confidence</h3>
              <p className="text-gray-600">
                Our tools simplify complex challenges and provide clear, step-by-step processes to guide your decisions
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Efficiency and Time-Saving</h3>
              <p className="text-gray-600">
                Save time and effort with pre-built tools designed to tackle common startup challenges
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Risk Reduction</h3>
              <p className="text-gray-600">
                Identify, analyze, and mitigate potential risks for sustainable growth
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Tool Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="#framework-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Framework Tools</h3>
              <p className="text-gray-600 text-sm">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, Jobs-to-be-Done, and more. Our Framework Navigator helps you find the right framework for your specific needs.
              </p>
            </a>
            <a href="#generator-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Generator Tools</h3>
              <p className="text-gray-600 text-sm">
                AI-powered tools that help you generate business plans, models, and strategic documents. Save time and get professional results with our intelligent generators.
              </p>
            </a>
            <a href="#template-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Template Tools</h3>
              <p className="text-gray-600 text-sm">
                Ready-to-use templates for various business needs. From planning documents to execution frameworks, we provide templates that you can customize for your startup.
              </p>
            </a>
            <a href="#ai-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Tools</h3>
              <p className="text-gray-600 text-sm">
                AI-powered consultation and guidance tools that provide expert startup advice. Get personalized recommendations and strategic insights powered by artificial intelligence.
              </p>
            </a>
            <a href="#external-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">External Tools</h3>
              <p className="text-gray-600 text-sm">
                Curated external tools and resources that complement our platform. Access additional tools and services that help accelerate your startup journey.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

