"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FRAMEWORK_ORDER, getFramework } from "@/lib/frameworks"

interface StepStatus {
  stepKey: string
  status: string
  title: string
}

export default function ProjectOverviewPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [project, setProject] = useState<any>(null)
  const [steps, setSteps] = useState<StepStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  async function loadProject() {
    try {
      // Load project
      const projectRes = await fetch(`/api/projects/${projectId}`)
      if (projectRes.ok) {
        const projectData = await projectRes.json()
        setProject(projectData)
      }

      // Load step statuses
      const stepStatuses: StepStatus[] = []
      for (const stepKey of FRAMEWORK_ORDER) {
        try {
          const stepRes = await fetch(`/api/steps?projectId=${projectId}&stepKey=${stepKey}`)
          if (stepRes.ok) {
            const stepData = await stepRes.json()
            const framework = getFramework(stepKey)
            stepStatuses.push({
              stepKey,
              status: stepData.step?.status || "not_started",
              title: framework?.title || stepKey,
            })
          } else {
            const framework = getFramework(stepKey)
            stepStatuses.push({
              stepKey,
              status: "not_started",
              title: framework?.title || stepKey,
            })
          }
        } catch (error) {
          // Ignore errors, add as not_started
          const framework = getFramework(stepKey)
          stepStatuses.push({
            stepKey,
            status: "not_started",
            title: framework?.title || stepKey,
          })
        }
      }
      setSteps(stepStatuses)
    } catch (error) {
      console.error("Failed to load project:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  function getNextStep() {
    return steps.find((s) => s.status === "not_started") || steps[0]
  }

  async function handleExport() {
    try {
      const res = await fetch(`/api/export?projectId=${projectId}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${project?.name || "startup"}-brief.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const nextStep = getNextStep()
  const completedCount = steps.filter((s) => s.status === "completed").length
  const progress = (completedCount / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project?.name || "Project"}
              </h1>
              <p className="text-gray-600">Startup planning progress</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline">
                Export Brief
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completedCount} of {steps.length} steps
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gray-900 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <Link
              key={step.stepKey}
              href={`/project/${projectId}/step/${step.stepKey}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    step.status
                  )}`}
                >
                  {step.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {nextStep && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Recommended Next Step</h2>
            <Link href={`/project/${projectId}/step/${nextStep.stepKey}`}>
              <Button className="w-full">
                Continue with: {nextStep.title}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
