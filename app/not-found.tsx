import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-6">Page Not Found</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

