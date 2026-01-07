"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { Presentation, Sparkles } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

interface PitchDeck {
  company_name: string
  tagline: string
  slides: Array<{
    slide_number: number
    slide_title: string
    content: {
      headline?: string
      subheadline?: string
      bullet_points?: string[]
      paragraphs?: string[]
      metrics?: Array<{
        label: string
        value: string
      }>
      visual_description?: string
    }
  }>
  notes: string[]
}

export default function PitchDeckGeneratorPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = searchParams.get("projectId")
  
  const [companyName, setCompanyName] = useState("")
  const [businessIdea, setBusinessIdea] = useState("")
  const [targetMarket, setTargetMarket] = useState("")
  const [fundingAmount, setFundingAmount] = useState("")
  const [useOfFunds, setUseOfFunds] = useState("")
  const [traction, setTraction] = useState("")
  const [team, setTeam] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingProject, setLoadingProject] = useState(false)
  const [projectLoaded, setProjectLoaded] = useState(false)

  // Load project data if projectId is present
  useEffect(() => {
    if (projectId && user) {
      loadProjectData()
    }
  }, [projectId, user])

  async function loadProjectData() {
    if (!projectId || !user) return
    
    setLoadingProject(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoadingProject(false)
        return
      }

      const res = await fetch(`/api/projects/${projectId}/export-data`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const extracted = data.extracted || {}
        
        // Pre-fill form fields
        if (extracted.companyName) setCompanyName(extracted.companyName)
        if (extracted.businessIdea) setBusinessIdea(extracted.businessIdea)
        if (extracted.targetMarket) setTargetMarket(extracted.targetMarket)
        if (extracted.fundingAmount) setFundingAmount(extracted.fundingAmount)
        if (extracted.useOfFunds) setUseOfFunds(extracted.useOfFunds)
        if (extracted.traction) setTraction(extracted.traction)
        if (extracted.team) setTeam(extracted.team)
        
        setProjectLoaded(true)
      }
    } catch (error) {
      console.error("Failed to load project data:", error)
    } finally {
      setLoadingProject(false)
    }
  }

  async function generatePitchDeck() {
    if (!businessIdea.trim()) {
      setError("Please describe your business idea")
      return
    }

    setIsGenerating(true)
    setError(null)
    setPitchDeck(null)

    try {
      const response = await fetch("/api/pitch-deck-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim() || undefined,
          businessIdea: businessIdea.trim(),
          targetMarket: targetMarket.trim() || undefined,
          fundingAmount: fundingAmount.trim() || undefined,
          useOfFunds: useOfFunds.trim() || undefined,
          traction: traction.trim() || undefined,
          team: team.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate pitch deck")
      }

      const data = await response.json()
      setPitchDeck(data)
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate pitch deck. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadPitchDeck() {
    if (!pitchDeck) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    pitchDeck.slides.forEach((slide, index) => {
      if (index > 0) {
        doc.addPage()
      }

      let yPosition = margin

      // Slide number
      doc.setFontSize(10)
      doc.setTextColor("#666666")
      doc.text(`Slide ${slide.slide_number}`, pageWidth - margin - 20, 15, { align: "right" })

      // Slide title
      doc.setFontSize(18)
      doc.setTextColor("#000000")
      doc.setFont("helvetica", "bold")
      const titleLines = doc.splitTextToSize(slide.slide_title, maxWidth)
      doc.text(titleLines, margin, yPosition + 10)
      yPosition += titleLines.length * 7 + 10

      // Content
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      if (slide.content.headline) {
        doc.setFont("helvetica", "bold")
        doc.setFontSize(14)
        const headlineLines = doc.splitTextToSize(slide.content.headline, maxWidth)
        doc.text(headlineLines, margin, yPosition)
        yPosition += headlineLines.length * 6 + 5
        doc.setFontSize(12)
      }

      if (slide.content.subheadline) {
        doc.setFont("helvetica", "italic")
        const subheadLines = doc.splitTextToSize(slide.content.subheadline, maxWidth)
        doc.text(subheadLines, margin, yPosition)
        yPosition += subheadLines.length * 5 + 5
      }

      if (slide.content.paragraphs && slide.content.paragraphs.length > 0) {
        slide.content.paragraphs.forEach((paragraph) => {
          const paraLines = doc.splitTextToSize(paragraph, maxWidth)
          doc.text(paraLines, margin, yPosition)
          yPosition += paraLines.length * 5 + 3
        })
      }

      if (slide.content.bullet_points && slide.content.bullet_points.length > 0) {
        slide.content.bullet_points.forEach((point) => {
          const pointLines = doc.splitTextToSize(`• ${point}`, maxWidth - 10)
          doc.text(pointLines, margin + 5, yPosition)
          yPosition += pointLines.length * 5 + 2
        })
      }

      if (slide.content.metrics && slide.content.metrics.length > 0) {
        yPosition += 5
        slide.content.metrics.forEach((metric) => {
          doc.setFont("helvetica", "bold")
          doc.text(`${metric.label}:`, margin, yPosition)
          doc.setFont("helvetica", "normal")
          doc.text(metric.value, margin + 50, yPosition)
          yPosition += 6
        })
      }

      if (slide.content.visual_description) {
        yPosition += 5
        doc.setFontSize(10)
        doc.setTextColor("#666666")
        doc.setFont("helvetica", "italic")
        doc.text(`Visual: ${slide.content.visual_description}`, margin, yPosition)
      }
    })

    // Add notes page
    if (pitchDeck.notes && pitchDeck.notes.length > 0) {
      doc.addPage()
      doc.setFontSize(16)
      doc.setTextColor("#000000")
      doc.setFont("helvetica", "bold")
      doc.text("Presentation Notes & Tips", margin, margin)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      let yPos = margin + 15
      pitchDeck.notes.forEach((note) => {
        const noteLines = doc.splitTextToSize(`• ${note}`, maxWidth)
        doc.text(noteLines, margin, yPos)
        yPos += noteLines.length * 5 + 3
      })
    }

    doc.save(`pitch-deck-${pitchDeck.company_name.replace(/\s+/g, "-")}-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Data Loaded Notification */}
        {projectLoaded && projectId && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                ✨ Project data loaded! Your form has been pre-filled with data from your project.
              </p>
            </div>
          </div>
        )}
        
        {loadingProject && (
          <div className="mb-6 bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
            <p className="text-sm text-blue-700">Loading project data...</p>
          </div>
        )}
        
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Pitch Deck Generator" toolId="pitch-deck-generator" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Presentation className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pitch Deck Generator</h1>
          <p className="text-xl text-gray-600">
            Create an investor-ready pitch deck with all essential slides
          </p>
        </div>

        {!pitchDeck ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., TechStart Solutions"
                />
              </div>

              <div>
                <label htmlFor="businessIdea" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Idea / Solution *
                </label>
                <Textarea
                  id="businessIdea"
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="Describe your business, what problem you solve, and how your solution works..."
                  rows={6}
                  className="resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Provide a clear description of your business and solution
                </p>
              </div>

              <div>
                <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Market (Optional)
                </label>
                <Textarea
                  id="targetMarket"
                  value={targetMarket}
                  onChange={(e) => setTargetMarket(e.target.value)}
                  placeholder="Who are your target customers? What market are you addressing?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="fundingAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Amount (Optional)
                </label>
                <Input
                  id="fundingAmount"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="e.g., $500,000 seed round"
                />
              </div>

              <div>
                <label htmlFor="useOfFunds" className="block text-sm font-medium text-gray-700 mb-2">
                  Use of Funds (Optional)
                </label>
                <Textarea
                  id="useOfFunds"
                  value={useOfFunds}
                  onChange={(e) => setUseOfFunds(e.target.value)}
                  placeholder="How will you use the funding? (e.g., 40% product development, 30% marketing, 20% team, 10% operations)"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="traction" className="block text-sm font-medium text-gray-700 mb-2">
                  Traction / Milestones (Optional)
                </label>
                <Textarea
                  id="traction"
                  value={traction}
                  onChange={(e) => setTraction(e.target.value)}
                  placeholder="Any traction, metrics, customers, partnerships, or milestones achieved?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">
                  Team (Optional)
                </label>
                <Textarea
                  id="team"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="Key team members and their relevant experience"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={generatePitchDeck}
                disabled={isGenerating || !businessIdea.trim() || !companyName.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isGenerating ? "Generating Pitch Deck..." : "Generate Pitch Deck"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{pitchDeck.company_name}</h2>
                <p className="text-gray-600 mt-1 italic">{pitchDeck.tagline}</p>
              </div>
              <div className="flex gap-4">
                <ShareButton toolName="Pitch Deck Generator" toolId="pitch-deck-generator" />
                <Button onClick={downloadPitchDeck} variant="outline">
                  Download PDF
                </Button>
                <Button
                  onClick={() => {
                    setPitchDeck(null)
                    setCompanyName("")
                    setBusinessIdea("")
                    setTargetMarket("")
                    setFundingAmount("")
                    setUseOfFunds("")
                    setTraction("")
                    setTeam("")
                  }}
                  variant="outline"
                >
                  Create New Deck
                </Button>
              </div>
            </div>

            {/* Slides */}
            <div className="space-y-6">
              {pitchDeck.slides.map((slide) => (
                <div key={slide.slide_number} className="bg-white rounded-lg p-8 shadow-sm border-l-4 border-gray-900">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Slide {slide.slide_number}: {slide.slide_title}
                    </h3>
                    <span className="text-sm text-gray-500">#{slide.slide_number}</span>
                  </div>

                  <div className="space-y-4">
                    {slide.content.headline && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{slide.content.headline}</h4>
                        {slide.content.subheadline && (
                          <p className="text-gray-600 italic">{slide.content.subheadline}</p>
                        )}
                      </div>
                    )}

                    {slide.content.paragraphs && slide.content.paragraphs.length > 0 && (
                      <div className="space-y-2">
                        {slide.content.paragraphs.map((para, idx) => (
                          <p key={idx} className="text-gray-700 leading-relaxed">{para}</p>
                        ))}
                      </div>
                    )}

                    {slide.content.bullet_points && slide.content.bullet_points.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        {slide.content.bullet_points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}

                    {slide.content.metrics && slide.content.metrics.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {slide.content.metrics.map((metric, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                            <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {slide.content.visual_description && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Visual Suggestion:</p>
                        <p className="text-sm text-blue-800">{slide.content.visual_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {pitchDeck.notes && pitchDeck.notes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Presentation Notes & Tips</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {pitchDeck.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

