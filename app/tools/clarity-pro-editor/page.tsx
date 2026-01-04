"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { PenTool } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { ShareButton } from "@/components/ShareButton"

export default function ClarityProEditorPage() {
  const [text, setText] = useState("")
  const [audience, setAudience] = useState("")
  const [tone, setTone] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const TONE_OPTIONS = [
    "friendly",
    "serious",
    "bold",
    "professional",
    "casual",
    "authoritative",
    "conversational",
    "persuasive",
  ]

  async function editText() {
    if (!text.trim()) {
      setError("Please enter text to edit")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/clarity-pro-editor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          audience: audience.trim() || undefined,
          tone: tone || undefined,
          format: "plain_text",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to edit text")
      }

      const data = await response.json()
      setResult(data.response)
    } catch (error: any) {
      setError(error.message || "Failed to edit text")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadPDF() {
    if (!result) return

    const doc = new jsPDF()
    let yPos = 20
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    const maxWidth = doc.internal.pageSize.width - 2 * margin

    doc.setFontSize(18)
    doc.text("Clearer Convo - Revised Text", margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    const lines = doc.splitTextToSize(result, maxWidth)
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, margin, yPos)
      yPos += 7
    })

    doc.save(`clarity-pro-edited-${Date.now()}.pdf`)
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Clearer Convo" toolId="clarity-pro-editor" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <PenTool className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Clearer Convo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Make your text clearer, tighter, and more direct while keeping your original meaning and tone
          </p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Edit <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type the text you want to improve..."
                  rows={12}
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {text.length} characters
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience (Optional)
                  </label>
                  <Input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., startup founders, investors, customers"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTone(tone === option ? "" : option)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          tone === option
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={editText}
                disabled={isGenerating || !text.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg font-semibold"
              >
                {isGenerating ? "Editing Text..." : "Edit with Clearer Convo"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Edited Text</h2>
                  <p className="text-gray-600">Clearer Convo improvements applied</p>
                </div>
                <div className="flex gap-2">
                  <ShareButton toolName="Clearer Convo" toolId="clarity-pro-editor" />
                  <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <MarkdownRenderer content={result} />
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setResult(null)
                setError(null)
              }}
              variant="outline"
              className="w-full"
            >
              Edit Another Text
            </Button>
          </div>
        )}

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  )
}

