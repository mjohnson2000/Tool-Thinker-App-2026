import { OpenAI } from "openai"
import { buildPrompt, repairJsonPrompt } from "./promptTemplates"
import type { Framework } from "@/types/frameworks"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStreaming(
  framework: Framework,
  inputs: Record<string, any>
): Promise<ReadableStream<Uint8Array>> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.")
  }

  const prompt = buildPrompt(framework, inputs)

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a startup strategist. Always return valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Stream processing error:", error)
          controller.error(error)
        }
      },
    })

    return stream
  } catch (error: any) {
    console.error("OpenAI API call failed:", error)
    
    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env")
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.")
    } else if (error.status === 500) {
      throw new Error("OpenAI API server error. Please try again later.")
    } else {
      throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`)
    }
  }
}

export async function generateAndParse(
  framework: Framework,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
    throw new Error("OpenAI API key is not configured")
  }

  const prompt = buildPrompt(framework, inputs)

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a startup strategist. Always return valid JSON matching the requested schema.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content || ""
  
  // Try to parse JSON
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
    const jsonStr = jsonMatch[1] || content
    return JSON.parse(jsonStr.trim())
  } catch (error) {
    // Try repair
    try {
      const repairCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: repairJsonPrompt(content),
          },
        ],
        temperature: 0.3,
      })
      const repaired = repairCompletion.choices[0]?.message?.content || ""
      return JSON.parse(repaired.trim())
    } catch (repairError) {
      throw new Error(`Failed to parse AI output: ${error}`)
    }
  }
}



