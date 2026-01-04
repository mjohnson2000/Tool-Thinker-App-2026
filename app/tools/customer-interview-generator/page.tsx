"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jsPDF } from "jspdf"
import { Mic } from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"

interface CustomerInterviewGuide {
  business_context: {
    business_idea: string
    target_customer: string
    problem_hypothesis: string
  }
  interview_framework: {
    framework_name: string
    framework_description: string
    interview_objectives: string[]
  }
  pre_interview_preparation: {
    ideal_interviewees: string
    how_to_find_interviewees: string[]
    screening_questions: string[]
    interview_incentives: string[]
  }
  interview_questions: {
    opening_questions: string[]
    problem_validation_questions: string[]
    solution_validation_questions: string[]
    jobs_to_be_done_questions: string[]
    pain_point_questions: string[]
    current_solution_questions: string[]
    willingness_to_pay_questions: string[]
    closing_questions: string[]
  }
  interview_script: {
    introduction: string
    main_questions: Array<{
      question: string
      follow_ups: string[]
      what_to_listen_for: string
    }>
    closing: string
  }
  analysis_framework: {
    key_metrics_to_track: string[]
    signals_to_look_for: {
      positive_signals: string[]
      negative_signals: string[]
    }
    analysis_questions: string[]
    synthesis_template: string
  }
  tips_and_best_practices: string[]
}

export default function CustomerInterviewGeneratorPage() {
  const [businessIdea, setBusinessIdea] = useState("")
  const [targetCustomer, setTargetCustomer] = useState("")
  const [problemHypothesis, setProblemHypothesis] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [guide, setGuide] = useState<CustomerInterviewGuide | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generateGuide() {
    if (!businessIdea.trim()) {
      setError("Please describe your business idea")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGuide(null)

    try {
      const response = await fetch("/api/customer-interview-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIdea: businessIdea.trim(),
          targetCustomer: targetCustomer.trim() || undefined,
          problemHypothesis: problemHypothesis.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate interview guide")
      }

      const data = await response.json()
      setGuide(data)
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Failed to generate interview guide. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadGuide() {
    if (!guide) return

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
    addText("Customer Interview Guide", 20, true)
    yPosition += 10

    // Business Context
    addSection("Business Context")
    addText(`Business Idea: ${guide.business_context.business_idea}`, 11)
    if (guide.business_context.target_customer) {
      addText(`Target Customer: ${guide.business_context.target_customer}`, 11)
    }
    if (guide.business_context.problem_hypothesis) {
      addText(`Problem Hypothesis: ${guide.business_context.problem_hypothesis}`, 11)
    }
    yPosition += 5

    // Interview Framework
    addSection(`Interview Framework: ${guide.interview_framework.framework_name}`)
    addText(guide.interview_framework.framework_description, 11)
    yPosition += 3
    addText("Objectives:", 12, true)
    guide.interview_framework.interview_objectives.forEach((obj) => addText(`• ${obj}`, 10))
    yPosition += 5

    // Pre-Interview Preparation
    addSection("Pre-Interview Preparation")
    addText("Ideal Interviewees:", 12, true)
    addText(guide.pre_interview_preparation.ideal_interviewees, 11)
    yPosition += 3
    addText("How to Find Interviewees:", 12, true)
    guide.pre_interview_preparation.how_to_find_interviewees.forEach((method) => addText(`• ${method}`, 10))
    yPosition += 3
    addText("Screening Questions:", 12, true)
    guide.pre_interview_preparation.screening_questions.forEach((q) => addText(`• ${q}`, 10))
    yPosition += 3
    addText("Interview Incentives:", 12, true)
    guide.pre_interview_preparation.interview_incentives.forEach((inc) => addText(`• ${inc}`, 10))
    yPosition += 10

    // Interview Questions
    addSection("Interview Questions")
    const questionCategories = [
      { title: "Opening Questions", questions: guide.interview_questions.opening_questions },
      { title: "Problem Validation", questions: guide.interview_questions.problem_validation_questions },
      { title: "Solution Validation", questions: guide.interview_questions.solution_validation_questions },
      { title: "Jobs-to-be-Done", questions: guide.interview_questions.jobs_to_be_done_questions },
      { title: "Pain Points", questions: guide.interview_questions.pain_point_questions },
      { title: "Current Solutions", questions: guide.interview_questions.current_solution_questions },
      { title: "Willingness to Pay", questions: guide.interview_questions.willingness_to_pay_questions },
      { title: "Closing Questions", questions: guide.interview_questions.closing_questions },
    ]

    questionCategories.forEach((category) => {
      if (category.questions.length > 0) {
        addText(`${category.title}:`, 12, true)
        category.questions.forEach((q) => addText(`• ${q}`, 10))
        yPosition += 3
      }
    })
    yPosition += 5

    // Interview Script
    addSection("Interview Script")
    addText("Introduction:", 12, true)
    addText(guide.interview_script.introduction, 11)
    yPosition += 5
    addText("Main Questions:", 12, true)
    guide.interview_script.main_questions.forEach((item) => {
      addText(`Q: ${item.question}`, 11, true)
      if (item.follow_ups.length > 0) {
        item.follow_ups.forEach((followUp) => addText(`  Follow-up: ${followUp}`, 10))
      }
      addText(`Listen for: ${item.what_to_listen_for}`, 10)
      yPosition += 2
    })
    yPosition += 3
    addText("Closing:", 12, true)
    addText(guide.interview_script.closing, 11)
    yPosition += 10

    // Analysis Framework
    addSection("Analysis Framework")
    addText("Key Metrics to Track:", 12, true)
    guide.analysis_framework.key_metrics_to_track.forEach((metric) => addText(`• ${metric}`, 10))
    yPosition += 3
    addText("Positive Signals:", 12, true)
    guide.analysis_framework.signals_to_look_for.positive_signals.forEach((signal) => addText(`• ${signal}`, 10))
    yPosition += 3
    addText("Negative Signals:", 12, true)
    guide.analysis_framework.signals_to_look_for.negative_signals.forEach((signal) => addText(`• ${signal}`, 10))
    yPosition += 3
    addText("Analysis Questions:", 12, true)
    guide.analysis_framework.analysis_questions.forEach((q) => addText(`• ${q}`, 10))
    yPosition += 3
    addText("Synthesis Template:", 12, true)
    addText(guide.analysis_framework.synthesis_template, 11)
    yPosition += 10

    // Tips
    addSection("Tips & Best Practices")
    guide.tips_and_best_practices.forEach((tip) => addText(`• ${tip}`, 10))

    doc.save(`customer-interview-guide-${Date.now()}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg mx-auto">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Customer Interview Guide Generator</h1>
          <p className="text-xl text-gray-600">
            Create a comprehensive interview guide to validate your business idea with real customers
          </p>
        </div>

        {!guide ? (
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
                <label htmlFor="targetCustomer" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Customer (Optional)
                </label>
                <Textarea
                  id="targetCustomer"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  placeholder="Who is your ideal customer? (e.g., Small business owners, SaaS founders, etc.)"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <label htmlFor="problemHypothesis" className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Hypothesis (Optional)
                </label>
                <Textarea
                  id="problemHypothesis"
                  value={problemHypothesis}
                  onChange={(e) => setProblemHypothesis(e.target.value)}
                  placeholder="What problem do you believe your target customers have?"
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
                onClick={generateGuide}
                disabled={isGenerating || !businessIdea.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isGenerating ? "Generating Interview Guide..." : "Generate Interview Guide"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Customer Interview Guide</h2>
                <p className="text-gray-600 mt-1">Framework: {guide.interview_framework.framework_name}</p>
              </div>
              <div className="flex gap-4">
                <ShareButton toolName="Customer Interview Guide Generator" toolId="customer-interview-generator" />
                <Button onClick={downloadGuide} variant="outline">
                  Download PDF
                </Button>
                <Button
                  onClick={() => {
                    setGuide(null)
                    setBusinessIdea("")
                    setTargetCustomer("")
                    setProblemHypothesis("")
                  }}
                  variant="outline"
                >
                  Create New Guide
                </Button>
              </div>
            </div>

            {/* Interview Framework */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Framework</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.interview_framework.framework_name}</h3>
                  <p className="text-gray-700">{guide.interview_framework.framework_description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Objectives</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.interview_framework.interview_objectives.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pre-Interview Preparation */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Pre-Interview Preparation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ideal Interviewees</h3>
                  <p className="text-gray-700">{guide.pre_interview_preparation.ideal_interviewees}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Find Interviewees</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.pre_interview_preparation.how_to_find_interviewees.map((method, idx) => (
                      <li key={idx}>{method}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Screening Questions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.pre_interview_preparation.screening_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Incentives</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.pre_interview_preparation.interview_incentives.map((inc, idx) => (
                      <li key={idx}>{inc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview Questions */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Opening Questions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.opening_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Problem Validation</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.problem_validation_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Solution Validation</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.solution_validation_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Jobs-to-be-Done</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.jobs_to_be_done_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pain Points</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.pain_point_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Solutions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.current_solution_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Willingness to Pay</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.willingness_to_pay_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Closing Questions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {guide.interview_questions.closing_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview Script */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Interview Script</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Introduction</h3>
                  <p className="text-gray-700 whitespace-pre-line">{guide.interview_script.introduction}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Main Questions</h3>
                  <div className="space-y-4">
                    {guide.interview_script.main_questions.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-gray-300 pl-4">
                        <p className="font-semibold text-gray-900 mb-2">Q: {item.question}</p>
                        {item.follow_ups.length > 0 && (
                          <div className="ml-4 mb-2">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Follow-ups:</p>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                              {item.follow_ups.map((followUp, fIdx) => (
                                <li key={fIdx}>{followUp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 italic">Listen for: {item.what_to_listen_for}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing</h3>
                  <p className="text-gray-700 whitespace-pre-line">{guide.interview_script.closing}</p>
                </div>
              </div>
            </div>

            {/* Analysis Framework */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Analysis Framework</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Metrics to Track</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.analysis_framework.key_metrics_to_track.map((metric, idx) => (
                      <li key={idx}>{metric}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Positive Signals</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    {guide.analysis_framework.signals_to_look_for.positive_signals.map((signal, idx) => (
                      <li key={idx}>{signal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Negative Signals</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {guide.analysis_framework.signals_to_look_for.negative_signals.map((signal, idx) => (
                      <li key={idx}>{signal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Questions</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {guide.analysis_framework.analysis_questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Synthesis Template</h3>
                  <p className="text-gray-700 whitespace-pre-line">{guide.analysis_framework.synthesis_template}</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tips & Best Practices</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {guide.tips_and_best_practices.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <DisclaimerBanner className="mt-8" />
          </div>
        )}
      </div>
    </div>
  )
}

