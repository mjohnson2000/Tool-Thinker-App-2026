"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { Megaphone, Sparkles } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

interface BusinessContext {
  brand_name: string
  offer_summary: string
  target_customer: string
  category?: string
  primary_platforms: string[]
  proof_assets?: string[]
  constraints?: Record<string, string>
  current_channels?: Record<string, string>
  landing_pages?: string[]
  available_assets?: string[]
  campaign_goal?: string
  budget_range?: string
}

export default function FacebookAdsGeneratorPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = searchParams.get("projectId")
  
  const [context, setContext] = useState<Partial<BusinessContext>>({
    brand_name: "",
    offer_summary: "",
    target_customer: "",
    category: "",
    primary_platforms: ["facebook", "instagram"],
    proof_assets: [],
    constraints: {},
    current_channels: {},
    landing_pages: [],
    available_assets: [],
    campaign_goal: "",
    budget_range: "",
  })

  const [proofAsset, setProofAsset] = useState("")
  const [constraintKey, setConstraintKey] = useState("")
  const [constraintValue, setConstraintValue] = useState("")
  const [channelKey, setChannelKey] = useState("")
  const [channelValue, setChannelValue] = useState("")
  const [landingPage, setLandingPage] = useState("")
  const [availableAsset, setAvailableAsset] = useState("")

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
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
        if (extracted.companyName) {
          setContext(prev => ({ ...prev, brand_name: extracted.companyName }))
        }
        if (extracted.valueProposition) {
          setContext(prev => ({ ...prev, offer_summary: extracted.valueProposition }))
        }
        if (extracted.targetMarket) {
          setContext(prev => ({ ...prev, target_customer: extracted.targetMarket }))
        }
        
        setProjectLoaded(true)
      }
    } catch (error) {
      console.error("Failed to load project data:", error)
    } finally {
      setLoadingProject(false)
    }
  }

  const PLATFORMS = ["facebook", "instagram", "messenger", "audience_network"]

  function addProofAsset() {
    if (proofAsset.trim()) {
      setContext(prev => ({
        ...prev,
        proof_assets: [...(prev.proof_assets || []), proofAsset.trim()],
      }))
      setProofAsset("")
    }
  }

  function removeProofAsset(index: number) {
    setContext(prev => ({
      ...prev,
      proof_assets: prev.proof_assets?.filter((_, i) => i !== index) || [],
    }))
  }

  function addConstraint() {
    if (constraintKey.trim() && constraintValue.trim()) {
      setContext(prev => ({
        ...prev,
        constraints: {
          ...(prev.constraints || {}),
          [constraintKey.trim()]: constraintValue.trim(),
        },
      }))
      setConstraintKey("")
      setConstraintValue("")
    }
  }

  function removeConstraint(key: string) {
    setContext(prev => {
      const newConstraints = { ...(prev.constraints || {}) }
      delete newConstraints[key]
      return { ...prev, constraints: newConstraints }
    })
  }

  function addChannel() {
    if (channelKey.trim() && channelValue.trim()) {
      setContext(prev => ({
        ...prev,
        current_channels: {
          ...(prev.current_channels || {}),
          [channelKey.trim()]: channelValue.trim(),
        },
      }))
      setChannelKey("")
      setChannelValue("")
    }
  }

  function removeChannel(key: string) {
    setContext(prev => {
      const newChannels = { ...(prev.current_channels || {}) }
      delete newChannels[key]
      return { ...prev, current_channels: newChannels }
    })
  }

  function addLandingPage() {
    if (landingPage.trim()) {
      setContext(prev => ({
        ...prev,
        landing_pages: [...(prev.landing_pages || []), landingPage.trim()],
      }))
      setLandingPage("")
    }
  }

  function removeLandingPage(index: number) {
    setContext(prev => ({
      ...prev,
      landing_pages: prev.landing_pages?.filter((_, i) => i !== index) || [],
    }))
  }

  function addAvailableAsset() {
    if (availableAsset.trim()) {
      setContext(prev => ({
        ...prev,
        available_assets: [...(prev.available_assets || []), availableAsset.trim()],
      }))
      setAvailableAsset("")
    }
  }

  function removeAvailableAsset(index: number) {
    setContext(prev => ({
      ...prev,
      available_assets: prev.available_assets?.filter((_, i) => i !== index) || [],
    }))
  }

  function togglePlatform(platform: string) {
    setContext(prev => {
      const current = prev.primary_platforms || []
      const updated = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
      return { ...prev, primary_platforms: updated }
    })
  }

  async function generateAdsSystem() {
    if (!context.brand_name?.trim() || !context.offer_summary?.trim() || !context.target_customer?.trim()) {
      setError("Please fill in Brand Name, Offer Summary, and Target Customer")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/facebook-ads-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context as BusinessContext }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate ads system")
      }

      const data = await response.json()
      setResult(data.response)
    } catch (error: any) {
      setError(error.message || "Failed to generate Facebook Ads system")
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
    doc.text("Facebook/Instagram Ads System", margin, yPos)
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

    doc.save(`facebook-ads-system-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
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
        
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Facebook/Instagram Ads Generator" toolId="facebook-ads-generator" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Megaphone className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Facebook/Instagram Ads Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create a complete attention-first advertising system optimized for Facebook and Instagram
          </p>
        </div>

        {!result ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="space-y-6">
              {/* Required Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={context.brand_name || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="Your brand or company name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Summary <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={context.offer_summary || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, offer_summary: e.target.value }))}
                  placeholder="What you sell + the outcome it creates"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Customer <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={context.target_customer || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, target_customer: e.target.value }))}
                  placeholder="Who this is for (plain language)"
                  rows={2}
                  className="w-full"
                />
              </div>

              {/* Optional Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <Input
                  value={context.category || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Market category / niche"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Platforms
                </label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        context.primary_platforms?.includes(platform)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1).replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Goal (Optional)
                </label>
                <Input
                  value={context.campaign_goal || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, campaign_goal: e.target.value }))}
                  placeholder="e.g., leads, book sales, tool signups"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional)
                </label>
                <Input
                  value={context.budget_range || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, budget_range: e.target.value }))}
                  placeholder="e.g., $500-1000/month"
                  className="w-full"
                />
              </div>

              {/* Proof Assets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof Assets (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={proofAsset}
                    onChange={(e) => setProofAsset(e.target.value)}
                    placeholder="Case studies, demos, testimonials, stats"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addProofAsset()}
                  />
                  <Button type="button" onClick={addProofAsset} variant="outline">
                    Add
                  </Button>
                </div>
                {context.proof_assets && context.proof_assets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {context.proof_assets.map((asset, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {asset}
                        <button
                          type="button"
                          onClick={() => removeProofAsset(i)}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Landing Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landing Pages (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={landingPage}
                    onChange={(e) => setLandingPage(e.target.value)}
                    placeholder="URL of landing page"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addLandingPage()}
                  />
                  <Button type="button" onClick={addLandingPage} variant="outline">
                    Add
                  </Button>
                </div>
                {context.landing_pages && context.landing_pages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {context.landing_pages.map((page, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {page}
                        <button
                          type="button"
                          onClick={() => removeLandingPage(i)}
                          className="text-green-700 hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Assets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Assets (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={availableAsset}
                    onChange={(e) => setAvailableAsset(e.target.value)}
                    placeholder="Logos, screenshots, testimonials, videos"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addAvailableAsset()}
                  />
                  <Button type="button" onClick={addAvailableAsset} variant="outline">
                    Add
                  </Button>
                </div>
                {context.available_assets && context.available_assets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {context.available_assets.map((asset, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {asset}
                        <button
                          type="button"
                          onClick={() => removeAvailableAsset(i)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraints (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={constraintKey}
                    onChange={(e) => setConstraintKey(e.target.value)}
                    placeholder="Constraint name (e.g., budget, team size)"
                    className="flex-1"
                  />
                  <Input
                    value={constraintValue}
                    onChange={(e) => setConstraintValue(e.target.value)}
                    placeholder="Constraint value"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addConstraint()}
                  />
                  <Button type="button" onClick={addConstraint} variant="outline">
                    Add
                  </Button>
                </div>
                {context.constraints && Object.keys(context.constraints).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(context.constraints).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {key}: {value}
                        <button
                          type="button"
                          onClick={() => removeConstraint(key)}
                          className="text-amber-700 hover:text-amber-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Channels (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={channelKey}
                    onChange={(e) => setChannelKey(e.target.value)}
                    placeholder="Channel (e.g., IG, YT)"
                    className="flex-1"
                  />
                  <Input
                    value={channelValue}
                    onChange={(e) => setChannelValue(e.target.value)}
                    placeholder="Notes (e.g., 2k followers)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addChannel()}
                  />
                  <Button type="button" onClick={addChannel} variant="outline">
                    Add
                  </Button>
                </div>
                {context.current_channels && Object.keys(context.current_channels).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(context.current_channels).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {key}: {value}
                        <button
                          type="button"
                          onClick={() => removeChannel(key)}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={generateAdsSystem}
                disabled={isGenerating || !context.brand_name?.trim() || !context.offer_summary?.trim() || !context.target_customer?.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg font-semibold"
              >
                {isGenerating ? "Generating Ads System..." : "Generate Facebook/Instagram Ads System"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Facebook/Instagram Ads System</h2>
                  <p className="text-gray-600">Brand: {context.brand_name}</p>
                </div>
                <div className="flex gap-2">
                  <ShareButton toolName="Facebook/Instagram Ads Generator" toolId="facebook-ads-generator" />
                  <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-x-auto">
                  {result}
                </pre>
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
              Generate New System
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

