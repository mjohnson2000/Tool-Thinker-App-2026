"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { Sparkles } from "lucide-react"
import type { AppliedSystemResult, BusinessContext, Platform } from "@/types/marketing"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook", "linkedin", "x", "other"]

export default function MarketingBlueprintPage() {
  const [context, setContext] = useState<Partial<BusinessContext>>({
    brand_name: "",
    offer_summary: "",
    target_customer: "",
    category: "",
    primary_platforms: [],
    proof_assets: [],
    constraints: {},
    current_channels: {},
  })
  
  const [proofAsset, setProofAsset] = useState("")
  const [constraintKey, setConstraintKey] = useState("")
  const [constraintValue, setConstraintValue] = useState("")
  const [channelKey, setChannelKey] = useState("")
  const [channelValue, setChannelValue] = useState("")
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<AppliedSystemResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function addProofAsset() {
    if (proofAsset.trim()) {
      setContext(prev => ({
        ...prev,
        proof_assets: [...(prev.proof_assets || []), proofAsset.trim()]
      }))
      setProofAsset("")
    }
  }

  function removeProofAsset(index: number) {
    setContext(prev => ({
      ...prev,
      proof_assets: prev.proof_assets?.filter((_, i) => i !== index) || []
    }))
  }

  function addConstraint() {
    if (constraintKey.trim() && constraintValue.trim()) {
      setContext(prev => ({
        ...prev,
        constraints: {
          ...(prev.constraints || {}),
          [constraintKey.trim()]: constraintValue.trim()
        }
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
          [channelKey.trim()]: channelValue.trim()
        }
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

  function togglePlatform(platform: Platform) {
    setContext(prev => {
      const current = prev.primary_platforms || []
      const updated = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
      return { ...prev, primary_platforms: updated }
    })
  }

  async function generateBlueprint() {
    if (!context.brand_name?.trim() || !context.offer_summary?.trim() || !context.target_customer?.trim()) {
      setError("Please fill in brand name, offer summary, and target customer")
      return
    }

    if (!context.primary_platforms || context.primary_platforms.length === 0) {
      setError("Please select at least one primary platform")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/marketing-blueprint/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: context as BusinessContext }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate marketing blueprint")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate marketing blueprint. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadPDF() {
    if (!result) return

    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(20)
    doc.text("Marketing Blueprint", 20, yPos)
    yPos += 10

    // Brand Info
    doc.setFontSize(14)
    doc.text(`Brand: ${result.system.context.brand_name}`, 20, yPos)
    yPos += 7
    doc.text(`Offer: ${result.system.context.offer_summary}`, 20, yPos)
    yPos += 7
    doc.text(`Target: ${result.system.context.target_customer}`, 20, yPos)
    yPos += 10

    // Messaging Strategy
    doc.setFontSize(16)
    doc.text("Messaging Strategy", 20, yPos)
    yPos += 7
    doc.setFontSize(12)
    doc.text(`Core Message: ${result.system.messaging.core_message}`, 20, yPos)
    yPos += 7
    doc.text(`Differentiation: ${result.system.messaging.differentiation}`, 20, yPos)
    yPos += 10

    // Attention Hooks
    doc.setFontSize(16)
    doc.text("Attention Hooks", 20, yPos)
    yPos += 7
    doc.setFontSize(12)
    result.system.attention_hooks.forEach((hook, i) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`Hook ${i + 1}: ${hook.hook_promise}`, 20, yPos)
      yPos += 5
      doc.text(`Mechanic: ${hook.hook_mechanic}`, 25, yPos)
      yPos += 7
    })
    yPos += 5

    // Format Library
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.setFontSize(16)
    doc.text("Content Formats", 20, yPos)
    yPos += 7
    doc.setFontSize(12)
    result.system.format_library.forEach((format, i) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`${format.format_name}`, 20, yPos)
      yPos += 5
      doc.text(`Why it works: ${format.why_it_works}`, 25, yPos)
      yPos += 7
    })

    doc.save(`marketing-blueprint-${result.system.context.brand_name}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marketing Blueprint Generator</h1>
          <p className="text-xl text-gray-600">
            Create a complete "Attention-to-Scale" marketing system based on the proven Facebook Ads Blueprint
          </p>
        </div>

        {!result ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Business Context</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <Input
                  value={context.brand_name || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="Your brand or project name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Summary *
                </label>
                <Textarea
                  value={context.offer_summary || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, offer_summary: e.target.value }))}
                  placeholder="What you sell + the outcome it creates (e.g., 'AI-powered business model generator that helps founders validate ideas in minutes')"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Customer *
                </label>
                <Textarea
                  value={context.target_customer || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, target_customer: e.target.value }))}
                  placeholder="Who this is for in plain language (e.g., 'Early-stage founders who feel stuck and unsure what to do next')"
                  rows={2}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <Input
                  value={context.category || ""}
                  onChange={(e) => setContext(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Market category / niche (e.g., 'SaaS', 'E-commerce', 'Education')"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Platforms * (Select at least one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        context.primary_platforms?.includes(platform)
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

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
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md text-sm"
                      >
                        {asset}
                        <button
                          type="button"
                          onClick={() => removeProofAsset(i)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraints (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={constraintKey}
                    onChange={(e) => setConstraintKey(e.target.value)}
                    placeholder="Constraint type (e.g., 'Budget', 'Team Size')"
                    className="flex-1"
                  />
                  <Input
                    value={constraintValue}
                    onChange={(e) => setConstraintValue(e.target.value)}
                    placeholder="Value (e.g., '$500/month', '2 people')"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addConstraint()}
                  />
                  <Button type="button" onClick={addConstraint} variant="outline">
                    Add
                  </Button>
                </div>
                {context.constraints && Object.keys(context.constraints).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(context.constraints).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md">
                        <span className="text-sm"><strong>{key}:</strong> {value}</span>
                        <button
                          type="button"
                          onClick={() => removeConstraint(key)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Channels (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={channelKey}
                    onChange={(e) => setChannelKey(e.target.value)}
                    placeholder="Channel (e.g., 'Instagram', 'YouTube')"
                    className="flex-1"
                  />
                  <Input
                    value={channelValue}
                    onChange={(e) => setChannelValue(e.target.value)}
                    placeholder="Notes (e.g., '2k followers', 'new channel')"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addChannel()}
                  />
                  <Button type="button" onClick={addChannel} variant="outline">
                    Add
                  </Button>
                </div>
                {context.current_channels && Object.keys(context.current_channels).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(context.current_channels).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md">
                        <span className="text-sm"><strong>{key}:</strong> {value}</span>
                        <button
                          type="button"
                          onClick={() => removeChannel(key)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </div>
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
                onClick={generateBlueprint}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? "Generating Marketing Blueprint..." : "Generate Marketing Blueprint"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Your Marketing Blueprint</h2>
                  <p className="text-gray-600">{result.system.context.brand_name}</p>
                </div>
                <div className="flex gap-2">
                  <ShareButton toolName="Marketing Blueprint" toolId="marketing-blueprint" />
                  <Button onClick={downloadPDF} variant="outline">
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Messaging Strategy */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Messaging Strategy</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Core Message</h4>
                    <p className="text-gray-700">{result.system.messaging.core_message}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Differentiation</h4>
                    <p className="text-gray-700">{result.system.messaging.differentiation}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Audience Desire Image</h4>
                    <p className="text-gray-700">{result.system.messaging.audience_desire_image}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Hook Angles</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {result.system.messaging.attention_hook_angles.map((angle, i) => (
                        <li key={i}>{angle}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Attention Hooks */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Attention Hooks</h3>
                <div className="space-y-4">
                  {result.system.attention_hooks.map((hook, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Hook {i + 1}: {hook.hook_promise}</h4>
                      <p className="text-sm text-gray-600 mb-2"><strong>Mechanic:</strong> {hook.hook_mechanic}</p>
                      <div>
                        <strong className="text-sm text-gray-700">Opening Structure:</strong>
                        <ol className="list-decimal list-inside text-sm text-gray-700 ml-2">
                          {hook.opening_structure.map((beat, j) => (
                            <li key={j}>{beat}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Content Formats */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Content Format Library</h3>
                <div className="space-y-4">
                  {result.system.format_library.map((format, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{format.format_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{format.why_it_works}</p>
                      <div className="mb-2">
                        <strong className="text-sm text-gray-700">Required Beats:</strong>
                        <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
                          {format.required_beats.map((beat, j) => (
                            <li key={j}>{beat}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">Platforms: {format.platform_fit.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Performance Drivers */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Performance Drivers</h3>
                <div className="space-y-3">
                  {result.system.performance_drivers.map((driver, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{driver.driver_name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          driver.observed_effect === "up" ? "bg-green-100 text-green-800" :
                          driver.observed_effect === "down" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {driver.observed_effect}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>How to Improve:</strong>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {driver.how_to_improve.map((tip, j) => (
                            <li key={j}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Prioritized Actions */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Prioritized Next Actions</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {result.prioritized_next_actions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ol>
              </section>

              {/* Test Matrix */}
              {result.test_matrix && result.test_matrix.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Test Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Variant</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Change</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Metric</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.test_matrix.map((test, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-4 py-2 text-sm text-gray-700">{test.variant || "N/A"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{test.change || "N/A"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{test.metric || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <div className="flex gap-4">
                <Button onClick={() => setResult(null)} variant="outline" className="flex-1">
                  Generate New Blueprint
                </Button>
                <Button onClick={downloadPDF} className="flex-1">
                  Download PDF
                </Button>
              </div>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

