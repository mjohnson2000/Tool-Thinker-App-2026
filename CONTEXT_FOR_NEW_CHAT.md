# Complete Context for New Chat Session

## 🎯 Project Overview
**Tool Thinker** - A startup planning application that helps founders build structured business plans through guided frameworks and AI-powered tools.

**Tech Stack:**
- Next.js 14.2.0 (App Router)
- TypeScript
- React 18.3.0
- Supabase (Auth & Database)
- Tailwind CSS
- OpenAI API (GPT-4o-mini)

---

## 📋 Recent Work Completed (This Session)

### Phase 1 & 2 Implementation - COMPLETED ✅

#### 1. Progress Indicators Within Steps
- ✅ Question counter (1, 2, 3...)
- ✅ Step progress bar (X% complete)
- ✅ "X / Y answered" counter
- **Location:** `app/project/[projectId]/step/[stepId]/page.tsx`

#### 2. Step Guidance
- ✅ Help text (expandable) for each question
- ✅ Examples (expandable) for each question
- ✅ Real-time validation feedback
- ✅ Green borders for answered questions
- ✅ Character counters for minLength fields
- **Location:** `components/QuestionForm.tsx`, `lib/frameworks/jtbd.ts`

#### 3. Save Visibility
- ✅ Save status indicator ("Saving..." / "Saved" / "Saved 2m ago")
- ✅ Last saved timestamp
- ✅ Auto-save on change
- **Location:** `app/project/[projectId]/step/[stepId]/page.tsx`

#### 4. Step Dependencies
- ✅ Steps locked until previous step is complete
- ✅ Lock icons on overview page
- ✅ Redirect with message if trying to access locked step
- **Location:** `app/project/[projectId]/step/[stepId]/page.tsx`, `app/project/[projectId]/overview/page.tsx`

#### 5. Field Validation
- ✅ Required field validation
- ✅ Minimum length validation
- ✅ Real-time error messages
- ✅ Visual feedback (red borders for errors)
- **Location:** `components/QuestionForm.tsx`

#### 6. Export Options
- ✅ Markdown export (`.md`)
- ✅ Word document export (`.doc` - HTML format)
- ✅ Google Docs export (instructions provided)
- ✅ Share link generation (30-day expiry, read-only)
- ✅ Export modal with all options
- **Location:** 
  - `app/api/export/route.ts` (Markdown)
  - `app/api/export/word/route.ts` (Word)
  - `app/api/projects/[projectId]/share/route.ts` (Share link)
  - `app/project/[projectId]/overview/page.tsx` (UI)

#### 7. Time Estimates & Completion Clarity
- ✅ Time estimates added to all frameworks (15-20 min, 10-15 min)
- ✅ Time estimate banner on step pages
- ✅ Completion banner when step is complete
- ✅ Completion checklist
- **Location:**
  - `types/frameworks.ts` (added `timeEstimate` field)
  - `lib/frameworks/jtbd.ts`, `valueProp.ts`, `businessModel.ts` (time estimates)
  - `app/project/[projectId]/step/[stepId]/page.tsx` (UI)

---

## 🔧 Current Issues & Status

### Active Issue: Webpack Chunk Loading Error
**Error:** `Cannot find module './8948.js'`

**Status:** Being fixed
- **Root Cause:** Corrupted webpack build cache
- **Attempted Fixes:**
  1. ✅ Deleted `.next` folder
  2. ✅ Cleared `node_modules/.cache` and `.swc`
  3. ✅ Updated `next.config.js` with webpack optimizations:
     - Changed to `named` module IDs in development
     - Added `chunkIds: 'named'` for better chunk tracking
- **Current State:** Dev server restarting with new webpack config
- **Next Steps:** Wait for rebuild, test if error persists

**Files Modified:**
- `next.config.js` - Added webpack optimization config

---

## 📁 Key Files & Their Purpose

### Core Application Files
- `app/page.tsx` - Home page with path selection (3 options: Project, Discovery, Explore)
- `app/dashboard/page.tsx` - User dashboard with projects list
- `app/project/[projectId]/overview/page.tsx` - Project overview with steps, health score, export options
- `app/project/[projectId]/step/[stepId]/page.tsx` - Individual step page with questions, validation, progress

### Framework Definitions
- `lib/frameworks/jtbd.ts` - Jobs To Be Done framework (15-20 min)
- `lib/frameworks/valueProp.ts` - Value Proposition framework (10-15 min)
- `lib/frameworks/businessModel.ts` - Business Model framework (15-20 min)
- `lib/frameworks/index.ts` - Framework registry and order
- `types/frameworks.ts` - TypeScript interfaces (Question, Framework, etc.)

### Components
- `components/QuestionForm.tsx` - Form component with help text, examples, validation
- `components/StepShell.tsx` - Wrapper for step pages with progress bar
- `components/OutputEditor.tsx` - Editor for AI-generated output
- `components/OnboardingTooltip.tsx` - Tooltip system for onboarding
- `components/ProjectOnboarding.tsx` - Project path onboarding
- `components/DiscoveryOnboarding.tsx` - Discovery path onboarding
- `components/ToolsOnboarding.tsx` - Tools exploration onboarding

### API Routes
- `app/api/export/route.ts` - Markdown export
- `app/api/export/word/route.ts` - Word document export
- `app/api/projects/[projectId]/share/route.ts` - Share link generation
- `app/api/ai/generate/route.ts` - AI output generation
- `app/api/steps/route.ts` - Step data management

### Configuration
- `next.config.js` - Next.js config with webpack optimizations
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `.env` - Environment variables (Supabase, OpenAI)

---

## 🗄️ Database Schema (Supabase)

### Key Tables
- `projects` - User projects
- `steps` - Project steps (JTBD, Value Prop, Business Model)
- `step_inputs` - User answers to questions
- `step_outputs` - AI-generated outputs
- `tool_outputs` - Outputs from standalone tools
- `tool_output_references` - Links between tool outputs and projects
- `user_preferences` - User settings and onboarding state
- `project_notes` - Notes attached to projects
- `project_tags` - Tags for projects

---

## 🚀 User Journey Flow

### Path 1: "I Have a Business Idea"
1. Home → Select "I have a business idea"
2. Dashboard → Create project
3. Project Overview → See 3 steps
4. Step 1 (JTBD) → Answer questions → Generate output
5. Step 2 (Value Prop) → Answer questions → Generate output
6. Step 3 (Business Model) → Answer questions → Generate output
7. Completion → Export options → "What's Next?" section

### Path 2: "I Need to Discover an Idea"
1. Home → Select "I need to discover an idea"
2. Idea Discovery Tool → 9-step journey
3. Summary → Create Project (pre-fills JTBD)
4. Continue with Path 1 from step 2

### Path 3: "Just Explore Tools"
1. Home → Select "I just want to explore tools"
2. Tools Page → Browse 50+ tools
3. Use tools standalone or link to projects

---

## ✅ Completed Features

### Onboarding
- ✅ Path selection on home page
- ✅ Contextual tooltips for each path
- ✅ Project onboarding flow
- ✅ Discovery onboarding flow
- ✅ Tools onboarding flow

### Project Management
- ✅ Project creation
- ✅ Step-by-step workflow
- ✅ Progress tracking
- ✅ Health score calculation
- ✅ Notes and tags
- ✅ Activity feed

### Step Workflow
- ✅ Question forms with validation
- ✅ Help text and examples
- ✅ Auto-save
- ✅ Step dependencies (locking)
- ✅ AI output generation
- ✅ Output editing
- ✅ Completion tracking

### Export & Sharing
- ✅ Markdown export
- ✅ Word document export
- ✅ Share link generation
- ✅ Export modal UI

---

## ⚠️ Known Issues

### 1. Webpack Chunk Loading (Active)
- **Error:** `Cannot find module './8948.js'`
- **Status:** Fix in progress (webpack config updated)
- **Impact:** Blank UI, server errors

### 2. TypeScript Type Safety (Non-Critical)
- 20+ API routes still use `catch (error: any)` instead of `catch (error: unknown)`
- **Files:** Various API routes in `app/api/`
- **Priority:** Low (can be fixed in future refactoring)

### 3. Console.error Usage (Non-Critical)
- 115+ instances of `console.error`/`console.log`
- **Recommendation:** Replace with logger utility in API routes
- **Priority:** Low

---

## 🔄 Pending Tasks

### From Original TODO List
- ⏳ PDF export functionality (Phase 1 - pending)
- ⏳ Add more contextual examples to other frameworks (Phase 2 - pending)

### Potential Improvements
- Project templates (SaaS, E-commerce, Service)
- Mobile optimization
- Collaboration features
- Gamification elements

---

## 🛠️ Development Environment

### Local Development Server
- **Port:** 3001 (configured in `package.json`)
- **Dev Command:** `npm run dev`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **URL:** http://localhost:3001

---

## 🌐 Production Server (Online Deployment)

### Server Details
- **Server IP:** `72.62.170.11`
- **Production URL:** http://72.62.170.11
- **Server Path:** `/root/tool-thinker`
- **SSH Access:** `root@72.62.170.11`
- **Port:** 3000 (production)
- **Process Manager:** PM2
- **PM2 App Name:** `tool-thinker`

### Production Configuration
- **Environment:** Production (`NODE_ENV=production`)
- **Port:** 3000 (configured in `ecosystem.config.js`)
- **Instances:** 1 (single instance, can be scaled)
- **Memory Limit:** 500MB (auto-restart if exceeded)
- **Auto-restart:** Enabled
- **Logs Location:** `./logs/pm2-error.log` and `./logs/pm2-out.log`

### Deployment Process

#### Method 1: Clean Deployment (Recommended)
**Script:** `scripts/RUN_ON_SERVER_CLEAN_DEPLOY.sh`

**Steps:**
1. SSH into server: `ssh root@72.62.170.11`
2. Navigate to app: `cd /root/tool-thinker`
3. Run deployment script: `bash scripts/RUN_ON_SERVER_CLEAN_DEPLOY.sh`

**What it does:**
- Stops and deletes existing PM2 process
- Cleans all caches (`.next`, `node_modules/.cache`, `.swc`)
- Pulls latest code from GitHub (`origin/main`)
- Clean installs dependencies
- Builds the application
- Starts PM2 with production config
- Saves PM2 configuration

#### Method 2: Quick Update
**Script:** `scripts/update-server.sh`

**Steps:**
1. SSH into server
2. Run: `bash scripts/update-server.sh`

**What it does:**
- Pulls latest code
- Installs dependencies
- Rebuilds
- Restarts PM2

#### Method 3: Local Deploy Script
**Script:** `scripts/deploy.sh`

**Run locally:**
```bash
npm run deploy
```

**What it does:**
- Builds the app
- Stops existing PM2 process
- Starts PM2 with production config

### PM2 Management Commands

**On the server:**
```bash
# Check status
pm2 status

# View logs
pm2 logs tool-thinker

# Restart
pm2 restart tool-thinker

# Stop
pm2 stop tool-thinker

# Monitor
pm2 monit

# Save configuration
pm2 save
```

### Server Health Check
- **Health Endpoint:** http://72.62.170.11/api/health
- **Local Health Check:** http://localhost:3000/api/health
- **Check Script:** `scripts/CHECK_SERVER_STATUS.sh`

### Deployment Files
- `ecosystem.config.js` - PM2 configuration
- `scripts/deploy.sh` - Local deployment script
- `scripts/RUN_ON_SERVER_CLEAN_DEPLOY.sh` - Server-side clean deployment
- `scripts/clean-deploy-server.sh` - SSH-based deployment
- `scripts/update-server.sh` - Quick update script
- `scripts/CHECK_SERVER_STATUS.sh` - Status check script
- `scripts/RESTART_PM2_ON_SERVER.sh` - PM2 restart script
- `scripts/health-check.js` - Health check utility

### Production Environment Variables
**Required on server:**
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Model name (default: gpt-4o-mini)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NODE_ENV=production` - Set automatically by PM2

**Location:** `/root/tool-thinker/.env` (on server)

### GitHub Integration
- **Repository:** Connected to GitHub
- **Branch:** `main` (production branch)
- **Deployment:** Pulls from `origin/main`
- **Location:** `/root/tool-thinker` (on server)

### Server Access & Maintenance

**SSH Access:**
```bash
ssh root@72.62.170.11
cd /root/tool-thinker
```

**Check Server Status:**
```bash
# On server
bash scripts/CHECK_SERVER_STATUS.sh

# Or manually
pm2 status
curl http://localhost:3000/api/health
```

**View Logs:**
```bash
# On server
pm2 logs tool-thinker

# Or view log files
tail -f logs/pm2-error.log
tail -f logs/pm2-out.log
```

**Restart Server:**
```bash
# On server
pm2 restart tool-thinker

# Or use script
bash scripts/RESTART_PM2_ON_SERVER.sh
```

### Production Build Issues
**If build fails on server:**
1. Check Node.js version (should be 18+)
2. Verify all environment variables are set
3. Check disk space: `df -h`
4. Check memory: `free -h`
5. Review build logs: `pm2 logs tool-thinker`

**Common Server Issues:**
- **502 Gateway Error:** PM2 process not running → `pm2 restart tool-thinker`
- **Build Fails:** Check Node.js version, dependencies, disk space
- **Memory Issues:** Check `max_memory_restart` in `ecosystem.config.js`
- **Port Conflicts:** Verify port 3000 is available

### Deployment Checklist
Before deploying to production:
- [ ] All environment variables set on server
- [ ] Code committed and pushed to `main` branch
- [ ] Local build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Test health endpoint locally
- [ ] Backup current production build (optional)

### Environment Variables Required
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Model name (default: gpt-4o-mini)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_BOOK_PURCHASE_URL` - Optional, for book links

### Build Issues
- **Current:** Webpack chunk loading error
- **Fix Applied:** Updated webpack config with `named` module IDs
- **Status:** Awaiting rebuild

---

## 📝 Code Quality

### Linting
- ✅ No linter errors currently
- ✅ TypeScript compiles successfully
- ✅ All imports resolved

### Type Safety
- ✅ Recent files use proper error handling (`catch (error: unknown)`)
- ⚠️ Older API routes still use `catch (error: any)` (non-critical)

### Best Practices
- ✅ Functional components
- ✅ TypeScript interfaces
- ✅ Proper error handling in new code
- ✅ Loading states
- ✅ Error boundaries

---

## 🎨 UI/UX Features

### Progress Indicators
- Step progress bars
- Question counters
- Completion percentages
- Save status indicators

### Guidance & Help
- Expandable help text
- Example answers
- Time estimates
- Completion checklists

### Visual Feedback
- Green borders for answered questions
- Red borders for validation errors
- Loading states
- Success banners
- Lock icons for unavailable steps

---

## 🔐 Authentication & Authorization

### Auth System
- Supabase Auth
- Session management via `@supabase/auth-helpers-nextjs`
- Protected routes
- User context via `AuthContext`

### API Authentication
- Bearer token authentication
- Session validation in API routes
- Project ownership verification

---

## 📊 Project Structure

```
app/
├── page.tsx                    # Home page
├── dashboard/                  # User dashboard
├── project/
│   └── [projectId]/
│       ├── overview/          # Project overview
│       └── step/[stepId]/     # Individual steps
├── tools/                      # Standalone tools
├── api/                        # API routes
│   ├── export/                # Export endpoints
│   ├── projects/              # Project management
│   ├── steps/                 # Step management
│   └── ai/                    # AI generation
components/                     # React components
lib/
├── frameworks/                # Framework definitions
├── db/                        # Database client
├── supabase/                  # Supabase utilities
└── tool-guidance/            # Tool recommendations
types/                         # TypeScript types
```

---

## 🚨 Critical Context for New Chat

### If Webpack Error Persists
1. Check `next.config.js` webpack configuration
2. Try deleting `.next` and rebuilding
3. Check for circular dependencies
4. Verify all imports are correct
5. Check Node.js version compatibility

### If UI is Blank
1. Check browser console for errors
2. Verify dev server is running on port 3001
3. Check network tab for failed requests
4. Verify environment variables are set
5. Check if Supabase connection is working

### If Build Fails
1. Check TypeScript errors: `npm run build`
2. Check linting errors: `npm run lint`
3. Verify all dependencies installed: `npm install`
4. Check Node.js version (should be 18+)

---

## 📚 Important Documentation Files

- `COMPLETE_USER_JOURNEY_MAP.md` - Full user journey analysis
- `CODE_REVIEW_SUMMARY.md` - Code quality review
- `USER_FLOW_ANALYSIS_AND_GAPS.md` - User flow gaps and improvements
- `PHASE_1_AND_2_IMPLEMENTATION_SUMMARY.md` - Implementation details

---

## 🎯 Next Steps (When Issues Resolved)

1. **Test the webpack fix** - Verify UI loads after rebuild
2. **Complete PDF export** - Add PDF generation functionality
3. **Add more examples** - Expand help text/examples to other frameworks
4. **Mobile testing** - Verify responsive design works
5. **Performance optimization** - Review and optimize if needed

---

## 💡 Quick Reference Commands

### Local Development
```bash
# Development
npm run dev              # Start dev server (port 3001)

# Build
npm run build           # Production build
npm start               # Start production server

# Cleanup
rm -rf .next            # Clear build cache
rm -rf node_modules/.cache  # Clear npm cache
rm -rf .swc             # Clear SWC cache

# Full cleanup and restart
lsof -ti:3001 | xargs kill -9 2>/dev/null
rm -rf .next .swc node_modules/.cache
npm run dev
```

### Production Server Commands
```bash
# SSH into server
ssh root@72.62.170.11

# Navigate to app
cd /root/tool-thinker

# Clean deployment (recommended)
bash scripts/RUN_ON_SERVER_CLEAN_DEPLOY.sh

# Quick update
bash scripts/update-server.sh

# Check status
bash scripts/CHECK_SERVER_STATUS.sh
pm2 status

# View logs
pm2 logs tool-thinker

# Restart
pm2 restart tool-thinker

# Health check
curl http://localhost:3000/api/health
curl http://72.62.170.11/api/health
```

---

## 🔗 Key URLs

### Local Development
- **Local Dev:** http://localhost:3001
- **Home:** http://localhost:3001/
- **Dashboard:** http://localhost:3001/dashboard
- **Tools:** http://localhost:3001/tools
- **Idea Discovery:** http://localhost:3001/tools/idea-discovery
- **Health Check:** http://localhost:3001/api/health

### Production Server
- **Production URL:** http://72.62.170.11
- **Health Check:** http://72.62.170.11/api/health
- **Home:** http://72.62.170.11/
- **Dashboard:** http://72.62.170.11/dashboard
- **Tools:** http://72.62.170.11/tools

---

## 📞 Support Context

If you need to continue work:
1. Read this file first for full context
2. Check `COMPLETE_USER_JOURNEY_MAP.md` for user flow details
3. Review `CODE_REVIEW_SUMMARY.md` for code quality status
4. Check terminal for current build status
5. Verify `.env` file has all required variables

### Production Server Access
- **SSH:** `ssh root@72.62.170.11`
- **App Location:** `/root/tool-thinker`
- **PM2 Process:** `tool-thinker`
- **Check Status:** `pm2 status` or `bash scripts/CHECK_SERVER_STATUS.sh`

### Deployment Workflow
1. Make changes locally
2. Test locally (`npm run dev`)
3. Commit and push to GitHub (`main` branch)
4. SSH into server
5. Run deployment script: `bash scripts/RUN_ON_SERVER_CLEAN_DEPLOY.sh`
6. Verify: `curl http://72.62.170.11/api/health`

**Last Updated:** Current session
**Status:** Webpack chunk loading error being resolved
**Build State:** Dev server restarting with new webpack config
**Production Server:** http://72.62.170.11 (PM2 managed)

