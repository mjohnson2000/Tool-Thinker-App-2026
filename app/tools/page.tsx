import Link from "next/link"

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
  const tools: Tool[] = [
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
      id: "start-smart-os",
      title: "Start Smart OS",
      description: "Turn your messy idea into a validated, structured, executable startup plan",
      icon: "🚀",
      href: "/tools/start-smart-os",
      category: "OS Tools",
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

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practical tools that help founders make quick progress. From frameworks to generators, everything you need to build your startup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool) => {
            const content = (
              <>
                <div className="text-5xl mb-4">{tool.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {tool.title}
                  {tool.external && (
                    <span className="ml-2 text-sm text-gray-500">↗</span>
                  )}
                </h2>
                <p className="text-gray-600">{tool.description}</p>
              </>
            )

            if (tool.external) {
              return (
                <a
                  key={tool.id}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition border border-gray-200"
                >
                  {content}
                </a>
              )
            }

            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition border border-gray-200"
              >
                {content}
              </Link>
            )
          })}
        </div>

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
        
        <div className="mt-8 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tool Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Framework Tools</h3>
              <p className="text-gray-600 text-sm">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, and more.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generator Tools</h3>
              <p className="text-gray-600 text-sm">
                AI-powered tools that help you generate business plans, models, and strategic documents.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Template Tools</h3>
              <p className="text-gray-600 text-sm">
                Ready-to-use templates for various business needs, from planning to execution.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">OS Tools</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive operating systems like Start Smart OS that guide you through your entire startup journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

