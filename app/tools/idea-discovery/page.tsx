"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"
import { DiscoveryOnboarding } from "@/components/DiscoveryOnboarding"
import { Lightbulb, ArrowRight, ArrowLeft, CheckCircle2, Rocket, History, Calendar, X, ChevronDown, ChevronUp } from "lucide-react"
import { jsPDF } from "jspdf"
import { useSaveToolOutput } from "@/hooks/useSaveToolOutput"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"

// Types
interface IdeaType {
  id: string
  name: string
  description: string
  icon: string
}

interface BusinessArea {
  id: string
  title: string
  description: string
  icon: string
}

interface CustomerPersona {
  id: string
  title: string
  description: string
  icon: string
  painPoints: string[]
}

interface JobToBeDone {
  id: string
  title: string
  description: string
  icon: string
  problemStatement: string
}

interface Solution {
  id: string
  title: string
  description: string
  icon: string
  keyFeatures: string[]
}

interface DiscoveryData {
  entryPoint: "need-idea" | "have-idea" | null
  ideaType: IdeaType | null
  location: {
    city?: string
    region?: string
    country?: string
    operatingModel?: "local" | "remote" | "hybrid"
  }
  scheduleGoals: {
    hoursPerWeek?: string
    incomeTarget?: string
    timeline?: string
  }
  interests: string
  selectedBusinessArea: BusinessArea | null
  selectedCustomer: CustomerPersona | null
  selectedJob: JobToBeDone | null
  selectedSolution: Solution | null
}

type Step = 
  | "landing"
  | "idea-type"
  | "location"
  | "schedule-goals"
  | "idea-selection"
  | "customer-selection"
  | "job-selection"
  | "solution-selection"
  | "summary"

const STEPS: Step[] = [
  "landing",
  "idea-type",
  "location",
  "schedule-goals",
  "idea-selection",
  "customer-selection",
  "job-selection",
  "solution-selection",
  "summary"
]

const IDEA_TYPES: IdeaType[] = [
  {
    id: "side-hustle",
    name: "Side Hustle",
    description: "Part-time business to supplement income",
    icon: "💼"
  },
  {
    id: "startup",
    name: "Startup",
    description: "Scalable business with growth potential",
    icon: "🚀"
  },
  {
    id: "small-business",
    name: "Small Business",
    description: "Local or regional business",
    icon: "🏪"
  },
  {
    id: "freelance",
    name: "Freelance Service",
    description: "Service-based independent work",
    icon: "🎨"
  }
]

export default function IdeaDiscoveryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("landing")
  const [data, setData] = useState<DiscoveryData>({
    entryPoint: null,
    ideaType: null,
    location: {},
    scheduleGoals: {},
    interests: "",
    selectedBusinessArea: null,
    selectedCustomer: null,
    selectedJob: null,
    selectedSolution: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedOptions, setGeneratedOptions] = useState<{
    businessAreas?: BusinessArea[]
    customers?: CustomerPersona[]
    jobs?: JobToBeDone[]
    solutions?: Solution[]
  }>({})
  const [saved, setSaved] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [pastDiscoveries, setPastDiscoveries] = useState<any[]>([])
  const [loadingPastDiscoveries, setLoadingPastDiscoveries] = useState(false)
  const [showPastDiscoveries, setShowPastDiscoveries] = useState(false)
  const [creatingProjectFromPast, setCreatingProjectFromPast] = useState<string | null>(null)
  const [viewingDiscoveryDetails, setViewingDiscoveryDetails] = useState<any | null>(null)

  const { saveOutput, saving } = useSaveToolOutput()

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  // Load past discoveries when on landing page and user is logged in
  useEffect(() => {
    if (currentStep === "landing" && user && !loadingPastDiscoveries) {
      loadPastDiscoveries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, user])

  // Auto-save when reaching summary step
  useEffect(() => {
    if (currentStep === "summary" && data.selectedSolution && !saved) {
      saveOutput({
        toolId: "idea-discovery",
        toolName: "Idea Discovery",
        outputData: {
          selectedBusinessArea: data.selectedBusinessArea,
          selectedCustomer: data.selectedCustomer,
          selectedJob: data.selectedJob,
          selectedSolution: data.selectedSolution,
        },
        inputData: {
          entryPoint: data.entryPoint,
          ideaType: data.ideaType,
          location: data.location,
          scheduleGoals: data.scheduleGoals,
          interests: data.interests,
        },
        metadata: {
          completedAt: new Date().toISOString(),
        },
      }).then((result) => {
        if (result.success) {
          setSaved(true)
          // Reload past discoveries to include the new one
          if (currentStep === "landing") {
            loadPastDiscoveries()
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, data.selectedSolution, saved])

  async function loadPastDiscoveries() {
    if (!user) return
    
    setLoadingPastDiscoveries(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const headers: HeadersInit = {
        Authorization: `Bearer ${session.access_token}`,
      }

      const response = await fetch("/api/tool-outputs/list?toolId=idea-discovery", { headers })
      const data = await response.json()

      if (response.ok) {
        setPastDiscoveries(data.outputs || [])
      }
    } catch (err) {
      console.error("Failed to load past discoveries:", err)
    } finally {
      setLoadingPastDiscoveries(false)
    }
  }

  async function createProjectFromPastDiscovery(output: any) {
    if (!user) {
      router.push("/signin")
      return
    }

    setCreatingProjectFromPast(output.id)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const discoveryData = output.output_data
      if (!discoveryData?.selectedBusinessArea || !discoveryData?.selectedCustomer || 
          !discoveryData?.selectedJob || !discoveryData?.selectedSolution) {
        throw new Error("Invalid discovery data")
      }

      const projectName = discoveryData.selectedBusinessArea?.title || "My Startup Idea"

      const res = await fetch("/api/projects/from-discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectName,
          discoveryData: {
            selectedBusinessArea: discoveryData.selectedBusinessArea,
            selectedCustomer: discoveryData.selectedCustomer,
            selectedJob: discoveryData.selectedJob,
            selectedSolution: discoveryData.selectedSolution,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to create project")
      }

      // Navigate to the project overview
      router.push(`/project/${result.project.id}/overview?fromDiscovery=true`)
    } catch (err: any) {
      setError(err.message || "Failed to create project. Please try again.")
      setCreatingProjectFromPast(null)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  async function generateWithAI(prompt: string, type: "business-areas" | "customers" | "jobs" | "solutions"): Promise<any> {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/idea-discovery/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate options")
      }

      const result = await response.json()
      return result
    } catch (err: any) {
      console.error("AI generation error:", err)
      setError(err.message || "Failed to generate options. Please try again.")
      return null
    } finally {
      setLoading(false)
    }
  }

  function nextStep() {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  function prevStep() {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  function handleEntryPoint(entryPoint: "need-idea" | "have-idea") {
    setData(prev => ({ ...prev, entryPoint }))
    nextStep()
  }

  function handleIdeaTypeSelect(ideaType: IdeaType) {
    setData(prev => ({ ...prev, ideaType }))
    nextStep()
  }

  async function handleInterestsSubmit() {
    if (!data.interests.trim()) {
      setError("Please enter your interests")
      return
    }

    const prompt = `Generate 6 business areas for a ${data.ideaType?.name || "business"} based on these interests: "${data.interests}"

Focus on business areas that align with the user's interests and can be done as a ${data.ideaType?.name || "business"}.

Return ONLY a JSON array with exactly 6 objects. Each object must have id, title, description, and icon (emoji).`

    const result = await generateWithAI(prompt, "business-areas")
    if (result && result.options) {
      setGeneratedOptions(prev => ({ ...prev, businessAreas: result.options }))
    }
  }

  function handleBusinessAreaSelect(businessArea: BusinessArea) {
    setData(prev => ({ ...prev, selectedBusinessArea: businessArea }))
    nextStep()
  }

  async function handleCustomerGeneration() {
    if (!data.selectedBusinessArea) return

    const prompt = `Based on this business area: "${data.selectedBusinessArea.title}", generate 6 different customer personas that would be interested in this type of business.

Return ONLY a JSON array with exactly 6 objects. Each object must have id, title, description, icon (emoji), and painPoints (array of 3 strings).`

    const result = await generateWithAI(prompt, "customers")
    if (result && result.options) {
      setGeneratedOptions(prev => ({ ...prev, customers: result.options }))
    }
  }

  function handleCustomerSelect(customer: CustomerPersona) {
    setData(prev => ({ ...prev, selectedCustomer: customer }))
    nextStep()
  }

  async function handleJobGeneration() {
    if (!data.selectedBusinessArea || !data.selectedCustomer) return

    const prompt = `Based on this business area: "${data.selectedBusinessArea.title}" and target customer: "${data.selectedCustomer.title}", generate 6 different jobs that customers might be trying to get done.

For each job, also provide a clear problem statement that customers face when trying to accomplish this job.

Return ONLY a JSON array with exactly 6 objects. Each object must have id, title, description, icon (emoji), and problemStatement.`

    const result = await generateWithAI(prompt, "jobs")
    if (result && result.options) {
      setGeneratedOptions(prev => ({ ...prev, jobs: result.options }))
    }
  }

  function handleJobSelect(job: JobToBeDone) {
    setData(prev => ({ ...prev, selectedJob: job }))
    nextStep()
  }

  async function handleSolutionGeneration() {
    if (!data.selectedBusinessArea || !data.selectedCustomer || !data.selectedJob) return

    const prompt = `Based on this job-to-be-done: "${data.selectedJob.title}" for customer "${data.selectedCustomer.title}" in business area "${data.selectedBusinessArea.title}", generate 6 different solution approaches.

Return ONLY a JSON array with exactly 6 objects. Each object must have id, title, description, icon (emoji), and keyFeatures (array of 4 strings).`

    const result = await generateWithAI(prompt, "solutions")
    if (result && result.options) {
      setGeneratedOptions(prev => ({ ...prev, solutions: result.options }))
    }
  }

  function handleSolutionSelect(solution: Solution) {
    setData(prev => ({ ...prev, selectedSolution: solution }))
    nextStep()
  }

  function downloadJSON() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "idea-discovery.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPDF() {
    if (!data.selectedSolution || !data.selectedJob || !data.selectedCustomer || !data.selectedBusinessArea) return

    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Idea Discovery Summary", 20, 20)

    let y = 40
    doc.setFontSize(14)
    doc.text("Business Idea", 20, y)
    y += 10
    doc.setFontSize(12)
    doc.text(`${data.selectedBusinessArea.icon} ${data.selectedBusinessArea.title}`, 20, y)
    y += 8
    doc.text(data.selectedBusinessArea.description, 20, y, { maxWidth: 170 })
    y += 15

    doc.setFontSize(14)
    doc.text("Target Customer", 20, y)
    y += 10
    doc.setFontSize(12)
    doc.text(`${data.selectedCustomer.icon} ${data.selectedCustomer.title}`, 20, y)
    y += 8
    doc.text(data.selectedCustomer.description, 20, y, { maxWidth: 170 })
    y += 15

    doc.setFontSize(14)
    doc.text("Job-to-be-Done", 20, y)
    y += 10
    doc.setFontSize(12)
    doc.text(`${data.selectedJob.icon} ${data.selectedJob.title}`, 20, y)
    y += 8
    doc.text(data.selectedJob.description, 20, y, { maxWidth: 170 })
    y += 10
    doc.text(`Problem: ${data.selectedJob.problemStatement}`, 20, y, { maxWidth: 170 })
    y += 15

    doc.setFontSize(14)
    doc.text("Solution", 20, y)
    y += 10
    doc.setFontSize(12)
    doc.text(`${data.selectedSolution.icon} ${data.selectedSolution.title}`, 20, y)
    y += 8
    doc.text(data.selectedSolution.description, 20, y, { maxWidth: 170 })
    y += 10
    doc.text("Key Features:", 20, y)
    y += 8
    data.selectedSolution.keyFeatures.forEach((feature, idx) => {
      doc.text(`• ${feature}`, 25, y)
      y += 7
    })

    doc.save("idea-discovery.pdf")
  }

  function resetDiscovery() {
    setCurrentStep("landing")
    setData({
      entryPoint: null,
      ideaType: null,
      location: {},
      scheduleGoals: {},
      interests: "",
      selectedBusinessArea: null,
      selectedCustomer: null,
      selectedJob: null,
      selectedSolution: null,
    })
    setGeneratedOptions({})
    setError(null)
    setSaved(false)
  }

  async function handleCreateProject() {
    if (!user) {
      router.push("/signin")
      return
    }

    if (!data.selectedBusinessArea || !data.selectedCustomer || !data.selectedJob || !data.selectedSolution) {
      setError("Please complete the discovery journey first")
      return
    }

    setIsCreatingProject(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const projectName = data.selectedBusinessArea.title || "My Startup Idea"

      const res = await fetch("/api/projects/from-discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectName,
          discoveryData: {
            selectedBusinessArea: data.selectedBusinessArea,
            selectedCustomer: data.selectedCustomer,
            selectedJob: data.selectedJob,
            selectedSolution: data.selectedSolution,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to create project")
      }

      // Navigate to the project overview
      router.push(`/project/${result.project.id}/overview?fromDiscovery=true`)
    } catch (err: any) {
      setError(err.message || "Failed to create project. Please try again.")
    } finally {
      setIsCreatingProject(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16">
      <DiscoveryOnboarding />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div id="idea-discovery-header" className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Idea Discovery" toolId="idea-discovery" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg mx-auto">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Idea Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover your next business idea through a guided, AI-powered journey from interests to solution
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-900 to-gray-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Progress Bar */}
        {currentStep !== "landing" && currentStep !== "summary" && (
          <div id="idea-discovery-progress" className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStepIndex} of {STEPS.length - 2}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-gray-900 to-gray-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div id="idea-discovery-content" className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border-2 border-gray-100">
          {/* Landing Step */}
          {currentStep === "landing" && (
            <div className="text-center space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to discover your next business idea?</h2>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                This tool helps you find business ideas from scratch based on your interests, goals, and situation.
              </p>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Already have an idea?</strong> Create a project instead to plan and validate it step-by-step.
                </p>
                <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
                  Go to Dashboard →
                </Link>
              </div>

              {/* Past Discoveries Section */}
              {user && pastDiscoveries.length > 0 && (
                <div className="mb-6 max-w-2xl mx-auto">
                  <button
                    onClick={() => setShowPastDiscoveries(!showPastDiscoveries)}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        View Past Discoveries ({pastDiscoveries.length})
                      </span>
                    </div>
                    {showPastDiscoveries ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {showPastDiscoveries && (
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                      {pastDiscoveries.map((discovery) => {
                        const discoveryData = discovery.output_data
                        return (
                          <div
                            key={discovery.id}
                            className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="text-2xl">
                                    {discoveryData?.selectedBusinessArea?.icon || "💡"}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">
                                      {discoveryData?.selectedBusinessArea?.title || "Untitled Idea"}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(discovery.created_at)}
                                    </div>
                                  </div>
                                </div>
                                {discoveryData?.selectedCustomer && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <strong>Customer:</strong> {discoveryData.selectedCustomer.title}
                                  </p>
                                )}
                                {discoveryData?.selectedJob && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Problem:</strong> {discoveryData.selectedJob.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => createProjectFromPastDiscovery(discovery)}
                                  disabled={creatingProjectFromPast === discovery.id}
                                  size="sm"
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white whitespace-nowrap"
                                >
                                  {creatingProjectFromPast === discovery.id ? (
                                    <>Creating...</>
                                  ) : (
                                    <>
                                      <Rocket className="w-3 h-3 mr-1" />
                                      Create Project
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => setViewingDiscoveryDetails(discovery)}
                                  variant="outline"
                                  size="sm"
                                  className="whitespace-nowrap"
                                >
                                  <History className="w-3 h-3 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleEntryPoint("need-idea")}
                className="w-full max-w-md mx-auto p-8 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl hover:shadow-xl transition-all border-2 border-yellow-300 hover:border-yellow-500 text-left group"
              >
                <div className="text-4xl mb-4 text-center">💡</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">I need an idea</h3>
                <p className="text-gray-600 text-center">Start from scratch and discover business ideas that match your interests and goals</p>
                <div className="mt-4 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

          {/* Idea Type Step */}
          {currentStep === "idea-type" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What type of business are you interested in?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {IDEA_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleIdeaTypeSelect(type)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      data.ideaType?.id === type.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                    }`}
                  >
                    <div className="text-3xl mb-3">{type.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location Step */}
          {currentStep === "location" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Where will you operate? (Optional)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                  <Input
                    value={data.location.city || ""}
                    onChange={(e) => setData(prev => ({ ...prev, location: { ...prev.location, city: e.target.value } }))}
                    placeholder="e.g., San Francisco"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Region/State</label>
                  <Input
                    value={data.location.region || ""}
                    onChange={(e) => setData(prev => ({ ...prev, location: { ...prev.location, region: e.target.value } }))}
                    placeholder="e.g., California"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
                  <Input
                    value={data.location.country || ""}
                    onChange={(e) => setData(prev => ({ ...prev, location: { ...prev.location, country: e.target.value } }))}
                    placeholder="e.g., United States"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Operating Model</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["local", "remote", "hybrid"] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() => setData(prev => ({ ...prev, location: { ...prev.location, operatingModel: model } }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          data.location.operatingModel === model
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <span className="font-semibold text-gray-900 capitalize">{model}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Schedule & Goals Step */}
          {currentStep === "schedule-goals" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What are your goals and availability? (Optional)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Hours per week available</label>
                  <Input
                    type="number"
                    value={data.scheduleGoals.hoursPerWeek || ""}
                    onChange={(e) => setData(prev => ({ ...prev, scheduleGoals: { ...prev.scheduleGoals, hoursPerWeek: e.target.value } }))}
                    placeholder="e.g., 10"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Income target (monthly)</label>
                  <Input
                    value={data.scheduleGoals.incomeTarget || ""}
                    onChange={(e) => setData(prev => ({ ...prev, scheduleGoals: { ...prev.scheduleGoals, incomeTarget: e.target.value } }))}
                    placeholder="e.g., $5,000"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Timeline</label>
                  <Input
                    value={data.scheduleGoals.timeline || ""}
                    onChange={(e) => setData(prev => ({ ...prev, scheduleGoals: { ...prev.scheduleGoals, timeline: e.target.value } }))}
                    placeholder="e.g., Launch in 3 months"
                    className="border-2 border-gray-200 focus:border-gray-900"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Idea Selection Step */}
          {currentStep === "idea-selection" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What are your interests or passions?</h2>
              <Textarea
                value={data.interests}
                onChange={(e) => setData(prev => ({ ...prev, interests: e.target.value }))}
                placeholder="e.g., I love technology, helping people learn, creating educational content, working with kids..."
                rows={6}
                className="border-2 border-gray-200 focus:border-gray-900"
              />
              <Button
                onClick={handleInterestsSubmit}
                disabled={loading || !data.interests.trim()}
                className="w-full"
              >
                {loading ? "Generating ideas..." : "Generate Business Areas"}
              </Button>

              {generatedOptions.businessAreas && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-xl font-bold text-gray-900">Select a business area:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {generatedOptions.businessAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => handleBusinessAreaSelect(area)}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          data.selectedBusinessArea?.id === area.id
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                        }`}
                      >
                        <div className="text-3xl mb-3">{area.icon}</div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{area.title}</h4>
                        <p className="text-gray-600 text-sm">{area.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Customer Selection Step */}
          {currentStep === "customer-selection" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Who is your target customer?</h2>
              {!generatedOptions.customers && (
                <Button
                  onClick={handleCustomerGeneration}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating customers..." : "Generate Customer Personas"}
                </Button>
              )}

              {generatedOptions.customers && (
                <div className="grid md:grid-cols-2 gap-4">
                  {generatedOptions.customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        data.selectedCustomer?.id === customer.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                      }`}
                    >
                      <div className="text-3xl mb-3">{customer.icon}</div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{customer.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{customer.description}</p>
                      {customer.painPoints && customer.painPoints.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Pain Points:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {customer.painPoints.map((point, idx) => (
                              <li key={idx}>• {point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Job Selection Step */}
          {currentStep === "job-selection" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What job are they trying to get done?</h2>
              {!generatedOptions.jobs && (
                <Button
                  onClick={handleJobGeneration}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating jobs..." : "Generate Jobs-to-be-Done"}
                </Button>
              )}

              {generatedOptions.jobs && (
                <div className="space-y-4">
                  {generatedOptions.jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleJobSelect(job)}
                      className={`p-6 rounded-xl border-2 transition-all text-left w-full ${
                        data.selectedJob?.id === job.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{job.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h4>
                          <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                          {job.problemStatement && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-xs font-semibold text-red-800 mb-1">Problem:</p>
                              <p className="text-sm text-red-700">{job.problemStatement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Solution Selection Step */}
          {currentStep === "solution-selection" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What solution approach do you want to pursue?</h2>
              {!generatedOptions.solutions && (
                <Button
                  onClick={handleSolutionGeneration}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating solutions..." : "Generate Solution Options"}
                </Button>
              )}

              {generatedOptions.solutions && (
                <div className="space-y-4">
                  {generatedOptions.solutions.map((solution) => (
                    <button
                      key={solution.id}
                      onClick={() => handleSolutionSelect(solution)}
                      className={`p-6 rounded-xl border-2 transition-all text-left w-full ${
                        data.selectedSolution?.id === solution.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{solution.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{solution.title}</h4>
                          <p className="text-gray-600 text-sm mb-3">{solution.description}</p>
                          {solution.keyFeatures && solution.keyFeatures.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-800 mb-2">Key Features:</p>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {solution.keyFeatures.map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button onClick={prevStep} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Summary Step */}
          {currentStep === "summary" && data.selectedSolution && (
            <>
              {saving && (
                <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
                  <p className="text-blue-800 text-sm font-medium">Saving your discovery...</p>
                </div>
              )}
              {saved && !saving && (
                <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-xl text-center">
                  <p className="text-green-800 text-sm font-medium">✓ Saved to your history</p>
                </div>
              )}
            </>
          )}
          {currentStep === "summary" && data.selectedSolution && (
            <div className="space-y-8">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Idea Discovery Summary</h2>
                <p className="text-gray-600">Here's your complete business idea journey</p>
              </div>

              <div className="space-y-6">
                {/* Business Area */}
                {data.selectedBusinessArea && (
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{data.selectedBusinessArea.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Business Idea</h3>
                        <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedBusinessArea.title}</p>
                        <p className="text-gray-600">{data.selectedBusinessArea.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer */}
                {data.selectedCustomer && (
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{data.selectedCustomer.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Target Customer</h3>
                        <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedCustomer.title}</p>
                        <p className="text-gray-600 mb-3">{data.selectedCustomer.description}</p>
                        {data.selectedCustomer.painPoints && data.selectedCustomer.painPoints.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">Pain Points:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {data.selectedCustomer.painPoints.map((point, idx) => (
                                <li key={idx}>• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Job */}
                {data.selectedJob && (
                  <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border-2 border-red-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{data.selectedJob.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Job-to-be-Done</h3>
                        <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedJob.title}</p>
                        <p className="text-gray-600 mb-3">{data.selectedJob.description}</p>
                        {data.selectedJob.problemStatement && (
                          <div className="bg-red-100 rounded-lg p-3">
                            <p className="text-sm font-semibold text-red-800 mb-1">Problem Statement:</p>
                            <p className="text-sm text-red-700">{data.selectedJob.problemStatement}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Solution */}
                {data.selectedSolution && (
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{data.selectedSolution.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Solution</h3>
                        <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedSolution.title}</p>
                        <p className="text-gray-600 mb-3">{data.selectedSolution.description}</p>
                        {data.selectedSolution.keyFeatures && data.selectedSolution.keyFeatures.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {data.selectedSolution.keyFeatures.map((feature, idx) => (
                                <li key={idx}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Create Project CTA */}
              <div className="mt-8 mb-6 pt-6 border-t-2 border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Ready to plan your idea? 🚀
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Create a project to turn this idea into a structured startup plan. We'll pre-fill your first step with the discovery data you've gathered.
                      </p>
                      <Button 
                        onClick={handleCreateProject}
                        disabled={isCreatingProject}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        {isCreatingProject ? (
                          <>Creating Project...</>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Create Project from This Idea
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
                <Button onClick={downloadJSON} variant="outline" className="flex-1">
                  Download JSON
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="flex-1">
                  Download PDF
                </Button>
                <Button onClick={resetDiscovery} variant="outline" className="flex-1">
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>

        <DisclaimerBanner className="mt-8" />
      </div>

      {/* Discovery Details Modal */}
      {viewingDiscoveryDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Discovery Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(viewingDiscoveryDetails.created_at)}
                </p>
              </div>
              <button
                onClick={() => setViewingDiscoveryDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {(() => {
                const data = viewingDiscoveryDetails.output_data
                if (!data) return null

                return (
                  <div className="space-y-6">
                    {/* Business Area */}
                    {data.selectedBusinessArea && (
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{data.selectedBusinessArea.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Business Idea</h3>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedBusinessArea.title}</p>
                            {data.selectedBusinessArea.description && (
                              <p className="text-gray-600">{data.selectedBusinessArea.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customer */}
                    {data.selectedCustomer && (
                      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{data.selectedCustomer.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Target Customer</h3>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedCustomer.title}</p>
                            {data.selectedCustomer.description && (
                              <p className="text-gray-600 mb-3">{data.selectedCustomer.description}</p>
                            )}
                            {data.selectedCustomer.painPoints && data.selectedCustomer.painPoints.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-1">Pain Points:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {data.selectedCustomer.painPoints.map((point: string, idx: number) => (
                                    <li key={idx}>• {point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Job */}
                    {data.selectedJob && (
                      <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 border-2 border-red-200">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{data.selectedJob.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Job-to-be-Done</h3>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedJob.title}</p>
                            {data.selectedJob.description && (
                              <p className="text-gray-600 mb-3">{data.selectedJob.description}</p>
                            )}
                            {data.selectedJob.problemStatement && (
                              <div className="bg-red-100 rounded-lg p-3">
                                <p className="text-sm font-semibold text-red-800 mb-1">Problem Statement:</p>
                                <p className="text-sm text-red-700">{data.selectedJob.problemStatement}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Solution */}
                    {data.selectedSolution && (
                      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{data.selectedSolution.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Solution</h3>
                            <p className="text-lg font-semibold text-gray-800 mb-2">{data.selectedSolution.title}</p>
                            {data.selectedSolution.description && (
                              <p className="text-gray-600 mb-3">{data.selectedSolution.description}</p>
                            )}
                            {data.selectedSolution.keyFeatures && data.selectedSolution.keyFeatures.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-gray-700 mb-2">Key Features:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {data.selectedSolution.keyFeatures.map((feature: string, idx: number) => (
                                    <li key={idx}>• {feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <Link href="/history">
                <Button variant="outline" size="sm">
                  View All in History
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setViewingDiscoveryDetails(null)
                    createProjectFromPastDiscovery(viewingDiscoveryDetails)
                  }}
                  disabled={creatingProjectFromPast === viewingDiscoveryDetails.id}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {creatingProjectFromPast === viewingDiscoveryDetails.id ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setViewingDiscoveryDetails(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

