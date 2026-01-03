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
        controller.error(error)
      }
    },
  })

  return stream
}

export async function generateAndParse(
  framework: Framework,
  inputs: Record<string, any>
): Promise<Record<string, any>> {
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



