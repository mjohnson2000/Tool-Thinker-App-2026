export function generateBusinessModelCanvasPDF(jsPDFClass: typeof jsPDF) {
  const doc = new jsPDFClass("landscape") // Use landscape orientation for better fit
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const canvasWidth = pageWidth - 2 * margin
  const canvasHeight = pageHeight - 2 * margin - 25

  // Title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("Business Model Canvas", pageWidth / 2, 12, { align: "center" })

  // Calculate grid dimensions - Standard BMC layout
  // Left column: 25%, Center: 50%, Right column: 25%
  const leftColumnWidth = canvasWidth * 0.25
  const centerWidth = canvasWidth * 0.5
  const rightColumnWidth = canvasWidth * 0.25
  const cellHeight = canvasHeight / 4 // 4 equal rows
  
  const leftX = margin
  const centerX = margin + leftColumnWidth
  const rightX = margin + leftColumnWidth + centerWidth
  const startY = margin + 20

  // Draw grid lines - professional clean lines
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)

  // Vertical lines (separating columns)
  doc.line(leftX, startY, leftX, startY + canvasHeight)
  doc.line(centerX, startY, centerX, startY + canvasHeight)
  doc.line(rightX, startY, rightX, startY + canvasHeight)
  doc.line(margin + canvasWidth, startY, margin + canvasWidth, startY + canvasHeight)

  // Horizontal lines (separating rows)
  for (let i = 0; i <= 4; i++) {
    const y = startY + i * cellHeight
    doc.line(leftX, y, margin + canvasWidth, y)
  }
  
  // Thicker border for Value Propositions center section
  doc.setLineWidth(1.5)
  doc.rect(centerX, startY, centerWidth, canvasHeight)
  doc.setLineWidth(0.5)

  // Helper function to add text in a cell
  function addCellText(x: number, y: number, width: number, height: number, title: string, description: string = "") {
    const padding = 10
    const textX = x + padding
    const textY = y + padding + 7
    const textWidth = width - 2 * padding

    // Title with subtle background
    doc.setFillColor(245, 245, 245)
    doc.rect(x + 1, y + 1, width - 2, 14, "F")
    
    // Title - bold and professional
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    const titleLines = doc.splitTextToSize(title, textWidth)
    doc.text(titleLines, textX, textY)

    // Description - italic and smaller
    let descLines: string[] = []
    if (description) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      const descY = textY + titleLines.length * 6 + 4
      descLines = doc.splitTextToSize(description, textWidth)
      doc.text(descLines, textX, descY)
      doc.setTextColor(0, 0, 0)
    }

    // Add lines for notes - clean and professional
    const notesStartY = description 
      ? textY + titleLines.length * 6 + descLines.length * 5 + 10
      : textY + titleLines.length * 6 + 8
    
    const lineSpacing = 6
    const availableHeight = y + height - notesStartY - 8
    const numLines = Math.floor(availableHeight / lineSpacing)
    
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.2)
    for (let i = 0; i < Math.min(numLines, 12); i++) {
      const lineY = notesStartY + i * lineSpacing
      if (lineY < y + height - 8) {
        doc.line(textX, lineY, textX + textWidth, lineY)
      }
    }
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
  }

  // Left Column (top to bottom)
  addCellText(leftX, startY, leftColumnWidth, cellHeight, "Key Partners", "Who are your key partners?")
  addCellText(leftX, startY + cellHeight, leftColumnWidth, cellHeight, "Key Activities", "What key activities does your value proposition require?")
  addCellText(leftX, startY + 2 * cellHeight, leftColumnWidth, cellHeight, "Key Resources", "What key resources does your value proposition require?")
  addCellText(leftX, startY + 3 * cellHeight, leftColumnWidth, cellHeight, "Cost Structure", "What are the most important costs?")

  // Center - Value Propositions (large, spans all 4 rows)
  doc.setLineWidth(1.5)
  doc.setDrawColor(0, 0, 0)
  doc.rect(centerX, startY, centerWidth, canvasHeight)
  doc.setLineWidth(0.5)
  addCellText(centerX, startY, centerWidth, canvasHeight, "Value Propositions", "What value do you deliver to customers?")

  // Right Column (top to bottom)
  addCellText(rightX, startY, rightColumnWidth, cellHeight, "Customer Relationships", "What type of relationship do you establish with customers?")
  addCellText(rightX, startY + cellHeight, rightColumnWidth, cellHeight, "Channels", "Through which channels do you reach customers?")
  addCellText(rightX, startY + 2 * cellHeight, rightColumnWidth, cellHeight, "Customer Segments", "Who are your target customers?")
  addCellText(rightX, startY + 3 * cellHeight, rightColumnWidth, cellHeight, "Revenue Streams", "How does your business make money?")

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Tool Thinker - Business Model Canvas Template", pageWidth / 2, pageHeight - 5, { align: "center" })

  return doc
}

