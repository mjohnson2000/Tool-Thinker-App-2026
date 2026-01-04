#!/bin/bash
# Fix undefined projectId issue on server

cd ~/tool-thinker || exit

echo "🔧 Fixing undefined projectId issue..."

# Fix step page to handle undefined projectId
cat > app/project/[projectId]/step/[stepId]/page.tsx << 'STEPEOF'
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { StepShell } from "@/components/StepShell"
import { QuestionForm } from "@/components/QuestionForm"
import { OutputEditor } from "@/components/OutputEditor"
import { FeedbackForm } from "@/components/FeedbackForm"
import { Button } from "@/components/ui/button"
import { getFramework, getNextStep, getPreviousStep, FRAMEWORK_ORDER } from "@/lib/frameworks"
import type { Framework } from "@/types/frameworks"

export default function StepPage() {
  const params = useParams()
  const router = useRouter()
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

  useEffect(() => {
    // Redirect if projectId is undefined
    if (!projectId || projectId === "undefined") {
      router.push("/tools/start-smart-os")
      return
    }
    
    if (stepId) {
      loadStep()
      loadCompletedSteps()
    }
  }, [stepId, projectId])

  async function loadStep() {
    if (!projectId || projectId === "undefined") {
      router.push("/tools/start-smart-os")
      return
    }
    
    try {
      const frameworkData = getFramework(stepId)
      if (!frameworkData) {
        router.push(`/project/${projectId}/overview`)
        return
      }
      setFramework(frameworkData)

      // Load existing step data
      const res = await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stepKey: stepId }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error("API error:", errorData)
        throw new Error(errorData.error || "Failed to load step")
      }
      
      const data = await res.json()
      setStep(data.step)
      setInputs(data.inputs || {})
      setOutput(data.output)
    } catch (error) {
      console.error("Failed to load step:", error)
      // Redirect to project overview on error
      if (projectId && projectId !== "undefined") {
        router.push(`/project/${projectId}/overview`)
      } else {
        router.push("/tools/start-smart-os")
      }
    } finally {
      setLoading(false)
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

  async function saveInputs(newInputs: Record<string, any>) {
    if (!projectId || projectId === "undefined") {
      return
    }
    
    setInputs(newInputs)
    try {
      await fetch("/api/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stepKey: stepId, inputs: newInputs }),
      })
    } catch (error) {
      console.error("Failed to save inputs:", error)
    }
  }

  async function generateOutput() {
    if (!framework) return
    
    if (!projectId || projectId === "undefined") {
      alert("Invalid project. Please create a project first.")
      router.push("/tools/start-smart-os")
      return
    }

    // Check completeness
    const completeness = framework.completeness(inputs)
    if (!completeness.ok) {
      alert(`Please complete all required fields: ${completeness.missing.join(", ")}`)
      return
    }

    setIsGenerating(true)
    setGeneratedText("")

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
      } catch (parseError) {
        console.error("Failed to parse output:", parseError)
        // Output will be editable anyway
      }
    } catch (error) {
      console.error("Generation error:", error)
      alert(`Failed to generate output: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  async function saveEditedOutput(edited: Record<string, any>) {
    setOutput(edited)
    if (!step?.id) return

    try {
      await fetch("/api/steps/output", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: step.id,
          output: edited,
        }),
      })
    } catch (error) {
      console.error("Failed to save output:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!framework) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Framework not found</p>
          <Link href={`/project/${projectId}/overview`}>
            <Button>Back to Overview</Button>
          </Link>
        </div>
      </div>
    )
  }

  const nextStep = getNextStep(stepId)
  const previousStep = getPreviousStep(stepId)

  return (
    <StepShell
      framework={framework}
      stepId={stepId}
      projectId={projectId}
      nextStep={nextStep}
      previousStep={previousStep}
      completedSteps={completedSteps}
    >
      <QuestionForm
        framework={framework}
        inputs={inputs}
        onChange={saveInputs}
      />

      {output && (
        <OutputEditor
          framework={framework}
          output={output}
          onChange={saveEditedOutput}
        />
      )}

      {!output && (
        <div className="mt-8">
          <Button
            onClick={generateOutput}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Output"}
          </Button>
          {isGenerating && generatedText && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{generatedText}</pre>
            </div>
          )}
        </div>
      )}

      {output && step?.id && (
        <FeedbackForm stepId={step.id} />
      )}
    </StepShell>
  )
}
STEPEOF

echo "🔨 Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🔄 Restarting PM2..."
    pm2 restart tool-thinker
    
    echo ""
    echo "✅ Fixed! The app will now redirect to Start Smart OS if projectId is undefined."
    echo ""
    echo "📋 To use the app:"
    echo "   1. Go to /tools/start-smart-os"
    echo "   2. Create a new project"
    echo "   3. Click on the project to view steps"
    echo "   4. Click on a step to work on it"
else
    echo "❌ Build failed"
    exit 1
fi

