# Fix Black Page / Permission Error

## The Problem
macOS is blocking Next.js from reading files in `node_modules`, causing a black page with a build error.

## Quick Fix (Choose One)

### Option 1: Grant Terminal Full Disk Access (Recommended)

1. Open **System Settings** (or System Preferences)
2. Go to **Privacy & Security**
3. Scroll to **Full Disk Access**
4. Click the lock icon and enter your password
5. Click the **+** button
6. Add your **Terminal** app (or VS Code if you're using that)
7. Restart your terminal
8. Run: `npm run dev`

### Option 2: Run from Your Terminal

Open your terminal and run:

```bash
cd "/Users/marcjohnson2000/Desktop/Tool Thinker - New design 2026"
npm run dev
```

This often works because your terminal session has different permissions.

### Option 3: Reinstall in a Different Location

If the space in the folder name is causing issues:

```bash
# Move to a folder without spaces
cd ~/Desktop
mv "Tool Thinker - New design 2026" tool-thinker
cd tool-thinker
npm install
npm run dev
```

### Option 4: Use the Fix Script

```bash
cd "/Users/marcjohnson2000/Desktop/Tool Thinker - New design 2026"
./fix-permissions.sh
npm run dev
```

## After Fixing

Once permissions are fixed, refresh your browser at `http://localhost:3000` and you should see the Start Smart OS landing page.

## Still Having Issues?

If none of these work, the issue might be:
- Antivirus software blocking file access
- Corporate security policies
- Disk encryption issues

In that case, try running the project in a different location or contact your IT administrator.



