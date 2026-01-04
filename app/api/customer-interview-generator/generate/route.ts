import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CustomerInterviewGuide {
  business_context: {
    business_idea: string
    target_customer: string
    problem_hypothesis: string
  }
  interview_framework: {
    framework_name: string
    framework_description: string
    interview_objectives: string[]
  }
  pre_interview_preparation: {
    ideal_interviewees: string
    how_to_find_interviewees: string[]
    screening_questions: string[]
    interview_incentives: string[]
  }
  interview_questions: {
    opening_questions: string[]
    problem_validation_questions: string[]
    solution_validation_questions: string[]
    jobs_to_be_done_questions: string[]
    pain_point_questions: string[]
    current_solution_questions: string[]
    willingness_to_pay_questions: string[]
    closing_questions: string[]
  }
  interview_script: {
    introduction: string
    main_questions: Array<{
      question: string
      follow_ups: string[]
      what_to_listen_for: string
    }>
    closing: string
  }
  analysis_framework: {
    key_metrics_to_track: string[]
    signals_to_look_for: {
      positive_signals: string[]
      negative_signals: string[]
    }
    analysis_questions: string[]
    synthesis_template: string
  }
  tips_and_best_practices: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, targetCustomer, problemHypothesis } = await req.json()

    if (!businessIdea || !businessIdea.trim()) {
      return NextResponse.json(
        { error: "Business idea is required" },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_key_here") {
      console.error("OpenAI API key not configured")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env" },
        { status: 500 }
      )
    }

    const prompt = `You are an expert in customer development and Jobs-to-be-Done methodology. Create a comprehensive customer interview guide based on the following business context.

Business Context:
- Business Idea: ${businessIdea}
${targetCustomer ? `- Target Customer: ${targetCustomer}` : ""}
${problemHypothesis ? `- Problem Hypothesis: ${problemHypothesis}` : ""}

Create a complete customer interview guide that includes:

1. INTERVIEW FRAMEWORK
   - Framework name (e.g., "Jobs-to-be-Done", "Problem-Solution Fit", "Customer Discovery")
   - Framework description
   - Interview objectives (what you want to learn)

2. PRE-INTERVIEW PREPARATION
   - Ideal interviewee profile
   - How to find interviewees (5-7 methods)
   - Screening questions to identify right interviewees
   - Interview incentives ideas

3. INTERVIEW QUESTIONS (8 categories)
   - Opening questions (warm-up, build rapport)
   - Problem validation questions (do they have this problem?)
   - Solution validation questions (would they use this solution?)
   - Jobs-to-be-Done questions (what job are they trying to get done?)
   - Pain point questions (what frustrates them?)
   - Current solution questions (how do they solve this now?)
   - Willingness to pay questions (would they pay for this?)
   - Closing questions (wrap up, referrals)

4. INTERVIEW SCRIPT
   - Introduction script
   - Main questions with follow-ups and what to listen for
   - Closing script

5. ANALYSIS FRAMEWORK
   - Key metrics to track
   - Positive signals to look for
   - Negative signals to watch out for
   - Analysis questions to ask yourself
   - Synthesis template for organizing findings

6. TIPS AND BEST PRACTICES
   - 10-15 practical tips for conducting effective interviews

Return a JSON object with this exact structure:
{
  "business_context": {
    "business_idea": "string",
    "target_customer": "string",
    "problem_hypothesis": "string"
  },
  "interview_framework": {
    "framework_name": "string",
    "framework_description": "string",
    "interview_objectives": ["objective 1", "objective 2"]
  },
  "pre_interview_preparation": {
    "ideal_interviewees": "string",
    "how_to_find_interviewees": ["method 1", "method 2"],
    "screening_questions": ["question 1", "question 2"],
    "interview_incentives": ["incentive 1", "incentive 2"]
  },
  "interview_questions": {
    "opening_questions": ["question 1"],
    "problem_validation_questions": ["question 1"],
    "solution_validation_questions": ["question 1"],
    "jobs_to_be_done_questions": ["question 1"],
    "pain_point_questions": ["question 1"],
    "current_solution_questions": ["question 1"],
    "willingness_to_pay_questions": ["question 1"],
    "closing_questions": ["question 1"]
  },
  "interview_script": {
    "introduction": "string",
    "main_questions": [
      {
        "question": "string",
        "follow_ups": ["follow-up 1"],
        "what_to_listen_for": "string"
      }
    ],
    "closing": "string"
  },
  "analysis_framework": {
    "key_metrics_to_track": ["metric 1"],
    "signals_to_look_for": {
      "positive_signals": ["signal 1"],
      "negative_signals": ["signal 1"]
    },
    "analysis_questions": ["question 1"],
    "synthesis_template": "string"
  },
  "tips_and_best_practices": ["tip 1", "tip 2"]
}

Make it practical, actionable, and based on proven customer development methodologies.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in customer development and Jobs-to-be-Done methodology. Always return valid JSON matching the requested schema. Do not include markdown code blocks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content || ""
    
    try {
      const guide: CustomerInterviewGuide = JSON.parse(content)
      
      if (!guide.interview_questions || !guide.interview_script) {
        return NextResponse.json(
          { error: "Invalid interview guide structure" },
          { status: 500 }
        )
      }

      return NextResponse.json(guide)
    } catch (parseError) {
      console.error("Failed to parse interview guide:", parseError)
      console.error("Raw AI response:", content)
      
      try {
        const repairCompletion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Fix this JSON and return only valid JSON without markdown:\n\n${content}`,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        })
        const repaired = repairCompletion.choices[0]?.message?.content || ""
        const guide: CustomerInterviewGuide = JSON.parse(repaired)
        return NextResponse.json(guide)
      } catch (repairError) {
        console.error("Failed to repair JSON:", repairError)
        return NextResponse.json(
          { error: "Failed to generate interview guide. Please try again." },
          { status: 500 }
        )
      }
    }
  } catch (error: any) {
    console.error("Customer Interview Generator error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate interview guide" },
      { status: 500 }
    )
  }
}

