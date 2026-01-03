# Tool Thinker - Start Smart OS

Turn your messy idea into a validated, structured, executable startup plan.

## Overview

Start Smart OS is a guided startup co-pilot that:
- Collects structured user input through framework-based questions
- Applies proven thinking patterns (JTBD, Value Prop, Business Model)
- Uses AI to synthesize outputs
- Saves progress and enables iteration
- Feeds learning loops back into the system

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + Custom Components
- **AI**: OpenAI API (streaming)
- **Database**: In-memory store (replace with Supabase/Prisma for production)
- **Auth**: Mock user (replace with Supabase Auth/Clerk)

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file:
```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app
  /api              # API routes
  /dashboard        # Dashboard page
  /project          # Project pages
    /[projectId]
      /overview     # Project overview
      /step/[stepId] # Step pages
/components         # React components
/lib
  /frameworks       # Framework definitions
  /ai              # AI integration
  /db              # Database client
/types             # TypeScript types
```

## Framework System

Frameworks are defined as data structures with:
- Questions (inputs)
- Completeness validation
- Output schemas
- Prompt templates

Current frameworks:
1. **JTBD** - Problem Clarity (Jobs To Be Done)
2. **Value Prop** - Value Proposition
3. **Business Model** - Business Model Design

## Features

- ✅ Guided step-by-step flow
- ✅ AI-powered output generation (streaming)
- ✅ Editable outputs with versioning
- ✅ Progress tracking
- ✅ Export to Markdown
- ✅ Framework-based structure

## Next Steps

- [ ] Add authentication (Supabase Auth or Clerk)
- [ ] Replace in-memory DB with Supabase/Prisma
- [ ] Add more frameworks (GTM, Risks, Execution Plan)
- [ ] Implement feedback loop
- [ ] Add paywall/tier system
- [ ] Improve error handling
- [ ] Add analytics/events tracking

## Development Notes

- The database client (`lib/db/client.ts`) uses an in-memory store for development
- Replace with actual database calls for production
- Mock user ID is hardcoded - replace with real auth
- AI streaming is implemented but may need refinement for edge cases



