# Manual Fix for Calculator Pages Syntax Errors

The build is failing because of missing closing `</div>` tags in 4 calculator pages. Apply these fixes on the server:

## Fix 1: market-size-calculator/page.tsx

**Location:** After line 220 (after `</Button>`)

**Add this line:**
```
              </div>
```

**Context:**
```tsx
              </Button>
              </div>  <!-- ADD THIS LINE -->
            </div>
```

## Fix 2: pricing-strategy-calculator/page.tsx

**Location:** After line 239 (after `</Button>`)

**Add this line:**
```
              </div>
```

**Context:**
```tsx
              </Button>
              </div>  <!-- ADD THIS LINE -->
            </div>
```

## Fix 3: runway-calculator/page.tsx

**Location:** After line 220 (after `</Button>`)

**Add this line:**
```
              </div>
```

**Context:**
```tsx
              </Button>
              </div>  <!-- ADD THIS LINE -->
            </div>
```

## Fix 4: team-cost-calculator/page.tsx

**Location:** After line 235 (after `</Button>`)

**Add this line:**
```
              </div>
```

**Context:**
```tsx
              </Button>
              </div>  <!-- ADD THIS LINE -->
            </div>
```

## Quick Fix Commands (Run on Server)

```bash
# Navigate to project directory
cd ~/tool-thinker

# Fix market-size-calculator
sed -i '220a\              </div>' app/tools/market-size-calculator/page.tsx

# Fix pricing-strategy-calculator
sed -i '239a\              </div>' app/tools/pricing-strategy-calculator/page.tsx

# Fix runway-calculator
sed -i '220a\              </div>' app/tools/runway-calculator/page.tsx

# Fix team-cost-calculator
sed -i '235a\              </div>' app/tools/team-cost-calculator/page.tsx

# Then rebuild
npm run build
pm2 restart tool-thinker
```

## Alternative: Pull from GitHub (if you push the fixes)

If you push the fixes from your local machine to GitHub, then on the server:

```bash
cd ~/tool-thinker
git pull origin main
npm run build
pm2 restart tool-thinker
```

