import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

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

    // Convert messages to OpenAI format
    const openAIMessages = messages.map((msg: { role: string; content: string }) => ({
      role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: msg.content,
    }))

    // Add system message at the beginning
    const systemMessage = {
      role: "system" as const,
      content: `You are a friendly, experienced startup consultant having a natural conversation with a founder. You're here to help, not to lecture or overwhelm with frameworks.

Your approach:
- Talk like a trusted advisor, not a textbook
- Have a real conversation - ask follow-up questions, show genuine interest
- Give practical advice based on real-world experience
- Be empathetic and understanding of the founder's challenges
- Keep it conversational and easy to understand
- Only mention frameworks or methodologies if they're genuinely helpful to solve the specific problem
- Focus on the founder's actual situation, not generic advice
- Be encouraging but realistic
- Use natural language, not business jargon unless necessary
- Break down complex ideas into simple, relatable terms

Remember: You're having a chat, not giving a presentation. Make it feel like talking to a knowledgeable friend who's been there before.`,
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [systemMessage, ...openAIMessages],
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

