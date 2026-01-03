"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import { templates, getAllCategories, type Template } from "@/lib/templates"

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const categories = ["All", ...getAllCategories()]

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  function handleDownload(template: Template) {
    try {
      template.generatePDF(jsPDF)
    } catch (error: any) {
      console.error("Failed to generate template:", error)
      alert(`Failed to download template: ${error.message || "Unknown error"}. Please check the console for details.`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Downloadable Templates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready-to-use templates for various business needs. Download, customize, and use them for your startup.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </span>
                  <Button
                    onClick={() => handleDownload(template)}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600">No templates found in this category.</p>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More Templates Coming Soon</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Planning & Strategy</h3>
              <ul className="space-y-1">
                <li>• Lean Canvas</li>
                <li>• Value Proposition Canvas</li>
                <li>• SWOT Analysis</li>
                <li>• One-Page Business Plan</li>
                <li>• Pitch Deck Template</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Product Development</h3>
              <ul className="space-y-1">
                <li>• MVP Planning</li>
                <li>• User Story Template</li>
                <li>• Product Roadmap</li>
                <li>• Customer Journey Map</li>
                <li>• Empathy Map</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Marketing & Growth</h3>
              <ul className="space-y-1">
                <li>• Marketing Plan</li>
                <li>• Content Calendar</li>
                <li>• Growth Hacking Playbook</li>
                <li>• Marketing Funnel</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Finance & Operations</h3>
              <ul className="space-y-1">
                <li>• Financial Projections</li>
                <li>• Unit Economics Calculator</li>
                <li>• Budget Template</li>
                <li>• OKR Template</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
