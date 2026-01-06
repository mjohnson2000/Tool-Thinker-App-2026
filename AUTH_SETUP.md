# Authentication & Data Persistence Setup Guide

This guide will help you set up user authentication and data persistence for Tool Thinker.

## Prerequisites

1. Supabase project with authentication enabled
2. Supabase URL and anon key in your `.env` file

## Step 1: Install Dependencies

```bash
npm install @supabase/ssr
```

## Step 2: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `lib/supabase/schema-tool-outputs.sql` to create the necessary tables:
   - `tool_outputs` - Stores generated content from tools
   - `tool_history` - Tracks all tool usage
   - `user_preferences` - Stores user preferences

## Step 3: Configure Authentication Providers (Optional)

To enable social login (Google/GitHub):

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google and/or GitHub providers
3. Configure OAuth credentials:
   - **Google**: Add your OAuth client ID and secret
   - **GitHub**: Add your OAuth app client ID and secret
4. Add redirect URLs:
   - `http://localhost:3001/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Step 4: Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/signin`
3. Try signing up with email/password
4. Try social login (if configured)

## Step 6: Using the Save Hook in Tools

To automatically save tool outputs, use the `useSaveToolOutput` hook:

```typescript
import { useSaveToolOutput } from "@/hooks/useSaveToolOutput"

export default function MyToolPage() {
  const { saveOutput, saving } = useSaveToolOutput()
  const [result, setResult] = useState(null)

  async function generateOutput() {
    // ... generate output ...
    const output = await generate()
    setResult(output)

    // Save automatically
    await saveOutput({
      toolId: "my-tool",
      toolName: "My Tool",
      outputData: output,
      inputData: { /* user inputs */ },
      metadata: { /* any additional data */ }
    })
  }

  return (
    <div>
      {/* Your tool UI */}
      {saving && <p>Saving...</p>}
    </div>
  )
}
```

## Features Implemented

✅ Email/password authentication
✅ Social login (Google, GitHub)
✅ User session management
✅ Save tool outputs
✅ View history of saved outputs
✅ Delete saved outputs
✅ User profile menu in navigation
✅ Protected routes (via middleware)

## Next Steps

- Add password reset functionality
- Add email verification
- Add user profile page
- Add settings page
- Add export functionality for saved outputs

