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
    if (stepId) {
      loadStep()
      loadCompletedSteps()
    }
  }, [stepId, projectId])

  async function loadStep() {
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
      const data = await res.json()
      setStep(data.step)
      setInputs(data.inputs || {})
      setOutput(data.output)
    } catch (error) {
      console.error("Failed to load step:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCompletedSteps() {
    // Load all step statuses to show progress
    const completed: string[] = []
    for (const stepKey of FRAMEWORK_ORDER) {
      try {
        const res = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepKey}`)
        const data = await res.json()
        if (data.step?.status === "completed") {
          completed.push(stepKey)
        }
      } catch (error) {
        // Ignore errors
      }
    }
    setCompletedSteps(completed)
  }

  async function saveInputs(newInputs: Record<string, any>) {
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
        throw new Error("Failed to generate output")
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
      alert("Failed to generate output. Please try again.")
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

  if (loading || !framework) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const nextStep = getNextStep(stepId)
  const previousStep = getPreviousStep(stepId)

  return (
    <StepShell
      currentStep={stepId}
      completedSteps={completedSteps}
      title={framework.title}
      description={framework.description}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Questions */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Inputs</h2>
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

        {/* Right: Output */}
        <div>
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
      </div>
    </StepShell>
  )
}

