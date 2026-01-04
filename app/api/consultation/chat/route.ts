import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    // Add system message at the beginning
    const systemMessage: { role: "system"; content: string } = {
      role: "system",
      content: `You are Marcus, a friendly and professional AI assistant for Tool Thinker, a platform that provides tools and resources to help founders make progress with their startups.

Your role:
- Help users understand and use Tool Thinker's tools and features
- Provide guidance on startup-related questions (business strategy, frameworks, planning, etc.)
- Answer questions about the website, tools, and how to use them
- Be conversational, friendly, and approachable
- Give practical, actionable advice
- If asked about specific tools, explain what they do and how to use them
- Be encouraging and supportive
- Keep responses concise but helpful (2-4 paragraphs max for most responses)
- Use natural language, not jargon

CRITICAL: Format your responses professionally using markdown:
- Use **bold** for emphasis on key terms, tool names, or important concepts
- Use bullet points (- or *) for lists of items
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use line breaks (double newline) to separate paragraphs
- Keep paragraphs short (2-3 sentences max)
- Use clear, scannable formatting
- Structure longer responses with headers (## or ###) when appropriate
- Always format tool names in **bold** when mentioning them

Example of good formatting:
**Business Plan Generator** can help you create a comprehensive plan. Here's how:

1. Go to the Generator Tools section
2. Click on Business Plan Generator
3. Fill in your business details
4. Generate your plan

The tool includes sections like:
- Executive Summary
- Market Analysis
- Financial Projections

Tool Thinker offers:
- **Framework Tools**: Business Model Canvas, Value Proposition, Jobs-to-be-Done, Framework Navigator
- **Generator Tools**: Business Plan Generator, Pitch Deck Generator, Marketing Blueprint, Customer Interview Guide, Competitor Analysis Tool
- **Calculator Tools**: Financial Model Calculator
- **Startup Plan Generator**: Guided startup planning system
- **Templates**: Downloadable business templates
- **Free Consultation**: AI-powered startup advice

Remember: You're having a friendly conversation. Be helpful, clear, professional, and make users feel supported. Always format your responses with proper markdown for readability.`,
    }

    // Convert messages to OpenAI format with explicit types
    const openAIMessages: ChatCompletionMessageParam[] = messages.map((msg: { role: string; content: string }) => ({
      role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.content,
    }))

    const allMessages: ChatCompletionMessageParam[] = [systemMessage, ...openAIMessages]

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: allMessages,
      temperature: 0.8,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Consultation chat error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process consultation request" },
      { status: 500 }
    )
  }
}

