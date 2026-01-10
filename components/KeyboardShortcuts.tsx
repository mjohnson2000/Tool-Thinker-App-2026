"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Command, Search, HelpCircle, ArrowRight, Keyboard } from "lucide-react"

interface Shortcut {
  keys: string[]
  description: string
  category: "navigation" | "actions" | "general"
}

const shortcuts: Shortcut[] = [
  {
    keys: ["⌘", "K"],
    description: "Open global search",
    category: "navigation",
  },
  {
    keys: ["?"],
    description: "Show keyboard shortcuts",
    category: "general",
  },
  {
    keys: ["Esc"],
    description: "Close modals or dialogs",
    category: "general",
  },
  {
    keys: ["Enter"],
    description: "Submit forms or confirm actions",
    category: "actions",
  },
  {
    keys: ["⌘", "/"],
    description: "Focus search input",
    category: "navigation",
  },
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        // Trigger search focus - this will be handled by the search component
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // ? for help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only show help if not typing in an input
        const activeElement = document.activeElement
        const isInput = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA"
        if (!isInput) {
          e.preventDefault()
          setShowHelp(true)
        }
      }

      // Escape to close help
      if (e.key === "Escape" && showHelp) {
        setShowHelp(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showHelp])

  const navigationShortcuts = shortcuts.filter((s) => s.category === "navigation")
  const actionShortcuts = shortcuts.filter((s) => s.category === "actions")
  const generalShortcuts = shortcuts.filter((s) => s.category === "general")

  return (
    <>
      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Keyboard Shortcuts" size="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Use these keyboard shortcuts to navigate faster
            </p>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Navigation
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span
                        key={keyIndex}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700 shadow-sm"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Shortcuts */}
          {actionShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Command className="w-4 h-4" />
                Actions
              </h3>
              <div className="space-y-2">
                {actionShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700 shadow-sm"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              General
            </h3>
            <div className="space-y-2">
              {generalShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span
                        key={keyIndex}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono text-gray-700 shadow-sm"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}

