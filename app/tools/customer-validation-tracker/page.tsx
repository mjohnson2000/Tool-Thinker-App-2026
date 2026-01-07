"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Calendar,
  User,
  MessageSquare,
  Target,
  TrendingUp,
  FileText
} from "lucide-react"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"
import { ShareButton } from "@/components/ShareButton"
import Link from "next/link"

interface Interview {
  id: string
  interviewee_name: string | null
  interviewee_email: string | null
  interviewee_role: string | null
  interview_date: string
  status: string
  validation_score: number | null
  key_insights: string | null
  notes: string | null
  answer_count?: number
}

interface Assumption {
  id: string
  assumption_text: string
  assumption_category: string
  validation_status: string
  confidence_level: number | null
  evidence_count: number
}

export default function CustomerValidationTrackerPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const projectId = searchParams.get("projectId")
  
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [assumptions, setAssumptions] = useState<Assumption[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false)
  const [showNewAssumptionModal, setShowNewAssumptionModal] = useState(false)
  
  // New interview form
  const [newInterview, setNewInterview] = useState({
    interviewee_name: "",
    interviewee_email: "",
    interviewee_role: "",
    interviewee_company: "",
    interview_date: new Date().toISOString().split('T')[0],
    interview_duration_minutes: "",
    notes: "",
  })
  
  // New assumption form
  const [newAssumption, setNewAssumption] = useState({
    assumption_text: "",
    assumption_category: "problem",
    confidence_level: 5,
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, projectId])

  async function loadData() {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      // Load interviews
      const interviewsRes = await fetch(`/api/customer-validation/interviews?projectId=${projectId || ''}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json()
        setInterviews(interviewsData.interviews || [])
      }

      // Load assumptions
      const assumptionsRes = await fetch(`/api/customer-validation/assumptions?projectId=${projectId || ''}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      
      if (assumptionsRes.ok) {
        const assumptionsData = await assumptionsRes.json()
        setAssumptions(assumptionsData.assumptions || [])
      }
    } catch (error) {
      console.error("Failed to load validation data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function createInterview() {
    if (!user || !newInterview.interviewee_name.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/customer-validation/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...newInterview,
          project_id: projectId || null,
          interview_duration_minutes: newInterview.interview_duration_minutes ? parseInt(newInterview.interview_duration_minutes) : null,
        }),
      })

      if (res.ok) {
        setShowNewInterviewModal(false)
        setNewInterview({
          interviewee_name: "",
          interviewee_email: "",
          interviewee_role: "",
          interviewee_company: "",
          interview_date: new Date().toISOString().split('T')[0],
          interview_duration_minutes: "",
          notes: "",
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create interview:", error)
    }
  }

  async function createAssumption() {
    if (!user || !newAssumption.assumption_text.trim()) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch("/api/customer-validation/assumptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...newAssumption,
          project_id: projectId || null,
        }),
      })

      if (res.ok) {
        setShowNewAssumptionModal(false)
        setNewAssumption({
          assumption_text: "",
          assumption_category: "problem",
          confidence_level: 5,
        })
        loadData()
      }
    } catch (error) {
      console.error("Failed to create assumption:", error)
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Calendar className="w-5 h-5 text-blue-600" />
    }
  }

  function getValidationStatusColor(status: string) {
    switch (status) {
      case "validated":
        return "bg-green-100 text-green-800 border-green-200"
      case "invalidated":
        return "bg-red-100 text-red-800 border-red-200"
      case "partially_validated":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const completedInterviews = interviews.filter(i => i.status === "completed").length
  const validatedAssumptions = assumptions.filter(a => a.validation_status === "validated").length
  const totalAssumptions = assumptions.length

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
        
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ShareButton toolName="Customer Validation Tracker" toolId="customer-validation-tracker" />
          </div>
          <div className="inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg mx-auto">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Customer Validation Tracker</h1>
          <p className="text-xl text-gray-600">
            Track customer interviews, validate assumptions, and make data-driven decisions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
                <p className="text-sm text-gray-600">Total Interviews</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{completedInterviews} completed</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalAssumptions}</p>
                <p className="text-sm text-gray-600">Assumptions Tracked</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{validatedAssumptions} validated</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {totalAssumptions > 0 ? Math.round((validatedAssumptions / totalAssumptions) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-600">Validation Rate</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Assumptions validated</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setShowNewInterviewModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
          <Button
            onClick={() => setShowNewAssumptionModal(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assumption
          </Button>
          <Link href="/tools/customer-interview-generator">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Interview Guide
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interviews Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
              <span className="text-sm text-gray-600">{interviews.length} total</span>
            </div>
            
            {interviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">No interviews yet</p>
                <Button onClick={() => setShowNewInterviewModal(true)} variant="outline">
                  Schedule Your First Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/tools/customer-validation-tracker/interview/${interview.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(interview.status)}
                          <h3 className="font-semibold text-gray-900">
                            {interview.interviewee_name || "Anonymous"}
                          </h3>
                          {interview.interviewee_role && (
                            <span className="text-sm text-gray-500">• {interview.interviewee_role}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(interview.interview_date).toLocaleDateString()}
                        </p>
                        {interview.key_insights && (
                          <p className="text-sm text-gray-700 line-clamp-2">{interview.key_insights}</p>
                        )}
                      </div>
                      {interview.validation_score && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{interview.validation_score}/10</div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Assumptions Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assumptions</h2>
              <span className="text-sm text-gray-600">{assumptions.length} total</span>
            </div>
            
            {assumptions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">No assumptions tracked yet</p>
                <Button onClick={() => setShowNewAssumptionModal(true)} variant="outline">
                  Add Your First Assumption
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assumptions.map((assumption) => (
                  <div
                    key={assumption.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900 flex-1">{assumption.assumption_text}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getValidationStatusColor(assumption.validation_status)}`}>
                        {assumption.validation_status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>{assumption.assumption_category}</span>
                      <span>•</span>
                      <span>{assumption.evidence_count} evidence</span>
                      {assumption.confidence_level && (
                        <>
                          <span>•</span>
                          <span>Confidence: {assumption.confidence_level}/10</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Interview Modal */}
        {showNewInterviewModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule New Interview</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interviewee Name *
                  </label>
                  <Input
                    value={newInterview.interviewee_name}
                    onChange={(e) => setNewInterview({ ...newInterview, interviewee_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newInterview.interviewee_email}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewee_email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Input
                      value={newInterview.interviewee_role}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewee_role: e.target.value })}
                      placeholder="Product Manager"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <Input
                    value={newInterview.interviewee_company}
                    onChange={(e) => setNewInterview({ ...newInterview, interviewee_company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Date *
                    </label>
                    <Input
                      type="date"
                      value={newInterview.interview_date}
                      onChange={(e) => setNewInterview({ ...newInterview, interview_date: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={newInterview.interview_duration_minutes}
                      onChange={(e) => setNewInterview({ ...newInterview, interview_duration_minutes: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <Textarea
                    value={newInterview.notes}
                    onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                    rows={3}
                    placeholder="Any notes about this interview..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button onClick={createInterview} className="flex-1">
                  Schedule Interview
                </Button>
                <Button onClick={() => setShowNewInterviewModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Assumption Modal */}
        {showNewAssumptionModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Assumption to Validate</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assumption *
                  </label>
                  <Textarea
                    value={newAssumption.assumption_text}
                    onChange={(e) => setNewAssumption({ ...newAssumption, assumption_text: e.target.value })}
                    rows={3}
                    placeholder="e.g., 'Customers struggle with X problem and would pay $Y for a solution'"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newAssumption.assumption_category}
                      onChange={(e) => setNewAssumption({ ...newAssumption, assumption_category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="problem">Problem</option>
                      <option value="solution">Solution</option>
                      <option value="customer">Customer</option>
                      <option value="market">Market</option>
                      <option value="pricing">Pricing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Level (1-10)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newAssumption.confidence_level}
                      onChange={(e) => setNewAssumption({ ...newAssumption, confidence_level: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button onClick={createAssumption} className="flex-1">
                  Add Assumption
                </Button>
                <Button onClick={() => setShowNewAssumptionModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

