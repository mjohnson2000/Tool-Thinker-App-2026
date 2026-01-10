"use client"

import { Modal } from "@/components/ui/modal"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["⌘", "K"], description: "Open global search" },
      { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
      { keys: ["⌘", "D"], description: "Go to dashboard" },
    ],
  },
  {
    category: "Projects",
    items: [
      { keys: ["⌘", "N"], description: "Create new project" },
      { keys: ["⌘", "F"], description: "Search projects" },
      { keys: ["Esc"], description: "Close modal/dialog" },
    ],
  },
  {
    category: "Editing",
    items: [
      { keys: ["⌘", "S"], description: "Save (when in editor)" },
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⌘", "⇧", "Z"], description: "Redo" },
    ],
  },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="md"
    >
      <div className="space-y-6">
        {shortcuts.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              {category.category}
            </h3>
            <div className="space-y-2">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600">{item.description}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((key, keyIdx) => (
                      <span key={keyIdx}>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                          {key}
                        </kbd>
                        {keyIdx < item.keys.length - 1 && (
                          <span className="mx-1 text-gray-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </Modal>
  )
}

