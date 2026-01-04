"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DisclaimerBanner } from "@/components/DisclaimerBanner"

interface TeamMember {
  name: string
  role: string
  base_salary: string
  equity_percentage?: string
  location?: string
}

interface TeamCost {
  cost_per_employee: Array<{
    name: string
    role: string
    base_salary: string
    benefits_cost: string
    taxes: string
    equity_percentage: string
    equity_value_at_10m: string
    total_annual_cost: string
    total_monthly_cost: string
  }>
  total_team_costs: {
    monthly: string
    annual: string
    breakdown: {
      salaries: string
      benefits: string
      taxes: string
      equity: string
    }
  }
  cost_by_role: Array<{
    role: string
    count: number
    total_annual_cost: string
    average_cost_per_person: string
  }>
  hidden_costs: {
    recruiting: string
    onboarding: string
    equipment_software: string
    office_space: string
    total_hidden_annual: string
  }
  equity_impact: {
    total_equity_allocated: string
    equity_value_at_10m_valuation: string
    equity_value_at_50m_valuation: string
    equity_value_at_100m_valuation: string
    dilution_impact: string
  }
  cost_optimization: {
    remote_vs_office: string
    contractor_vs_employee: string
    cost_reduction_opportunities: string[]
  }
}

export default function TeamCostCalculatorPage() {
  const [teamMembersJson, setTeamMembersJson] = useState("")
  const [location, setLocation] = useState("")
  const [benefitsPercentage, setBenefitsPercentage] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [teamCost, setTeamCost] = useState<TeamCost | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function calculateTeamCost() {
    if (!teamMembersJson.trim()) {
      setError("Team members are required")
      return
    }

    setIsCalculating(true)
    setError(null)
    setTeamCost(null)

    try {
      let teamMembers: TeamMember[]
      try {
        teamMembers = JSON.parse(teamMembersJson)
        if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
          throw new Error("Team members must be a non-empty array")
        }
      } catch {
        throw new Error("Invalid JSON format for team members")
      }

      const response = await fetch("/api/team-cost-calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamMembers: teamMembers,
          location: location.trim() || undefined,
          benefitsPercentage: benefitsPercentage.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to calculate team costs")
      }

      const data = await response.json()
      setTeamCost(data)
    } catch (err: any) {
      console.error("Calculation error:", err)
      setError(err.message || "Failed to calculate team costs. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Team Cost Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate total cost of employees including hidden costs
          </p>
        </div>

        {!teamCost ? (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Location (Optional)
                  </label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, Remote, New York"
                  />
                </div>

                <div>
                  <label htmlFor="benefitsPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits Percentage (Optional)
                  </label>
                  <Input
                    id="benefitsPercentage"
                    type="number"
                    value={benefitsPercentage}
                    onChange={(e) => setBenefitsPercentage(e.target.value)}
                    placeholder="e.g., 20 (default: 20%)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="teamMembersJson" className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members (JSON Format) *
                </label>
                <Textarea
                  id="teamMembersJson"
                  value={teamMembersJson}
                  onChange={(e) => setTeamMembersJson(e.target.value)}
                  placeholder={`[
  {
    "name": "John Doe",
    "role": "Software Engineer",
    "base_salary": "120000",
    "equity_percentage": "0.5",
    "location": "San Francisco"
  },
  {
    "name": "Jane Smith",
    "role": "Product Manager",
    "base_salary": "130000",
    "equity_percentage": "0.3"
  }
]`}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Include: name, role, base_salary (annual), and optionally equity_percentage and location for each team member.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={calculateTeamCost}
                disabled={isCalculating || !teamMembersJson.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {isCalculating ? "Calculating Team Costs..." : "Calculate Team Costs"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Cost Analysis</h2>
                <p className="text-gray-600 mt-1">{teamCost.cost_per_employee.length} team members</p>
              </div>
              <Button
                onClick={() => {
                  setTeamCost(null)
                  setTeamMembersJson("")
                  setLocation("")
                  setBenefitsPercentage("")
                }}
                variant="outline"
              >
                Calculate New Team
              </Button>
            </div>

            {/* Total Team Costs */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Total Team Costs</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
                  <p className="text-4xl font-bold text-blue-900">{teamCost.total_team_costs.monthly}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
                  <p className="text-4xl font-bold text-green-900">{teamCost.total_team_costs.annual}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Salaries</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.total_team_costs.breakdown.salaries}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Benefits</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.total_team_costs.breakdown.benefits}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Taxes</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.total_team_costs.breakdown.taxes}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Equity</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.total_team_costs.breakdown.equity}</p>
                </div>
              </div>
            </div>

            {/* Cost Per Employee */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost Per Employee</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Benefits</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxes</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Annual</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamCost.cost_per_employee.map((employee, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{employee.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{employee.role}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{employee.base_salary}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{employee.benefits_cost}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{employee.taxes}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{employee.total_annual_cost}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{employee.total_monthly_cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost By Role */}
            {teamCost.cost_by_role.length > 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost By Role</h2>
                <div className="space-y-4">
                  {teamCost.cost_by_role.map((role, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.role}</h3>
                        <p className="text-sm text-gray-600">{role.count} {role.count === 1 ? 'person' : 'people'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{role.total_annual_cost}</p>
                        <p className="text-sm text-gray-600">Avg: {role.average_cost_per_person} per person</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden Costs */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Hidden Costs</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recruiting per hire</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.hidden_costs.recruiting}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Onboarding per hire</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.hidden_costs.onboarding}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Equipment/Software per employee/year</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.hidden_costs.equipment_software}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Office Space per employee/year</p>
                  <p className="text-xl font-bold text-gray-900">{teamCost.hidden_costs.office_space}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Hidden Costs (Annual)</p>
                <p className="text-2xl font-bold text-gray-900">{teamCost.hidden_costs.total_hidden_annual}</p>
              </div>
            </div>

            {/* Equity Impact */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Equity Impact</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Equity Allocated</p>
                  <p className="text-3xl font-bold text-gray-900">{teamCost.equity_impact.total_equity_allocated}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">At $10M Valuation</p>
                    <p className="text-xl font-bold text-gray-900">{teamCost.equity_impact.equity_value_at_10m_valuation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">At $50M Valuation</p>
                    <p className="text-xl font-bold text-gray-900">{teamCost.equity_impact.equity_value_at_50m_valuation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">At $100M Valuation</p>
                    <p className="text-xl font-bold text-gray-900">{teamCost.equity_impact.equity_value_at_100m_valuation}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-700">{teamCost.equity_impact.dilution_impact}</p>
              </div>
            </div>

            {/* Cost Optimization */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cost Optimization</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Remote vs. Office</h3>
                  <p className="text-gray-700">{teamCost.cost_optimization.remote_vs_office}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contractor vs. Employee</h3>
                  <p className="text-gray-700">{teamCost.cost_optimization.contractor_vs_employee}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Reduction Opportunities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {teamCost.cost_optimization.cost_reduction_opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
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

