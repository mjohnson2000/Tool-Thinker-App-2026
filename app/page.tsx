import Link from "next/link"
import Image from "next/image"
import { NewUserHighlight } from "@/components/NewUserHighlight"
import { PathSelectionCard } from "@/components/PathSelectionCard"
import { 
  LayoutGrid, 
  Sparkles, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Target, 
  RefreshCw,
  Compass,
  FileCheck,
  Gem,
  Presentation,
  TrendingUp,
  Rocket,
  Lightbulb,
  FolderOpen
} from "lucide-react"

// Book purchase URL - using env utility for type safety
import { env } from "@/lib/env"
const BOOK_PURCHASE_URL = env.NEXT_PUBLIC_BOOK_PURCHASE_URL || "https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477"

export default function Home() {
  return (
    <div className="min-h-screen">
      <NewUserHighlight />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Startup Tools Pic.jpg"
            alt="Team collaborating on startup tools"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Startup Business Tools
            </h1>
            <p className="text-xl text-gray-100 mb-4 max-w-3xl mx-auto drop-shadow-md">
              For Quick Progress
            </p>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              What would you like to do first?
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              {/* Path 1: I have a business idea */}
              <PathSelectionCard
                path="project"
                title="I have a business idea"
                description="Great! Let's create a project to plan it step-by-step."
                benefits={["Structured planning", "Step-by-step guidance", "AI-powered insights"]}
                iconName="folder"
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
                href="/dashboard"
              />

              {/* Path 2: I need to discover an idea */}
              <PathSelectionCard
                path="discovery"
                title="I need to discover an idea"
                description="Perfect! Our Idea Discovery tool will help you find business ideas from scratch based on your interests and goals."
                benefits={["AI-powered suggestions", "Personalized opportunities", "Guided journey"]}
                iconName="lightbulb"
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-100"
                href="/tools/idea-discovery"
                className="bg-yellow-500/95 border-yellow-400/30 hover:bg-yellow-500 hover:border-yellow-400"
              />

              {/* Path 3: Just explore tools */}
              <PathSelectionCard
                path="explore"
                title="I just want to explore tools"
                description="No problem! Browse our 50+ tools to see what's available."
                benefits={["50+ tools available", "Calculators & generators", "Use anytime"]}
                iconName="compass"
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
                href="/tools"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">50+</div>
              <p className="text-gray-300 text-sm md:text-base font-medium">Tools Available</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">600+</div>
              <p className="text-gray-300 text-sm md:text-base font-medium">Active Founders</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">100+</div>
              <p className="text-gray-300 text-sm md:text-base font-medium">Plans Generated</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">24/7</div>
              <p className="text-gray-300 text-sm md:text-base font-medium">AI Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build, plan, and grow your startup
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/tools#framework-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Framework Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, Jobs-to-be-Done, and more. Our Framework Navigator helps you find the right framework for your specific needs.
              </p>
            </Link>
            <Link href="/tools#generator-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Generator Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered tools that help you generate business plans, pitch decks, marketing blueprints, and strategic documents. Save time and get professional results with our intelligent generators.
              </p>
            </Link>
            <Link href="/tools#calculator-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calculator Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Financial and strategic calculators to help you make informed decisions. Calculate valuations, equity dilution, market size, pricing strategies, runway, and team costs.
              </p>
            </Link>
            <Link href="/tools#template-tools" className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 cursor-pointer transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Template Tools</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ready-to-use templates for various business needs. From planning documents to execution frameworks, we provide templates that you can customize for your startup.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Tool Demos Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">See Our Tools In Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get a glimpse of how our tools help you build, plan, and grow your startup
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Framework Navigator Demo */}
            <Link href="/tools/framework-navigator" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <Compass className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Framework Navigator</h3>
                <p className="text-gray-600 text-sm">
                  Find the perfect framework for your business goal with our intelligent navigator
                </p>
              </div>
            </Link>

            {/* Business Plan Generator Demo */}
            <Link href="/tools/business-plan-generator" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <FileCheck className="w-8 h-8 text-blue-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Business Plan Generator</h3>
                <p className="text-gray-600 text-sm">
                  Create comprehensive business plans with AI-powered assistance in minutes
                </p>
              </div>
            </Link>

            {/* Valuation Calculator Demo */}
            <Link href="/tools/valuation-calculator" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <Gem className="w-8 h-8 text-green-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Valuation Calculator</h3>
                <p className="text-gray-600 text-sm">
                  Estimate your startup valuation for fundraising and investor conversations
                </p>
              </div>
            </Link>

            {/* Pitch Deck Generator Demo */}
            <Link href="/tools/pitch-deck-generator" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <Presentation className="w-8 h-8 text-purple-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pitch Deck Generator</h3>
                <p className="text-gray-600 text-sm">
                  Generate investor-ready pitch decks with structured slides and compelling narratives
                </p>
              </div>
            </Link>

            {/* Equity Dilution Calculator Demo */}
            <Link href="/tools/equity-dilution-calculator" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-amber-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Equity Dilution Calculator</h3>
                <p className="text-gray-600 text-sm">
                  Calculate how funding rounds affect your ownership percentage
                </p>
              </div>
            </Link>

            {/* Idea Discovery Demo */}
            <Link href="/tools/idea-discovery" className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-yellow-50 to-orange-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-8 h-8 text-yellow-700" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Idea Discovery</h3>
                <p className="text-gray-600 text-sm">
                  Discover your next business idea through a guided, AI-powered journey from interests to solution
                </p>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tools"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-lg font-semibold"
            >
              Explore All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Why Tool Thinker Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Tool Thinker?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by founders, for founders
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-md">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practical & Actionable</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every tool is designed to produce real, actionable results. No theory—just practical tools that help you make progress.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-md">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Time-Saving</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Stop reinventing the wheel. Our tools are built on proven methodologies, saving you hours of research and planning.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From idea validation to product launch, we have tools for every stage of your startup journey.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-md">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Always Evolving</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We continuously add new tools and improve existing ones based on founder feedback and industry best practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* People Section - Used By Founders */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full mx-auto"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Trusted By Founders Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of entrepreneurs who are building their startups with Tool Thinker
            </p>
          </div>

          {/* People Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  alt="Founder using Tool Thinker"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Alex Chen</h3>
                <p className="text-sm text-gray-600 mb-3">Founder, TechStart Solutions</p>
                <p className="text-gray-700 text-sm italic">
                  "Tool Thinker helped me validate my idea and create a solid business plan in days, not weeks. The frameworks are game-changers."
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-purple-100 to-purple-200">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face"
                  alt="Founder using Tool Thinker"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sarah Martinez</h3>
                <p className="text-sm text-gray-600 mb-3">CEO, GreenTech Innovations</p>
                <p className="text-gray-700 text-sm italic">
                  "The valuation calculator saved me hours of research. I walked into investor meetings with confidence and got funded."
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gradient-to-br from-green-100 to-green-200">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                  alt="Founder using Tool Thinker"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Michael Johnson</h3>
                <p className="text-sm text-gray-600 mb-3">Co-Founder, DataFlow Systems</p>
                <p className="text-gray-700 text-sm italic">
                  "From idea to pitch deck in one weekend. The AI-powered generators are incredible. Highly recommend to any founder."
                </p>
              </div>
            </div>
          </div>

          {/* Additional People Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-lg">
              Join <span className="font-bold text-gray-900">10,000+</span> founders building their startups with Tool Thinker
            </p>
          </div>
        </div>
      </section>

      {/* Book Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                START SMART - for Entrepreneurs: Frameworks are all you need.
              </h2>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">About this book</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                <strong>Start Smart: A Framework Thinking Guide for Entrepreneurs</strong> transforms the way you approach business, offering proven frameworks to guide every step of your entrepreneurial journey. From sparking ideas and validating opportunities to crafting a strategic business plan and scaling for growth, this practical guide delivers clarity, structure, and actionable insights.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Designed for aspiring entrepreneurs, first-time founders, and seasoned business owners alike, this book empowers you to make smarter decisions, mitigate risks, and unlock long-term success. Start Smart is your blueprint to building a thriving business in a structured, efficient, and impactful way.
              </p>
              <a
                href={BOOK_PURCHASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                PURCHASE HERE!
              </a>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative w-full max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-sm">
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <Image
                    src="/book-cover.png"
                    alt="START SMART - for Entrepreneurs book cover"
                    fill
                    className="rounded-lg shadow-xl object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 35vw, 28vw"
                    priority
                    quality={95}
                    style={{ objectPosition: 'top' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">90% of startups fail</h2>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">because they lack the right tools and strategies. Don't let your dream become a statistic.</p>
          <div className="mb-10">
            <p className="text-lg md:text-xl mb-6 text-gray-300">Thousands of entrepreneurs are starting smart</p>
          </div>
          <Link
            href="/tools"
            className="inline-block px-10 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-lg font-bold shadow-2xl hover:shadow-white/20 transform hover:scale-105"
          >
            Get Started Today →
          </Link>
        </div>
      </section>
    </div>
  )
}



