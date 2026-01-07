"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { Search, Sparkles } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

interface CompetitorAnalysis {
  business_context: {
    business_idea: string
    target_market: string
    value_proposition: string
  }
  competitor_identification: {
    direct_competitors: Array<{
      name: string
      description: string
      strengths: string[]
      weaknesses: string[]
      market_position: string
    }>
    indirect_competitors: Array<{
      name: string
      description: string
      why_competitor: string
    }>
    alternative_solutions: string[]
  }
  competitive_landscape: {
    market_overview: string
    market_share_analysis: string
    competitive_intensity: string
    barriers_to_entry: string
  }
  competitive_positioning: {
    positioning_statement: string
    differentiation_factors: Array<{
      factor: string
      description: string
      competitive_advantage: string
    }>
    unique_value_proposition: string
  }
  competitive_matrix: {
    comparison_factors: string[]
    competitors: Array<{
      name: string
      scores: Array<{
        factor: string
        score: number
        notes: string
      }>
      overall_score: number
    }>
  }
  swot_analysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  strategic_recommendations: {
    positioning_strategy: string
    competitive_advantages_to_leverage: string[]
    weaknesses_to_address: string[]
    market_opportunities: string[]
    defensive_strategies: string[]
  }
}

export default function CompetitorAnalysisPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = searchParams.get("projectId")
  
  const [businessIdea, setBusinessIdea] = useState("")
  const [targetMarket, setTargetMarket] = useState("")
  const [valueProposition, setValueProposition] = useState("")
  const [knownCompetitors, setKnownCompetitors] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null)
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
        if (extracted.businessIdea) setBusinessIdea(extracted.businessIdea)
        if (extracted.targetMarket) setTargetMarket(extracted.targetMarket)
        if (extracted.valueProposition) setValueProposition(extracted.valueProposition)
        
        setProjectLoaded(true)
      }
    } catch (error) {
      console.error("Failed to load project data:", error)
    } finally {
      setLoadingProject(false)
    }
  }

  async function generateAnalysis() {
    if (!businessIdea.trim()) {
      setError("Please describe your business idea")
      return
    }

    setIsGenerating(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/competitor-analysis/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIdea: businessIdea.trim(),
          targetMarket: targetMarket.trim() || undefined,
          valueProposition: valueProposition.trim() || undefined,
          knownCompetitors: knownCompetitors.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate competitor analysis")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate competitor analysis. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadAnalysis() {
    if (!analysis) return

    const doc = new jsPDF()
    const margin = 20
    const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin
    let yPosition = margin

    function addText(text: string, fontSize: number, isBold: boolean = false) {
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont("helvetica", "bold")
      } else {
        doc.setFont("helvetica", "normal")
      }
      
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += fontSize * 0.4
      })
      yPosition += 5
    }

    function addSection(title: string) {
      if (yPosition > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        yPosition = margin
      }
      addText(title, 16, true)
      yPosition += 3
    }

    // Title
    addText("Competitor Analysis", 20, true)
    yPosition += 10

    // Business Context
    addSection("Business Context")
    addText(`Business Idea: ${analysis.business_context.business_idea}`, 11)
    if (analysis.business_context.target_market) {
      addText(`Target Market: ${analysis.business_context.target_market}`, 11)
    }
    if (analysis.business_context.value_proposition) {
      addText(`Value Proposition: ${analysis.business_context.value_proposition}`, 11)
    }
    yPosition += 10

    // Competitor Identification
    addSection("Competitor Identification")
    addText("Direct Competitors:", 12, true)
    analysis.competitor_identification.direct_competitors.forEach((comp) => {
      addText(`${comp.name} - ${comp.description}`, 11, true)
      addText(`Market Position: ${comp.market_position}`, 10)
      addText("Strengths:", 10, true)
      comp.strengths.forEach((s) => addText(`  • ${s}`, 9))
      addText("Weaknesses:", 10, true)
      comp.weaknesses.forEach((w) => addText(`  • ${w}`, 9))
      yPosition += 3
    })
    yPosition += 3
    addText("Indirect Competitors:", 12, true)
    analysis.competitor_identification.indirect_competitors.forEach((comp) => {
      addText(`${comp.name} - ${comp.description}`, 11, true)
      addText(`Why Competitor: ${comp.why_competitor}`, 10)
      yPosition += 2
    })
    yPosition += 3
    addText("Alternative Solutions:", 12, true)
    analysis.competitor_identification.alternative_solutions.forEach((sol) => addText(`• ${sol}`, 10))
    yPosition += 10

    // Competitive Landscape
    addSection("Competitive Landscape")
    addText(analysis.competitive_landscape.market_overview, 11)
    yPosition += 3
    addText("Market Share Analysis:", 12, true)
    addText(analysis.competitive_landscape.market_share_analysis, 11)
    yPosition += 3
    addText("Competitive Intensity:", 12, true)
    addText(analysis.competitive_landscape.competitive_intensity, 11)
    yPosition += 3
    addText("Barriers to Entry:", 12, true)
    addText(analysis.competitive_landscape.barriers_to_entry, 11)
    yPosition += 10

    // Competitive Positioning
    addSection("Competitive Positioning")
    addText("Positioning Statement:", 12, true)
    addText(analysis.competitive_positioning.positioning_statement, 11)
    yPosition += 3
    addText("Differentiation Factors:", 12, true)
    analysis.competitive_positioning.differentiation_factors.forEach((factor) => {
      addText(`${factor.factor}: ${factor.description}`, 11, true)
      addText(`Competitive Advantage: ${factor.competitive_advantage}`, 10)
      yPosition += 2
    })
    yPosition += 3
    addText("Unique Value Proposition:", 12, true)
    addText(analysis.competitive_positioning.unique_value_proposition, 11)
    yPosition += 10

    // Competitive Matrix
    addSection("Competitive Matrix")
    addText("Comparison Factors: " + analysis.competitive_matrix.comparison_factors.join(", "), 11)
    yPosition += 3
    analysis.competitive_matrix.competitors.forEach((comp) => {
      addText(`${comp.name} (Overall Score: ${comp.overall_score}/10)`, 11, true)
      comp.scores.forEach((score) => {
        addText(`  ${score.factor}: ${score.score}/10 - ${score.notes}`, 10)
      })
      yPosition += 2
    })
    yPosition += 10

    // SWOT Analysis
    addSection("SWOT Analysis")
    addText("Strengths:", 12, true)
    analysis.swot_analysis.strengths.forEach((s) => addText(`• ${s}`, 10))
    yPosition += 3
    addText("Weaknesses:", 12, true)
    analysis.swot_analysis.weaknesses.forEach((w) => addText(`• ${w}`, 10))
    yPosition += 3
    addText("Opportunities:", 12, true)
    analysis.swot_analysis.opportunities.forEach((o) => addText(`• ${o}`, 10))
    yPosition += 3
    addText("Threats:", 12, true)
    analysis.swot_analysis.threats.forEach((t) => addText(`• ${t}`, 10))
    yPosition += 10

    // Strategic Recommendations
    addSection("Strategic Recommendations")
    addText("Positioning Strategy:", 12, true)
    addText(analysis.strategic_recommendations.positioning_strategy, 11)
    yPosition += 3
    addText("Competitive Advantages to Leverage:", 12, true)
    analysis.strategic_recommendations.competitive_advantages_to_leverage.forEach((a) => addText(`• ${a}`, 10))
    yPosition += 3
    addText("Weaknesses to Address:", 12, true)
    analysis.strategic_recommendations.weaknesses_to_address.forEach((w) => addText(`• ${w}`, 10))
    yPosition += 3
    addText("Market Opportunities:", 12, true)
    analysis.strategic_recommendations.market_opportunities.forEach((o) => addText(`• ${o}`, 10))
    yPosition += 3
    addText("Defensive Strategies:", 12, true)
    analysis.strategic_recommendations.defensive_strategies.forEach((s) => addText(`• ${s}`, 10))

    doc.save(`competitor-analysis-${Date.now()}.pdf`)
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
            <ShareButton toolName="Competitor Analysis Tool" toolId="competitor-analysis" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Competitor Analysis Tool</h1>
          <p className="text-xl text-gray-600">
            Analyze your competitive landscape and identify positioning opportunities
          </p>
        </div>

        {!analysis ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="businessIdea" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Idea / Solution *
                </label>
                <Textarea
                  id="businessIdea"
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="Describe your business idea and the solution you're building..."
                  rows={6}
                  className="resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  What problem are you solving and how?
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
                  placeholder="Who is your target customer? What market are you addressing?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="valueProposition" className="block text-sm font-medium text-gray-700 mb-2">
                  Value Proposition (Optional)
                </label>
                <Textarea
                  id="valueProposition"
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  placeholder="What unique value do you provide to customers?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="knownCompetitors" className="block text-sm font-medium text-gray-700 mb-2">
                  Known Competitors (Optional)
                </label>
                <Input
                  id="knownCompetitors"
                  value={knownCompetitors}
                  onChange={(e) => setKnownCompetitors(e.target.value)}
                  placeholder="e.g., Competitor A, Competitor B, Competitor C"
                />
                <p className="mt-2 text-sm text-gray-500">
                  List any competitors you're already aware of (comma-separated)
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={generateAnalysis}
                disabled={isGenerating || !businessIdea.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isGenerating ? "Generating Analysis..." : "Generate Competitor Analysis"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Competitor Analysis</h2>
                <p className="text-gray-600 mt-1">{analysis.business_context.business_idea}</p>
              </div>
              <div className="flex gap-4">
                <ShareButton toolName="Competitor Analysis Tool" toolId="competitor-analysis" />
                <Button onClick={downloadAnalysis} variant="outline">
                  Download PDF
                </Button>
                <Button
                  onClick={() => {
                    setAnalysis(null)
                    setBusinessIdea("")
                    setTargetMarket("")
                    setValueProposition("")
                    setKnownCompetitors("")
                  }}
                  variant="outline"
                >
                  Create New Analysis
                </Button>
              </div>
            </div>

            {/* Competitive Positioning */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitive Positioning</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Positioning Statement</h3>
                  <p className="text-gray-700">{analysis.competitive_positioning.positioning_statement}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unique Value Proposition</h3>
                  <p className="text-gray-700">{analysis.competitive_positioning.unique_value_proposition}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Differentiation Factors</h3>
                  <div className="space-y-3">
                    {analysis.competitive_positioning.differentiation_factors.map((factor, idx) => (
                      <div key={idx} className="border-l-4 border-gray-900 pl-4">
                        <h4 className="font-semibold text-gray-900">{factor.factor}</h4>
                        <p className="text-gray-700 text-sm mt-1">{factor.description}</p>
                        <p className="text-gray-600 text-sm mt-1 italic">Competitive Advantage: {factor.competitive_advantage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Identification */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitor Identification</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct Competitors</h3>
                  <div className="space-y-4">
                    {analysis.competitor_identification.direct_competitors.map((comp, idx) => (
                      <div key={idx} className="border-l-4 border-red-500 pl-4 bg-red-50 rounded-r-lg p-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{comp.name}</h4>
                        <p className="text-gray-700 mb-3">{comp.description}</p>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Market Position: {comp.market_position}</p>
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm font-semibold text-green-700 mb-1">Strengths:</p>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {comp.strengths.map((s, sIdx) => (
                                <li key={sIdx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-red-700 mb-1">Weaknesses:</p>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {comp.weaknesses.map((w, wIdx) => (
                                <li key={wIdx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Indirect Competitors</h3>
                  <div className="space-y-3">
                    {analysis.competitor_identification.indirect_competitors.map((comp, idx) => (
                      <div key={idx} className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 rounded-r-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{comp.name}</h4>
                        <p className="text-sm text-gray-700 mb-2">{comp.description}</p>
                        <p className="text-sm text-gray-600 italic">Why Competitor: {comp.why_competitor}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Alternative Solutions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.competitor_identification.alternative_solutions.map((sol, idx) => (
                      <li key={idx}>{sol}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Competitive Landscape */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitive Landscape</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Overview</h3>
                  <p className="text-gray-700 whitespace-pre-line">{analysis.competitive_landscape.market_overview}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Share Analysis</h3>
                  <p className="text-gray-700">{analysis.competitive_landscape.market_share_analysis}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Intensity</h3>
                  <p className="text-gray-700">{analysis.competitive_landscape.competitive_intensity}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Barriers to Entry</h3>
                  <p className="text-gray-700">{analysis.competitive_landscape.barriers_to_entry}</p>
                </div>
              </div>
            </div>

            {/* Competitive Matrix */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Competitive Matrix</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competitor</th>
                      {analysis.competitive_matrix.comparison_factors.map((factor, idx) => (
                        <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{factor}</th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.competitive_matrix.competitors.map((comp, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{comp.name}</td>
                        {comp.scores.map((score, sIdx) => (
                          <td key={sIdx} className="px-4 py-3 text-sm text-gray-700">
                            <div className="font-semibold">{score.score}/10</div>
                            <div className="text-xs text-gray-500 mt-1">{score.notes}</div>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{comp.overall_score}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SWOT Analysis */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">SWOT Analysis</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Strengths</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.swot_analysis.strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Weaknesses</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.swot_analysis.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Opportunities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.swot_analysis.opportunities.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Threats</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.swot_analysis.threats.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Strategic Recommendations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Positioning Strategy</h3>
                  <p className="text-gray-700 whitespace-pre-line">{analysis.strategic_recommendations.positioning_strategy}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Advantages to Leverage</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.strategic_recommendations.competitive_advantages_to_leverage.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Weaknesses to Address</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.strategic_recommendations.weaknesses_to_address.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Opportunities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.strategic_recommendations.market_opportunities.map((o, idx) => (
                      <li key={idx}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Defensive Strategies</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysis.strategic_recommendations.defensive_strategies.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

