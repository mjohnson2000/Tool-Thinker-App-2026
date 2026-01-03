# Quick Start Guide

## What You've Built

You now have a complete **Start Smart OS** MVP - a guided startup automation engine that:

1. **Collects structured input** through framework-based questions
2. **Applies proven thinking patterns** (JTBD, Value Prop, Business Model)
3. **Generates AI-powered outputs** with streaming responses
4. **Saves progress** and enables iteration
5. **Exports startup briefs** in Markdown format
6. **Tracks feedback** for continuous improvement

## System Architecture

```
User Input → Framework Engine → AI Synthesis → Outputs → Feedback Loop
```

### Key Components

- **Framework Engine** (`lib/frameworks/`): Reusable framework definitions
- **AI Layer** (`lib/ai/`): Streaming generation with JSON parsing
- **Database Client** (`lib/db/`): In-memory store (replace with real DB)
- **UI Components**: StepShell, QuestionForm, OutputEditor, ProgressBar
- **API Routes**: Projects, Steps, AI Generation, Export, Feedback

## Next Steps to Run

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment**:
```bash
cp .env.example .env.local
# Add your OPENAI_API_KEY
```

3. **Run development server**:
```bash
npm run dev
```

4. **Open** http://localhost:3000

## How to Use

1. **Create a project** from the dashboard
2. **Navigate through steps**:
   - Step 1: Problem Clarity (JTBD)
   - Step 2: Value Proposition
   - Step 3: Business Model
3. **Fill in inputs** for each step
4. **Generate outputs** using AI
5. **Edit outputs** as needed
6. **Export** your startup brief

## Customization Points

### Add More Frameworks

1. Create a new file in `lib/frameworks/` (e.g., `gtm.ts`)
2. Follow the pattern from existing frameworks
3. Add to `FRAMEWORK_ORDER` in `lib/frameworks/index.ts`

### Replace Database

The in-memory store in `lib/db/client.ts` is a placeholder. Replace with:
- **Supabase**: Use `@supabase/supabase-js`
- **Prisma**: Use Prisma ORM
- **Direct Postgres**: Use `pg` library

### Add Authentication

Currently uses mock user ID. Replace with:
- **Supabase Auth**: Built-in auth helpers
- **Clerk**: `@clerk/nextjs`
- **NextAuth**: `next-auth`

### Improve AI Prompts

Edit prompt templates in:
- `lib/frameworks/*.ts` (framework-specific prompts)
- `lib/ai/promptTemplates.ts` (shared utilities)

## Production Checklist

- [ ] Replace in-memory DB with real database
- [ ] Add authentication
- [ ] Set up environment variables properly
- [ ] Add error boundaries
- [ ] Implement rate limiting
- [ ] Add analytics/event tracking
- [ ] Set up CI/CD
- [ ] Add tests
- [ ] Configure domain and hosting

## System Philosophy

**Tool Thinker is not teaching people how to think.**
**It is embedding thinking into the startup process itself.**

The system works because:
- Frameworks provide structure (deterministic)
- AI provides language (generative)
- Feedback loops improve over time (learning)

This is your moat.



