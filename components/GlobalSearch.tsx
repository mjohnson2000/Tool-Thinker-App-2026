"use client"

import { useState, useEffect, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Lightbulb, BarChart3, Loader2, ArrowRight, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchResults {
  projects: any[]
  notes: any[]
  outputs: any[]
}

export function GlobalSearch() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults>({ projects: [], notes: [], outputs: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
        setQuery("")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (debouncedQuery.trim() && isOpen && user) {
      performSearch(debouncedQuery)
    } else {
      setResults({ projects: [], notes: [], outputs: [] })
    }
  }, [debouncedQuery, isOpen, user])

  async function performSearch(searchQuery: string) {
    if (!user) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleResultClick(href: string) {
    router.push(href)
    setIsOpen(false)
    setQuery("")
  }

  const allResults = [
    ...results.projects.map(p => ({ ...p, type: "project", href: `/project/${p.id}/overview` })),
    ...results.notes.map(n => ({ ...n, type: "note", href: `/project/${n.project?.id}/overview` })),
    ...results.outputs.map(o => ({ ...o, type: "output", href: `/history` })),
  ]

  function getResultIcon(type: string) {
    switch (type) {
      case "project":
        return <FileText className="w-4 h-4" />
      case "note":
        return <Lightbulb className="w-4 h-4" />
      case "output":
        return <BarChart3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false)
        setQuery("")
      }}
      title=""
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search projects, notes, and outputs... (⌘K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 border-2 border-gray-200 focus:border-gray-900 text-lg"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1))
              } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex((prev) => Math.max(prev - 1, 0))
              } else if (e.key === "Enter" && allResults[selectedIndex]) {
                handleResultClick(allResults[selectedIndex].href)
              }
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : query.trim() ? (
          allResults.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                    Projects ({results.projects.length})
                  </h3>
                  {results.projects.map((project, idx) => (
                    <button
                      key={project.id}
                      onClick={() => handleResultClick(`/project/${project.id}/overview`)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition ${
                        selectedIndex === idx ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                          <p className="text-xs text-gray-500">Project</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.notes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2 mt-4">
                    Notes ({results.notes.length})
                  </h3>
                  {results.notes.map((note, idx) => (
                    <button
                      key={note.id}
                      onClick={() => handleResultClick(`/project/${note.project?.id}/overview`)}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition ${
                        selectedIndex === results.projects.length + idx ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{note.note_text}</p>
                          <p className="text-xs text-gray-500">
                            Note in {note.project?.name || "Project"}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.outputs.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2 mt-4">
                    Tool Outputs ({results.outputs.length})
                  </h3>
                  {results.outputs.map((output, idx) => (
                    <button
                      key={output.id}
                      onClick={() => handleResultClick("/history")}
                      className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition ${
                        selectedIndex === results.projects.length + results.notes.length + idx
                          ? "bg-gray-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{output.tool_name}</p>
                          <p className="text-xs text-gray-500">Tool Output</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Start typing to search...</p>
            <p className="text-xs mt-2">Search across projects, notes, and tool outputs</p>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑</kbd>
              <kbd className="px-2 py-1 bg-gray-100 rounded">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </Modal>
  )
}

