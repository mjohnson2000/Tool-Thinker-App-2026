import Link from "next/link"
import Image from "next/image"

export default function FrameworksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Framework Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navigate and apply proven business frameworks to guide your startup journey
          </p>
        </div>

        {/* Stage 1: Clarify & Validate Your Idea */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">1. Clarify & Validate Your Idea</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Image */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                alt="Business meeting brainstorming session"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Right: Characteristics */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Characteristics</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• At the early conceptual stage</li>
                <li>• Exploring ideas</li>
                <li>• Identifies potential problems to solve</li>
                <li>• Evaluates market demand</li>
                <li>• It involves brainstorming, research, and initial planning to validate whether the idea is worth pursuing.</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Bottom Left: Benefits */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Clarity on the problem-solution fit</li>
                <li>• Initial market research</li>
                <li>• Understanding the target audience's needs.</li>
                <li>• Tools to validate ideas quickly and assess feasibility without heavy investment.</li>
              </ul>
            </div>
            
            {/* Bottom Right: Framework Package */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Framework Package</h3>
              <div className="space-y-3">
                <Link href="/blogs/jobs-to-be-done-framework" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Jobs-to-be-done
                </Link>
                <Link href="/blogs/value-proposition-canvas" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Value Proposition Canvas
                </Link>
                <Link href="/blogs/business-model-canvas" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Business Model Canvas
                </Link>
                <Link href="/blogs/lean-canvas" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Lean Canvas
                </Link>
                <Link href="/blogs/swot-analysis" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  SWOT Analysis
                </Link>
              </div>
            </div>
          </div>

          {/* Concluding Statement */}
          <p className="text-lg font-bold text-gray-900 text-center border-t pt-6">
            The goal is to refine your idea, understand the market potential, and build a strong foundation for the next stage
          </p>
        </div>

        {/* Stage 2: Design Your Product */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">2. Design Your Product</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Image */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop"
                alt="Product design and prototyping"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Right: Characteristics */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Characteristics</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Moving from concept to design</li>
                <li>• Turning ideas into tangible plans</li>
                <li>• Creating prototypes</li>
                <li>• Defining features</li>
                <li>• Ensuring product aligns with market needs</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Bottom Left: Benefits */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Feedback loops</li>
                <li>• Agile development</li>
                <li>• Validation of product features</li>
                <li>• Iterative testing</li>
                <li>• Customer insights</li>
              </ul>
            </div>
            
            {/* Bottom Right: Framework Package */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Framework Package</h3>
              <div className="space-y-3">
                <Link href="/blogs/design-thinking" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Design Thinking
                </Link>
                <Link href="/blogs/customer-journey" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Customer Journey
                </Link>
                <Link href="/blogs/empathy-map" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Empathy Map
                </Link>
                <Link href="/blogs/kano-model" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Kano Model
                </Link>
                <Link href="/blogs/mvp" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  MVP
                </Link>
              </div>
            </div>
          </div>

          {/* Concluding Statement */}
          <p className="text-lg font-bold text-gray-900 text-center border-t pt-6">
            The goal is to ensure your product solves a real problem, meets user needs, and is positioned effectively for the market
          </p>
        </div>

        {/* Stage 3: Product Launch */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">3. Product Launch</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left: Image */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                alt="Product launch and marketing"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Right: Characteristics */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Characteristics</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• The commercialization stage</li>
                <li>• Introducing the product to the market</li>
                <li>• Finalizing the product</li>
                <li>• Preparing marketing and sales strategies</li>
                <li>• Planning for distribution and scaling</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Bottom Left: Benefits */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Strong marketing strategies</li>
                <li>• Operational readiness</li>
                <li>• Effective ways to reach early adopters</li>
                <li>• Brand awareness and sales generation</li>
              </ul>
            </div>
            
            {/* Bottom Right: Framework Package */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Framework Package</h3>
              <div className="space-y-3">
                <Link href="/blogs/product-market-fit" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Product Market Fit
                </Link>
                <Link href="/blogs/growth-hacking" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Growth Hacking
                </Link>
                <Link href="/blogs/okrs" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  OKRs
                </Link>
                <Link href="/blogs/marketing-funnel" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Marketing Funnel
                </Link>
                <Link href="/blogs/risk-matrix" className="block bg-gray-600 text-white rounded-lg px-4 py-3 font-semibold text-center hover:bg-gray-700 transition">
                  Risk Matrix
                </Link>
              </div>
            </div>
          </div>

          {/* Concluding Statement */}
          <p className="text-lg font-bold text-gray-900 text-center border-t pt-6">
            The goal is to execute a successful launch, drive early adoption, build brand visibility, and lay the foundation for scaling
          </p>
        </div>

        {/* Framework Tools Section */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Framework Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/tools/framework-navigator"
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Framework Navigator</h3>
              <p className="text-gray-600 text-sm">
                Find the right framework for your specific business needs. Get AI-powered recommendations based on your goals.
              </p>
            </Link>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">More Frameworks Coming Soon</h3>
              <p className="text-gray-600 text-sm">
                We're continuously adding new framework tools to help you at every stage of your journey.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
