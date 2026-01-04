"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  LayoutGrid,
  Compass,
  BarChart3,
  Smartphone,
  FileCheck,
  Presentation,
  Mic,
  DollarSign,
  Gem,
  TrendingUp,
  TrendingDown,
  Calculator,
  Clock,
  Users,
  Search,
  Rocket,
  FileText,
  Zap,
  MessageCircle,
  Bot,
  Link2,
  Sparkles,
} from "lucide-react"

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  href: string
  category: string
  external?: boolean
}

// Icon mapping function
const getIcon = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "layout-grid": LayoutGrid,
    "compass": Compass,
    "bar-chart-3": BarChart3,
    "smartphone": Smartphone,
    "file-check": FileCheck,
    "presentation": Presentation,
    "mic": Mic,
    "dollar-sign": DollarSign,
    "gem": Gem,
    "trending-up": TrendingUp,
    "trending-down": TrendingDown,
    "calculator": Calculator,
    "clock": Clock,
    "users": Users,
    "search": Search,
    "rocket": Rocket,
    "file-text": FileText,
    "zap": Zap,
    "message-circle": MessageCircle,
    "bot": Bot,
    "link2": Link2,
  }
  
  const IconComponent = iconMap[iconName] || FileText
  return IconComponent
}

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showMoreCounts, setShowMoreCounts] = useState<Record<string, number>>({})
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const initializedRef = useRef(false)

  const tools: Tool[] = [
    {
      id: "framework-tools",
      title: "Framework Tools",
      description: "Explore proven business frameworks organized by stage: Clarify & Validate, Design Your Product, and Product Launch",
      icon: "layout-grid",
      href: "/tools/frameworks",
      category: "Framework Tools",
    },
    {
      id: "framework-navigator",
      title: "Framework Navigator",
      description: "Navigate through all available business frameworks and find the right one for your needs",
      icon: "compass",
      href: "/tools/framework-navigator",
      category: "Framework Tools",
    },
    {
      id: "business-model-generator",
      title: "Business Model Generator",
      description: "Generate and visualize your business model with AI-powered assistance",
      icon: "bar-chart-3",
      href: "/tools/business-model-generator",
      category: "Generator Tools",
    },
    {
      id: "marketing-blueprint",
      title: "Marketing Blueprint",
      description: "Create a complete attention-to-scale marketing system based on proven Facebook Ads strategies",
      icon: "smartphone",
      href: "/tools/marketing-blueprint",
      category: "Generator Tools",
    },
    {
      id: "business-plan-generator",
      title: "Business Plan Generator",
      description: "Create a comprehensive, professional business plan with all essential sections and financial projections",
      icon: "file-check",
      href: "/tools/business-plan-generator",
      category: "Generator Tools",
    },
    {
      id: "pitch-deck-generator",
      title: "Pitch Deck Generator",
      description: "Create an investor-ready pitch deck with all essential slides for fundraising",
      icon: "presentation",
      href: "/tools/pitch-deck-generator",
      category: "Generator Tools",
    },
    {
      id: "customer-interview-generator",
      title: "Customer Interview Guide",
      description: "Generate comprehensive interview questions and scripts to validate your business idea with customers",
      icon: "mic",
      href: "/tools/customer-interview-generator",
      category: "Generator Tools",
    },
    {
      id: "financial-model-calculator",
      title: "Financial Model Calculator",
      description: "Calculate unit economics, revenue projections, cash flow, and financial health metrics",
      icon: "dollar-sign",
      href: "/tools/financial-model-calculator",
      category: "Calculator Tools",
    },
    {
      id: "valuation-calculator",
      title: "Valuation Calculator",
      description: "Estimate your startup valuation for fundraising and investor conversations",
      icon: "gem",
      href: "/tools/valuation-calculator",
      category: "Calculator Tools",
    },
    {
      id: "equity-dilution-calculator",
      title: "Equity Dilution Calculator",
      description: "Calculate how funding rounds affect your ownership percentage",
      icon: "trending-down",
      href: "/tools/equity-dilution-calculator",
      category: "Calculator Tools",
    },
    {
      id: "market-size-calculator",
      title: "Market Size Calculator",
      description: "Calculate TAM, SAM, and SOM for your startup",
      icon: "trending-up",
      href: "/tools/market-size-calculator",
      category: "Calculator Tools",
    },
    {
      id: "pricing-strategy-calculator",
      title: "Pricing Strategy Calculator",
      description: "Determine optimal pricing based on costs, margins, and market positioning",
      icon: "calculator",
      href: "/tools/pricing-strategy-calculator",
      category: "Calculator Tools",
    },
    {
      id: "runway-calculator",
      title: "Runway Calculator",
      description: "Calculate how long your startup can operate with current cash",
      icon: "clock",
      href: "/tools/runway-calculator",
      category: "Calculator Tools",
    },
    {
      id: "team-cost-calculator",
      title: "Team Cost Calculator",
      description: "Calculate total cost of employees including hidden costs",
      icon: "users",
      href: "/tools/team-cost-calculator",
      category: "Calculator Tools",
    },
    {
      id: "competitor-analysis",
      title: "Competitor Analysis Tool",
      description: "Analyze your competitive landscape and identify positioning opportunities",
      icon: "search",
      href: "/tools/competitor-analysis",
      category: "Generator Tools",
    },
    {
      id: "startup-plan-generator",
      title: "Startup Plan Generator",
      description: "Turn your messy idea into a validated, structured, executable startup plan",
      icon: "rocket",
      href: "/tools/startup-plan-generator",
      category: "Generator Tools",
    },
    {
      id: "templates",
      title: "Downloadable Templates",
      description: "Access ready-to-use templates for various business needs",
      icon: "file-text",
      href: "/tools/templates",
      category: "Template Tools",
    },
    {
      id: "alpha-hustler",
      title: "Alpha Hustler",
      description: "Accelerate your startup journey with powerful tools and resources",
      icon: "zap",
      href: "https://alphahustler.tech/",
      category: "External Tools",
      external: true,
    },
    {
      id: "consultation",
      title: "Free Consultation",
      description: "Get AI-powered startup advice and guidance from an expert consultant",
      icon: "message-circle",
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
  const toolsByCategory = useMemo(() => {
    return otherTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = []
      }
      acc[tool.category].push(tool)
      return acc
    }, {} as Record<string, Tool[]>)
  }, [otherTools])

  const categoryOrder = [
    "Framework Tools",
    "Generator Tools",
    "Calculator Tools",
    "Template Tools",
    "AI Tools",
    "External Tools",
  ]

  // Initialize expanded categories and show more counts
  useEffect(() => {
    const categoryKeys = Object.keys(toolsByCategory).sort().join(',')
    const categoryCounts = Object.values(toolsByCategory).map(t => t.length).join(',')
    const stableKey = `${categoryKeys}-${categoryCounts}`
    
    const initialExpanded = new Set<string>()
    const initialCounts: Record<string, number> = {}
    
    categoryOrder.forEach((category) => {
      const tools = toolsByCategory[category] || []
      if (tools.length > 0) {
        initialExpanded.add(category)
        // Show 4 tools initially, rest with "Show More"
        initialCounts[category] = Math.min(4, tools.length)
      }
    })
    
    setExpandedCategories(initialExpanded)
    setShowMoreCounts(initialCounts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]) // Re-initialize when search changes

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Show more tools in a category
  const showMoreTools = (category: string) => {
    const totalTools = (toolsByCategory[category] || []).length
    setShowMoreCounts((prev) => ({
      ...prev,
      [category]: totalTools,
    }))
  }

  // Filter by category
  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category)
    if (category) {
      // Scroll to category
      const categoryId = category.toLowerCase().replace(/\s+/g, '-')
      const element = categoryRefs.current[category]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Filter tools by selected category
  const getFilteredToolsByCategory = () => {
    if (selectedCategory) {
      return { [selectedCategory]: toolsByCategory[selectedCategory] || [] }
    }
    return toolsByCategory
  }

  const filteredByCategory = getFilteredToolsByCategory()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Practical tools that help founders make quick progress. From frameworks to generators, everything you need to build your startup.
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 rounded-xl shadow-sm transition-all duration-200"
              />
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm font-medium text-gray-600">
                {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Enhanced Category Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10 px-2">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              All Tools
            </button>
            {categoryOrder.map((category) => {
              const count = (toolsByCategory[category] || []).length
              if (count === 0) return null
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {category} <span className="opacity-75">({count})</span>
                </button>
              )
            })}
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-2 border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-800 text-xl font-semibold mb-2">No tools found</p>
              <p className="text-gray-500">Try searching with different keywords or browse by category</p>
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Popular Tools Section */}
            {popularTools.length > 0 && (
              <div id="popular-tools" className="scroll-mt-20 bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-100/30 rounded-3xl p-10 -mx-4 sm:-mx-6 lg:-mx-8 relative border-2 border-green-200/50 shadow-xl">
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-t-3xl"></div>
                
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-green-300/50">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-12 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full shadow-lg"></div>
                    <div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-1">Popular Tools</h2>
                      <p className="text-sm text-gray-600 font-medium">Most used by founders like you</p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="px-5 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold rounded-full border-2 border-green-500 shadow-lg flex items-center gap-1.5">
                      <span className="text-base">⭐</span> Most Used
                    </span>
                  </div>
                </div>
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {popularTools.map((tool) => {
                  const content = (
                    <div className="flex flex-col h-full">
                      <div className="mb-6 flex items-start">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-sm border border-gray-200">
                          {(() => {
                            const IconComponent = getIcon(tool.icon)
                            return <IconComponent className="w-8 h-8 text-gray-700" />
                          })()}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        {tool.title}
                        {tool.external && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                            External ↗
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed flex-grow">{tool.description}</p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Get Started →</span>
                      </div>
                    </div>
                  )

                  if (tool.external) {
                    return (
                      <a
                        key={tool.id}
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer relative z-20"
                      >
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                        {content}
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 flex flex-col h-full transform hover:-translate-y-2 cursor-pointer relative z-20"
                    >
                      <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                      {content}
                    </Link>
                  )
                })}
              </div>
              </div>
          )}

          {/* Enhanced Sticky Category Navigation (Desktop) */}
          <div className="hidden lg:block sticky top-4 z-10 mb-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-100 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  handleCategoryFilter(null)
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                ↑ Top
              </button>
              {categoryOrder.map((category) => {
                const count = (toolsByCategory[category] || []).length
                if (count === 0) return null
                const categoryId = category.toLowerCase().replace(/\s+/g, '-')
                return (
                  <button
                    key={category}
                    onClick={() => {
                      const element = categoryRefs.current[category]
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      handleCategoryFilter(category)
                    }}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Other Categories */}
          {categoryOrder.map((category, index) => {
            const categoryTools = filteredByCategory[category]
            if (!categoryTools || categoryTools.length === 0) return null

            // Create URL-friendly ID from category name
            const categoryId = category.toLowerCase().replace(/\s+/g, '-')
            const isExpanded = expandedCategories.has(category)
            // Default to showing 4 tools, or all if less than 4
            const defaultVisibleCount = Math.min(4, categoryTools.length)
            const visibleCount = showMoreCounts[category] ?? defaultVisibleCount
            const hasMore = categoryTools.length > visibleCount
            const visibleTools = categoryTools.slice(0, visibleCount)

            // Alternate background colors for visual distinction
            const bgClass = index % 2 === 0 
              ? 'bg-white rounded-3xl p-8 -mx-4 sm:-mx-6 lg:-mx-8' 
              : 'bg-gray-50/50 rounded-3xl p-8 -mx-4 sm:-mx-6 lg:-mx-8'

            return (
              <div
                key={category}
                id={categoryId}
                ref={(el) => (categoryRefs.current[category] = el)}
                className={`scroll-mt-20 ${bgClass} relative`}
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                    <h2 className="text-3xl font-bold text-gray-900">{category}</h2>
                  </div>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="lg:hidden px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
                {isExpanded && (
                  <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    {visibleTools.map((tool) => {
                    const content = (
                      <div className="flex flex-col h-full">
                        <div className="mb-6 flex items-start">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-sm border border-gray-200">
                            {(() => {
                              const IconComponent = getIcon(tool.icon)
                              return <IconComponent className="w-7 h-7 text-gray-700" />
                            })()}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                          {tool.title}
                          {tool.external && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                              External ↗
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed flex-grow">{tool.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Get Started →</span>
                        </div>
                      </div>
                    )

                    if (tool.external) {
                      return (
                        <a
                          key={tool.id}
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer relative z-20"
                        >
                          {content}
                        </a>
                      )
                    }

                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer relative z-20"
                      >
                        {content}
                      </Link>
                    )
                  })}
                  </div>
                )}
                {hasMore && isExpanded && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => showMoreTools(category)}
                      className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Show {categoryTools.length - visibleCount} More {category.replace(' Tools', '')} Tools →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 shadow-xl border-2 border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Use Our Tools?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clarity and Confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Our tools simplify complex challenges and provide clear, step-by-step processes to guide your decisions
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Efficiency and Time-Saving</h3>
              <p className="text-gray-600 leading-relaxed">
                Save time and effort with pre-built tools designed to tackle common startup challenges
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Risk Reduction</h3>
              <p className="text-gray-600 leading-relaxed">
                Identify, analyze, and mitigate potential risks for sustainable growth
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-white rounded-3xl p-12 shadow-xl border-2 border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tool Categories</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="#framework-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Framework Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, Jobs-to-be-Done, and more. Our Framework Navigator helps you find the right framework for your specific needs.
              </p>
            </a>
            <a href="#generator-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Generator Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered tools that help you generate business plans, models, and strategic documents. Save time and get professional results with our intelligent generators.
              </p>
            </a>
            <a href="#template-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Template Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ready-to-use templates for various business needs. From planning documents to execution frameworks, we provide templates that you can customize for your startup.
              </p>
            </a>
            <a href="#ai-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered consultation and guidance tools that provide expert startup advice. Get personalized recommendations and strategic insights powered by artificial intelligence.
              </p>
            </a>
            <a href="#external-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 cursor-pointer">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">External Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Curated external tools and resources that complement our platform. Access additional tools and services that help accelerate your startup journey.
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

