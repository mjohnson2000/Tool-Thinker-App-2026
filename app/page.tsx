import Link from "next/link"
import Image from "next/image"

// Book purchase URL
const BOOK_PURCHASE_URL = process.env.NEXT_PUBLIC_BOOK_PURCHASE_URL || "https://www.amazon.com/START-SMART-Entrepreneurs-Frameworks-need/dp/1300734477"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Startup Tools For Quick Progress
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Tool Thinker - Tools That Help Founders Make Progress
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/tools"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-lg font-semibold"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/tools#framework-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Framework Tools</h3>
              <p className="text-gray-600 text-sm">
                Navigate and apply proven business frameworks like Business Model Canvas, Value Proposition Canvas, Jobs-to-be-Done, and more. Our Framework Navigator helps you find the right framework for your specific needs.
              </p>
            </Link>
            <Link href="/tools#generator-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Generator Tools</h3>
              <p className="text-gray-600 text-sm">
                AI-powered tools that help you generate business plans, models, and strategic documents. Save time and get professional results with our intelligent generators.
              </p>
            </Link>
            <Link href="/tools#template-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Template Tools</h3>
              <p className="text-gray-600 text-sm">
                Ready-to-use templates for various business needs. From planning documents to execution frameworks, we provide templates that you can customize for your startup.
              </p>
            </Link>
            <Link href="/tools#os-tools" className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">OS Tools</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive operating systems like Start Smart OS that guide you through your entire startup journey. These integrated tools provide step-by-step guidance from idea to launch.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Tool Thinker Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Tool Thinker?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Practical & Actionable</h3>
              <p className="text-gray-600 text-sm">
                Every tool is designed to produce real, actionable results. No theory—just practical tools that help you make progress.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Time-Saving</h3>
              <p className="text-gray-600 text-sm">
                Stop reinventing the wheel. Our tools are built on proven methodologies, saving you hours of research and planning.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comprehensive</h3>
              <p className="text-gray-600 text-sm">
                From idea validation to product launch, we have tools for every stage of your startup journey.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Always Evolving</h3>
              <p className="text-gray-600 text-sm">
                We continuously add new tools and improve existing ones based on founder feedback and industry best practices.
              </p>
            </div>
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
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">90% of startups fail</h2>
          <p className="text-xl mb-8">because they lack the right tools and strategies. Don't let your dream become a statistic.</p>
          <div className="mb-8">
            <p className="text-lg mb-4">Thousands of entrepreneurs are starting smart</p>
          </div>
          <Link
            href="/tools"
            className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition text-lg font-semibold"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  )
}



