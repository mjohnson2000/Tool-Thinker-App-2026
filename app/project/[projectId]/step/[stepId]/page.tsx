"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { StepShell } from "@/components/StepShell"
import { QuestionForm } from "@/components/QuestionForm"
import { OutputEditor } from "@/components/OutputEditor"
import { FeedbackForm } from "@/components/FeedbackForm"
import { ToolRecommendationCard } from "@/components/ToolRecommendationCard"
import { LinkedToolOutputs } from "@/components/LinkedToolOutputs"
import { Button } from "@/components/ui/button"
import { getFramework, getNextStep, getPreviousStep, FRAMEWORK_ORDER } from "@/lib/frameworks"
import { getToolRecommendations } from "@/lib/tool-guidance/mapping"
import type { Framework } from "@/types/frameworks"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { AlertModal } from "@/components/ui/modal"
import { RetryButton } from "@/components/ui/retry-button"
import { CheckCircle2, Clock, CheckCircle, X, Save, AlertCircle, Loader2 } from "lucide-react"

export default function StepPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.projectId as string
  const stepId = params.stepId as string

  const [framework, setFramework] = useState<Framework | null>(null)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [output, setOutput] = useState<Record<string, any> | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<any>(null)
  const [linkedToolIds, setLinkedToolIds] = useState<Set<string>>(new Set())
  const [projectSource, setProjectSource] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showCompletionBanner, setShowCompletionBanner] = useState(false)
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type?: "success" | "error" | "warning" | "info" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    // Redirect if projectId is undefined
    if (!projectId || projectId === "undefined") {
      router.push("/tools/startup-plan-generator")
      return
    }
    
    if (stepId) {
      checkStepAccess()
      loadStep()
      loadCompletedSteps()
      if (user) {
        loadLinkedTools()
        checkProjectSource()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, projectId, user])

  async function loadStep() {
    if (!projectId || projectId === "undefined") {
      router.push("/tools/startup-plan-generator")
      return
    }
    
    try {
      const frameworkData = getFramework(stepId)
      if (!frameworkData) {
        console.error("Framework not found for step:", stepId)
        setLoading(false)
        router.push(`/project/${projectId}/overview`)
        return
      }
      setFramework(frameworkData)

      // Load existing step data using GET to retrieve saved inputs
      const res = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("API error:", errorData)
        // Don't redirect on API error, just show empty state
        setStep(null)
        setInputs({})
        setOutput(null)
      } else {
        const data = await res.json()
        setStep(data.step)
        setInputs(data.inputs || {})
        setOutput(data.output)
      }
    } catch (error) {
      console.error("Failed to load step:", error)
      // Don't redirect on error, just show empty state
      setFramework(null)
      setStep(null)
      setInputs({})
      setOutput(null)
    } finally {
      setLoading(false)
    }
  }

  async function checkStepAccess() {
    if (!projectId || projectId === "undefined" || !stepId) {
      return
    }

    // Find current step index
    const currentStepIndex = FRAMEWORK_ORDER.indexOf(stepId)
    if (currentStepIndex === -1 || currentStepIndex === 0) {
      // First step or invalid step - always allow
      return
    }

    // Check if previous step is completed
    const previousStepKey = FRAMEWORK_ORDER[currentStepIndex - 1]
    try {
      const res = await fetch(`/api/steps?projectId=${projectId}&stepKey=${previousStepKey}`)
      if (res.ok) {
        const data = await res.json()
        if (data.step?.status !== "completed") {
          // Previous step not completed - redirect to overview with message
          const previousFramework = getFramework(previousStepKey)
          router.push(`/project/${projectId}/overview?locked=true&step=${stepId}&required=${previousStepKey}&requiredName=${encodeURIComponent(previousFramework?.title || previousStepKey)}`)
          return
        }
      } else {
        // Previous step doesn't exist or not started - redirect
        const previousFramework = getFramework(previousStepKey)
        router.push(`/project/${projectId}/overview?locked=true&step=${stepId}&required=${previousStepKey}&requiredName=${encodeURIComponent(previousFramework?.title || previousStepKey)}`)
        return
      }
    } catch (error) {
      // On error, allow access (fail open)
      console.error("Error checking step access:", error)
    }
  }

  async function loadCompletedSteps() {
    if (!projectId || projectId === "undefined") {
      return
    }
    
    // Load all step statuses to show progress
    const completed: string[] = []
    for (const stepKey of FRAMEWORK_ORDER) {
      try {
        const res = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepKey}`)
        if (res.ok) {
          const data = await res.json()
          if (data.step?.status === "completed") {
            completed.push(stepKey)
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
    setCompletedSteps(completed)
  }

  async function loadLinkedTools() {
    if (!projectId || projectId === "undefined" || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) return

      const res = await fetch(`/api/projects/${projectId}/tool-outputs`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const toolIds = new Set<string>()
        
        // Get all tool IDs that are linked to this project
        data.references?.forEach((ref: any) => {
          if (ref.tool_id) {
            toolIds.add(ref.tool_id)
          }
        })
        
        setLinkedToolIds(toolIds)
      }
    } catch (error) {
      console.error("Failed to load linked tools:", error)
    }
  }

  async function checkProjectSource() {
    if (!projectId || projectId === "undefined" || !user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) return

      // Check events table for project creation source
      const { data: events, error } = await supabase
        .from("events")
        .select("payload")
        .eq("project_id", projectId)
        .eq("event_type", "project_created")
        .limit(1)
        .maybeSingle()

      if (!error && events?.payload?.source === "idea_discovery") {
        setProjectSource("idea_discovery")
      }
    } catch (error) {
      // Ignore errors - this is optional
    }
  }

  async function saveInputs(newInputs: Record<string, any>) {
    if (!projectId || projectId === "undefined") {
      return
    }
    
    setInputs(newInputs)
    setSaveStatus("saving")
    
    try {
      const res = await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stepKey: stepId, inputs: newInputs }),
      })
      
      if (res.ok) {
        setSaveStatus("saved")
        setLastSaved(new Date())
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    } catch (error) {
      console.error("Failed to save inputs:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  async function generateOutput() {
    if (!framework) return
    
    if (!projectId || projectId === "undefined") {
      setAlertModal({
        isOpen: true,
        title: "Project Required",
        message: "Invalid project. Please create a project first.",
        type: "warning",
      })
      setTimeout(() => router.push("/tools/startup-plan-generator"), 2000)
      return
    }

    // Check completeness
    const completeness = framework.completeness(inputs)
    if (!completeness.ok) {
      setAlertModal({
        isOpen: true,
        title: "Incomplete Form",
        message: `Please complete all required fields: ${completeness.missing.join(", ")}`,
        type: "warning",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedText("")
    setGenerationError(null)

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stepKey: stepId, inputs }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate output")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let fullText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setGeneratedText(fullText)
      }

      // Parse the final output
      try {
        const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, fullText]
        const jsonStr = jsonMatch[1] || fullText
        const parsed = JSON.parse(jsonStr.trim())
        setOutput(parsed)
        await loadCompletedSteps() // Refresh completed steps
        
        // Show completion banner
        setShowCompletionBanner(true)
        setTimeout(() => setShowCompletionBanner(false), 5000) // Hide after 5 seconds
      } catch (parseError) {
        console.error("Failed to parse output:", parseError)
        // Output will be editable anyway
      }
    } catch (error) {
      console.error("Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate output. Please try again."
      setGenerationError(errorMessage)
      setAlertModal({
        isOpen: true,
        title: "Generation Failed",
        message: errorMessage,
        type: "error",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function saveEditedOutput(edited: Record<string, any>) {
    setOutput(edited)
    // Find the output ID from the step
    try {
      const res = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepId}`)
      const data = await res.json()
      if (data.outputId) {
        await fetch("/api/steps/output", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outputId: data.outputId, userEditedOutput: edited }),
        })
      }
    } catch (error) {
      console.error("Failed to save edited output:", error)
    }
  }

  async function handleContinue() {
    const next = getNextStep(stepId)
    if (next) {
      router.push(`/project/${projectId}/step/${next}`)
    } else {
      router.push(`/project/${projectId}/overview`)
    }
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading step...</p>
          <p className="text-xs text-gray-400">Project: {projectId || "N/A"}</p>
          <p className="text-xs text-gray-400">Step: {stepId || "N/A"}</p>
        </div>
      </div>
    )
  }

  if (!framework) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Step not found</p>
          <p className="text-xs text-gray-400 mb-4">Step ID: {stepId || "N/A"}</p>
          <Link href={`/project/${projectId}/overview`}>
            <Button>Back to Project</Button>
          </Link>
        </div>
      </div>
    )
  }

  const nextStep = getNextStep(stepId)
  const previousStep = getPreviousStep(stepId)
  
  // Get tool recommendations for this step
  const toolRecommendations = getToolRecommendations(stepId)
  
  // Filter out tools that have already been used
  const filterUsedTools = (tools: any[]) => {
    return tools.filter(tool => {
      // If Idea Discovery and project was created from discovery, hide it
      if (tool.toolId === "idea-discovery" && projectSource === "idea_discovery") {
        return false
      }
      
      // If tool output is already linked to this project, hide it
      if (linkedToolIds.has(tool.toolId)) {
        return false
      }
      
      return true
    })
  }
  
  const recommendedTools = filterUsedTools(toolRecommendations?.recommended || [])
  const optionalTools = filterUsedTools(toolRecommendations?.optional || [])

  return (
    <StepShell
      currentStep={stepId}
      completedSteps={completedSteps}
      title={framework.title}
      description={framework.description}
    >
      <DisclaimerBanner className="mb-6" />
      
      {/* Time Estimate */}
      {framework.timeEstimate && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Estimated time: <strong>{framework.timeEstimate}</strong></span>
        </div>
      )}

      {/* Completion Banner */}
      {showCompletionBanner && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Step Complete! 🎉</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your output has been generated and saved. You can review and edit it below, then continue to the next step.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>All required questions answered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>Output generated successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>Step marked as complete</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCompletionBanner(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Questions */}
        <div className="lg:col-span-1 order-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inputs</h2>
              <div className="flex items-center gap-3">
                {/* Auto-Save Indicator */}
                {saveStatus !== "idle" && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    saveStatus === "saving" 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : saveStatus === "saved"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {saveStatus === "saving" && (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved{lastSaved ? ` at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
                      </>
                    )}
                    {saveStatus === "error" && (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Save failed</span>
                      </>
                    )}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {framework.questions.filter(q => inputs[q.id] && inputs[q.id].trim()).length} / {framework.questions.length} answered
                </div>
              </div>
            </div>
            
            {/* Step Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600">Step Progress</span>
                <span className="text-xs font-medium text-gray-600">
                  {Math.round((framework.questions.filter(q => inputs[q.id] && inputs[q.id].trim()).length / framework.questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(framework.questions.filter(q => inputs[q.id] && inputs[q.id].trim()).length / framework.questions.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            <QuestionForm
              questions={framework.questions}
              initialValues={inputs}
              onChange={saveInputs}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={generateOutput}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? "Generating..." : "Generate Output"}
            </Button>
            {previousStep && (
              <Link href={`/project/${projectId}/step/${previousStep}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Middle: Output */}
        <div className="lg:col-span-1 order-2">
          {/* Generation Error with Retry */}
          {generationError && !isGenerating && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">Generation Failed</h3>
                  <p className="text-sm text-red-700 mb-4">{generationError}</p>
                  <RetryButton onRetry={generateOutput} isLoading={isGenerating} />
                </div>
              </div>
            </div>
          )}

          {isGenerating && generatedText && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Generating...</h2>
              <div className="font-mono text-sm text-gray-600 whitespace-pre-wrap">
                {generatedText}
              </div>
            </div>
          )}

          {output && (
            <>
              <OutputEditor
                output={output}
                onSave={saveEditedOutput}
                readonly={false}
              />
              <div className="mt-6">
                {nextStep ? (
                  <Link href={`/project/${projectId}/step/${nextStep}`}>
                    <Button className="w-full">Continue to Next Step</Button>
                  </Link>
                ) : (
                  <Link href={`/project/${projectId}/overview`}>
                    <Button className="w-full">View Project Overview</Button>
                  </Link>
                )}
              </div>
            </>
          )}

          {!output && !isGenerating && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              <p>Complete the inputs and click "Generate Output" to see results</p>
            </div>
          )}

          {output && step && (
            <div className="mt-6">
              <FeedbackForm stepId={step.id} />
            </div>
          )}
        </div>

        {/* Right: Helper Tools */}
        <div className="lg:col-span-1 order-3 lg:order-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-lg">💡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Helper Tools</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Use these tools to get data and insights for this step
            </p>

            {/* Linked Tool Outputs */}
            <LinkedToolOutputs 
              projectId={projectId} 
              stepId={stepId}
              onAutoFillComplete={loadStep}
            />

            {/* Show message if Idea Discovery was filtered out */}
            {projectSource === "idea_discovery" && stepId === "jtbd" && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Idea Discovery data is already pre-filled in this step from your discovery journey.
                </p>
              </div>
            )}

            {recommendedTools.length > 0 && (
              <div className="space-y-4 mb-6 mt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Recommended Tools
                </h4>
                {recommendedTools.map((tool) => (
                  <ToolRecommendationCard
                    key={tool.toolId}
                    tool={tool}
                    projectId={projectId}
                    stepId={stepId}
                  />
                ))}
              </div>
            )}

            {optionalTools.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Optional Tools
                </h4>
                {optionalTools.map((tool) => (
                  <ToolRecommendationCard
                    key={tool.toolId}
                    tool={tool}
                    projectId={projectId}
                    stepId={stepId}
                  />
                ))}
              </div>
            )}

            {recommendedTools.length === 0 && optionalTools.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No specific tools recommended for this step</p>
                <Link href="/tools" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  Browse all tools →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: "", message: "", type: "info" })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </StepShell>
  )
}

