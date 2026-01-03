"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  categories: string[]
  image: string
  slug: string
}

const blogPosts: BlogPost[] = [
  {
    id: "jtbd",
    title: "Jobs-to-be-Done Framework: Understanding What Customers Really Want",
    excerpt: "Learn how the Jobs-to-be-Done framework helps you understand what customers really want by focusing on the 'job' they're hiring your product to do, rather than just product features or demographics.",
    date: "15 January 2025",
    categories: ["Framework Thinking", "Problem Solving", "Tools Framework", "Business"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    slug: "jobs-to-be-done-framework",
  },
  {
    id: "vpc",
    title: "Value Proposition Canvas: Design Products Customers Actually Want",
    excerpt: "The Value Proposition Canvas helps you design products and services that customers actually want by mapping customer needs to your value proposition. Learn how to create products that truly resonate with your target market.",
    date: "20 January 2025",
    categories: ["Framework Thinking", "Problem Solving", "Tools Framework", "Business", "Startup"],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    slug: "value-proposition-canvas",
  },
  {
    id: "bmc",
    title: "Business Model Canvas: Visualize Your Entire Business on One Page",
    excerpt: "The Business Model Canvas is a strategic management tool that lets you describe, design, and challenge your business model. Learn how to map out all key components of your business on a single page.",
    date: "22 January 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Startup", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    slug: "business-model-canvas",
  },
  {
    id: "lc",
    title: "Lean Canvas: Build Your Startup Business Model in Minutes",
    excerpt: "The Lean Canvas is a one-page business plan template designed for startups. Learn how to quickly validate your business idea, identify risks, and create a focused plan for building a successful startup.",
    date: "25 January 2025",
    categories: ["Framework Thinking", "Startup", "Tools Framework", "Business", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
    slug: "lean-canvas",
  },
  {
    id: "swot",
    title: "SWOT Analysis: Assess Your Business Strengths, Weaknesses, Opportunities, and Threats",
    excerpt: "SWOT Analysis is a strategic planning framework that helps you identify your business's internal strengths and weaknesses, as well as external opportunities and threats. Learn how to use this powerful tool to make better strategic decisions.",
    date: "28 January 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Problem Solving", "Decision Making Tools"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    slug: "swot-analysis",
  },
  {
    id: "dt",
    title: "Design Thinking: Solve Problems Through Human-Centered Innovation",
    excerpt: "Design Thinking is a human-centered approach to innovation that puts the user at the heart of the problem-solving process. Learn how to use empathy, creativity, and iteration to design solutions that truly meet user needs.",
    date: "1 February 2025",
    categories: ["Framework Thinking", "Problem Solving", "Tools Framework", "Business", "Startup"],
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop",
    slug: "design-thinking",
  },
  {
    id: "cj",
    title: "Customer Journey Map: Understand Your Customer's Complete Experience",
    excerpt: "Customer Journey Mapping helps you visualize your customer's experience from first contact through long-term engagement. Learn how to identify pain points, opportunities, and moments of truth to improve customer satisfaction.",
    date: "3 February 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Problem Solving"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    slug: "customer-journey",
  },
  {
    id: "em",
    title: "Empathy Map: Get Inside Your Customer's Mind",
    excerpt: "Empathy Maps help you understand your customers on a deeper level by mapping what they think, feel, see, hear, say, and do. Learn how to build genuine empathy and create products that truly resonate.",
    date: "5 February 2025",
    categories: ["Framework Thinking", "Problem Solving", "Tools Framework", "Business"],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
    slug: "empathy-map",
  },
  {
    id: "kano",
    title: "Kano Model: Prioritize Features That Delight Customers",
    excerpt: "The Kano Model helps you understand which features will satisfy customers and which will delight them. Learn how to prioritize product features based on customer satisfaction and create products that exceed expectations.",
    date: "7 February 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Problem Solving"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    slug: "kano-model",
  },
  {
    id: "mvp",
    title: "MVP (Minimum Viable Product): Build, Measure, Learn",
    excerpt: "The Minimum Viable Product (MVP) is the simplest version of your product that allows you to validate your assumptions with real users. Learn how to build MVPs that test critical hypotheses and accelerate learning.",
    date: "10 February 2025",
    categories: ["Framework Thinking", "Startup", "Tools Framework", "Business", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
    slug: "mvp",
  },
  {
    id: "pmf",
    title: "Product-Market Fit: The Key to Startup Success",
    excerpt: "Product-Market Fit is the moment when your product perfectly satisfies market demand. Learn how to recognize, measure, and achieve product-market fit to build a sustainable and successful business.",
    date: "12 February 2025",
    categories: ["Framework Thinking", "Startup", "Tools Framework", "Business", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    slug: "product-market-fit",
  },
  {
    id: "gh",
    title: "Growth Hacking: Rapid Growth Through Creative Experimentation",
    excerpt: "Growth Hacking combines marketing, product development, and data analysis to achieve rapid growth with minimal resources. Learn how to use creative, low-cost strategies to acquire and retain customers at scale.",
    date: "15 February 2025",
    categories: ["Framework Thinking", "Startup", "Tools Framework", "Business", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    slug: "growth-hacking",
  },
  {
    id: "okr",
    title: "OKRs (Objectives and Key Results): Align Teams and Drive Results",
    excerpt: "OKRs are a goal-setting framework that helps organizations align teams, focus efforts, and achieve ambitious results. Learn how to set effective objectives and measurable key results to drive performance.",
    date: "18 February 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Decision Making Tools"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    slug: "okrs",
  },
  {
    id: "mf",
    title: "Marketing Funnel: Guide Customers from Awareness to Purchase",
    excerpt: "The Marketing Funnel maps the customer journey from initial awareness to final purchase. Learn how to optimize each stage of the funnel to convert more prospects into customers and maximize your marketing ROI.",
    date: "20 February 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Decision Making Tools"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    slug: "marketing-funnel",
  },
  {
    id: "rm",
    title: "Risk Matrix: Assess and Prioritize Business Risks",
    excerpt: "The Risk Matrix helps you identify, assess, and prioritize risks based on their probability and impact. Learn how to use this powerful tool to make informed decisions and protect your business from potential threats.",
    date: "22 February 2025",
    categories: ["Framework Thinking", "Business", "Tools Framework", "Risk Management", "Decision Making Tools"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    slug: "risk-matrix",
  },
]

const categories = [
  "Artificial Intelligence (AI)",
  "Build Frameworks",
  "Business",
  "Career Growth",
  "Decision Making Tools",
  "Entrepreneurship",
  "Feynman Technique",
  "Framework Thinking",
  "General",
  "Learn Fast",
  "Problem Solving",
  "Risk Management",
  "Small Business",
  "Startup",
  "Startup Founder",
  "Tools Framework",
]

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      !selectedCategory ||
      post.categories.includes(selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  const recentPosts = blogPosts.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8 sticky top-20">
              {/* Search */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Search</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search for posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-gray-900 hover:bg-gray-800">
                    Search
                  </Button>
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
                <ul className="space-y-3">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="text-sm text-gray-600 hover:text-gray-900 transition"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`text-sm w-full text-left px-2 py-1 rounded ${
                        !selectedCategory
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`text-sm w-full text-left px-2 py-1 rounded ${
                          selectedCategory === category
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Blogs</h1>
            
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No blog posts found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchQuery ? "Try a different search term" : "Try selecting a different category"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blogs/${post.slug}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.slice(0, 3).map((category) => (
                          <span
                            key={category}
                            className="text-xs font-semibold text-gray-700 uppercase"
                          >
                            {category}
                          </span>
                        ))}
                        {post.categories.length > 3 && (
                          <span className="text-xs text-gray-500">+{post.categories.length - 3} more</span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-500 mb-3">{post.date}</p>
                      <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
