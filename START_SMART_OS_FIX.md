# Start Smart OS Error Fix Guide

## Common Errors

### 1. API Returns Error Object Instead of Array
**Symptom**: Page shows error or crashes when loading

**Fix Applied**: Added proper error handling to check for error responses

### 2. Supabase Not Configured
**Symptom**: API returns 500 error, "Failed to fetch projects"

**Check**:
```bash
# On server
cd ~/tool-thinker
cat .env | grep SUPABASE
```

**Fix**: Add Supabase credentials to `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Tables Not Created
**Symptom**: API returns database errors

**Fix**: Run the schema SQL in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `lib/supabase/schema.sql`
3. Run the SQL to create tables

### 4. Network/Connection Issues
**Symptom**: "Failed to load projects" error

**Check**:
```bash
# Test API endpoint
curl http://localhost:3000/api/projects

# Check PM2 logs
pm2 logs tool-thinker --err --lines 50
```

## Quick Fix on Server

### Option 1: Pull from GitHub
```bash
cd ~/tool-thinker
git pull origin main
npm run build
pm2 restart tool-thinker
```

### Option 2: Manual Update
```bash
cd ~/tool-thinker
nano app/tools/start-smart-os/page.tsx
```

**Add error state** (after line 19):
```typescript
const [error, setError] = useState<string | null>(null)
```

**Update loadProjects function** (around line 25):
```typescript
async function loadProjects() {
  try {
    setError(null)
    const res = await fetch("/api/projects")
    const data = await res.json()
    
    // Check if response contains an error
    if (data.error) {
      console.error("API Error:", data.error)
      setError(data.error)
      setProjects([])
      return
    }
    
    // Check HTTP status
    if (!res.ok) {
      setError(data.error || "Failed to load projects")
      setProjects([])
      return
    }
    
    // Ensure data is an array
    if (Array.isArray(data)) {
      setProjects(data)
    } else {
      setError("Unexpected response format")
      setProjects([])
    }
  } catch (error: any) {
    console.error("Failed to load projects:", error)
    setError(error.message || "Failed to load projects. Please check your connection.")
    setProjects([])
  } finally {
    setLoading(false)
  }
}
```

**Add error display** (before the projects list, around line 135):
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <p className="text-red-800 text-sm font-semibold mb-1">Error loading projects</p>
    <p className="text-red-600 text-sm">{error}</p>
    <button
      onClick={loadProjects}
      className="mt-2 text-sm text-red-800 underline hover:text-red-900"
    >
      Try again
    </button>
  </div>
)}
```

**Update createProject function** (around line 37):
```typescript
async function createProject() {
  if (!newProjectName.trim()) return

  setIsCreating(true)
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjectName }),
    })
    
    const data = await res.json()
    
    // Check if response contains an error
    if (data.error) {
      console.error("API Error:", data.error)
      alert(`Failed to create project: ${data.error}`)
      return
    }
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to create project")
    }
    
    const project = data
    setProjects([...projects, project])
    setNewProjectName("")
    window.location.href = `/project/${project.id}/overview`
  } catch (error: any) {
    console.error("Failed to create project:", error)
    alert(`Failed to create project: ${error.message || "Unknown error"}`)
  } finally {
    setIsCreating(false)
  }
}
```

Then rebuild:
```bash
npm run build
pm2 restart tool-thinker
```

## Diagnostic Script

Run on server to diagnose the issue:
```bash
bash fix-start-smart-os-error.sh
```

## Most Common Issue

**Supabase not configured** - The Start Smart OS tool requires Supabase to store projects. Make sure:
1. Supabase project is created
2. Environment variables are set in `.env`
3. Database tables are created (run `lib/supabase/schema.sql`)
4. Restart the app after setting environment variables

