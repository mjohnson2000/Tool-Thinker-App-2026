# Fix Permission Error - Server Can't Read node_modules

## The Problem
Your server is running but getting "Operation not permitted" errors when trying to read from `node_modules`. This is a macOS security restriction.

## Solution: Grant Full Disk Access

**You MUST do this in System Settings:**

1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security**
3. Scroll down to **Full Disk Access**
4. Click the **lock icon** 🔒 and enter your password
5. Click the **+** button
6. Add **Terminal** (or **VS Code** if you're using that)
   - For Terminal: `/Applications/Utilities/Terminal.app`
   - For VS Code: `/Applications/Visual Studio Code.app` or wherever it's installed
7. Make sure the checkbox is **checked** ✅
8. **Restart your terminal/VS Code**
9. Then run: `npm run dev`

## Alternative: Run from Terminal Directly

If you can't modify System Settings, try running the server from a **new Terminal window** (not VS Code's integrated terminal):

```bash
cd "/Users/marcjohnson2000/Desktop/Tool Thinker - New design 2026"
npm run dev
```

Terminal often has different permissions than VS Code's integrated terminal.

## After Fixing

Once permissions are granted:
1. Stop any running server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Wait for: `- Local: http://localhost:3001`
4. Open: **http://localhost:3001** in your browser

The server should now work properly!

