#!/bin/bash
# Complete fix for server deployment issues
# Run this on your Hostinger server

cd ~/tool-thinker

echo "🔧 Fixing TypeScript errors..."

# 1. Fix consultation chat route (complete file)
cat > app/api/consultation/chat/route.ts << 'ENDOFFILE'
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
ENDOFFILE

# 2. Fix jsPDF import
sed -i '1s/^/import type { jsPDF } from '\''jspdf'\''\n\n/' lib/templates/businessModelCanvas.ts

echo "✅ Files fixed!"
echo ""
echo "🔨 Building app..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "▶️  Starting with PM2..."
    pm2 stop tool-thinker 2>/dev/null || true
    pm2 delete tool-thinker 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo ""
    echo "📊 Status:"
    pm2 status
    
    echo ""
    echo "🔗 Testing health endpoint..."
    sleep 2
    curl http://localhost:3000/api/health
else
    echo ""
    echo "❌ Build failed. Check errors above."
fi

