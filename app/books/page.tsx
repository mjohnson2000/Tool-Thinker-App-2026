export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Books & Resources</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Smart</h2>
            <p className="text-gray-600 mb-6">
              A Framework Thinking Guide for Entrepreneurs - Transform the way you approach business with proven frameworks.
            </p>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
              PURCHASE HERE!
            </button>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">More Resources</h2>
            <p className="text-gray-600">Additional resources coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

