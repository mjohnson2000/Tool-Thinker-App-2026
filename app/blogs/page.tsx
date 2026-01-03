export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blogs</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Framework Thinking</h2>
            <p className="text-gray-600 text-sm mb-4">4 April 2025</p>
            <p className="text-gray-600">Framework Thinking as a Remedy for Entrepreneurial Mental Strain...</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Think Faster and Talk Smarter</h2>
            <p className="text-gray-600 text-sm mb-4">11 April 2025</p>
            <p className="text-gray-600">Think Faster and Talk Smarter with Framework Thinking...</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Articulate Your Thoughts Clearly</h2>
            <p className="text-gray-600 text-sm mb-4">7 April 2025</p>
            <p className="text-gray-600">Articulate Your Thoughts Clearly...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

