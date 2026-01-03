import Link from "next/link"
import Image from "next/image"

// Book purchase URL - Update this with your actual purchase link
const BOOK_PURCHASE_URL = process.env.NEXT_PUBLIC_BOOK_PURCHASE_URL || "https://www.amazon.com/dp/YOUR_BOOK_ISBN"

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Books & Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Essential reading and resources to help you build a successful business
          </p>
        </div>

        {/* Start Smart Book Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-12">
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
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={BOOK_PURCHASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold text-center"
                >
                  PURCHASE HERE!
                </a>
                <Link
                  href="/tools/frameworks"
                  className="inline-block px-8 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold text-center"
                >
                  Explore Frameworks
                </Link>
              </div>
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

        {/* Additional Resources Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <p className="text-gray-600 mb-4">
            We're continuously adding new books and resources to help you on your entrepreneurial journey. Check back soon for more recommendations!
          </p>
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Reading</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Explore our framework tools to apply the concepts from Start Smart</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Read our blog posts for in-depth guides on each framework</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Use our tools to put framework thinking into practice</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

