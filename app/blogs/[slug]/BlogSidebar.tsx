"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BlogSidebarProps {
  recentPosts: Array<{
    id: string
    title: string
    slug: string
  }>
  categories: string[]
}

export function BlogSidebar({ recentPosts, categories }: BlogSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
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
              onKeyPress={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  window.location.href = `/blogs?search=${encodeURIComponent(searchQuery)}`
                }
              }}
            />
            <Button 
              className="bg-gray-900 hover:bg-gray-800"
              onClick={() => {
                if (searchQuery.trim()) {
                  window.location.href = `/blogs?search=${encodeURIComponent(searchQuery)}`
                }
              }}
            >
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
                  className="text-sm text-gray-600 hover:text-gray-900 transition line-clamp-2"
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
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/blogs?category=${encodeURIComponent(category)}`}
                  className="text-sm text-gray-600 hover:text-gray-900 transition block"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}


