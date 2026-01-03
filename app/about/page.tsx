import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Tool Thinker</h1>
          <p className="text-xl text-gray-600">
            Startup Tools For Quick Progress
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Tool Thinker is dedicated to providing founders with practical tools that help them make quick progress. We believe that building a startup shouldn't be complicated—it should be guided by the right tools at the right time.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our platform offers a comprehensive suite of tools designed to help entrepreneurs navigate every stage of their journey, from initial idea validation to product launch and scaling.
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Framework Tools</h3>
              <p className="text-gray-600">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, Jobs-to-be-Done, and more. Our Framework Navigator helps you find the right framework for your specific needs.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Generator Tools</h3>
              <p className="text-gray-600">
                AI-powered tools that help you generate business plans, models, and strategic documents. Save time and get professional results with our intelligent generators.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Template Tools</h3>
              <p className="text-gray-600">
                Ready-to-use templates for various business needs. From planning documents to execution frameworks, we provide templates that you can customize for your startup.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">OS Tools</h3>
              <p className="text-gray-600">
                Comprehensive operating systems like Start Smart OS that guide you through your entire startup journey. These integrated tools provide step-by-step guidance from idea to launch.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Tool Thinker?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Practical & Actionable</h3>
              <p className="text-gray-600 text-sm">
                Every tool is designed to produce real, actionable results. No theory—just practical tools that help you make progress.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time-Saving</h3>
              <p className="text-gray-600 text-sm">
                Stop reinventing the wheel. Our tools are built on proven methodologies, saving you hours of research and planning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive</h3>
              <p className="text-gray-600 text-sm">
                From idea validation to product launch, we have tools for every stage of your startup journey.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Always Evolving</h3>
              <p className="text-gray-600 text-sm">
                We continuously add new tools and improve existing ones based on founder feedback and industry best practices.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-6">
            Explore our tools and find the right ones for your startup journey.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/tools"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Explore All Tools
            </Link>
            <Link
              href="/tools/start-smart-os"
              className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold"
            >
              Try Start Smart OS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

