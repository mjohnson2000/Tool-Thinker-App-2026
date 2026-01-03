import type { jsPDF } from "jspdf"
import { generateBusinessModelCanvasPDF } from "./businessModelCanvas"

export interface Template {
  id: string
  title: string
  description: string
  category: string
  icon: string
  generatePDF: (jsPDFClass: typeof jsPDF) => void
}

export const templates: Template[] = [
  {
    id: "business-model-canvas",
    title: "Business Model Canvas",
    description: "Visual template for mapping your business model with 9 key building blocks",
    category: "Planning & Strategy",
    icon: "📊",
    generatePDF: (jsPDFClass: typeof jsPDF) => {
      const doc = generateBusinessModelCanvasPDF(jsPDFClass)
      doc.save("business-model-canvas.pdf")
    },
  },
  // More templates will be added here
]

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(templates.map((t) => t.category)))
}

