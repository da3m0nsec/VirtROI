# VirtROI Productization Implementation Plan

> **For Hermes:** Use test-driven-development for calculator logic and keep the app GitHub Pages compatible: static HTML, CSS, and browser JavaScript only.

**Goal:** Turn the current VirtROI MVP into a credible static web product that helps infrastructure teams decide whether switching virtualization licensing models is financially worth it.

**Architecture:** Keep the deployment model simple: `index.html`, `style.css`, and `app.js` served directly by GitHub Pages. Extract ROI math into pure JavaScript functions that can be tested without a browser, while the UI layer only reads form inputs and renders results. Avoid frameworks/build steps until the product value proposition is clearer.

**Tech Stack:** Static HTML + CSS + vanilla JavaScript, optional Node built-in test runner for local validation, GitHub Pages for hosting.

---

## Product Context

VirtROI compares virtualization platform renewal/licensing scenarios.

Example target user story:

> I currently use VMware and my renewal will cost `$200/core/year`. I am evaluating Morpheus VM Essentials at `$600/socket/year`. I want to enter hosts, sockets, cores, license prices, migration cost, and time horizon to see annual savings, payback period, and multi-year ROI.

## Core Product Principles

1. **Default values must teach the app.** A first-time visitor should understand the VMware-to-Morpheus example immediately.
2. **Numbers must be explainable.** Every result should map to a simple formula visible in the UI or README.
3. **Static-first.** No backend, no database, no private data collection.
4. **Trust over complexity.** Clear assumptions, transparent formulas, conservative defaults.
5. **Decision support, not just arithmetic.** Show whether switching is attractive, marginal, or not justified.

---

## Phase 1: Credible Single-Scenario Calculator

### Task 1: Add a test harness for ROI math

**Objective:** Enable reliable changes to calculator logic without introducing a framework or build step.

**Files:**
- Create: `tests/roi.test.js`
- Modify: `app.js`
- Create: `package.json`

**Implementation notes:**
- Use Node's built-in `node:test` and `assert` modules.
- Make pure functions available in Node via `module.exports` while still working in the browser.

**Acceptance criteria:**
- `npm test` runs without installing third-party dependencies.
- Tests can import calculator functions from `app.js`.

### Task 2: Extract pure ROI calculation

**Objective:** Replace implicit DOM-global arithmetic with a tested pure function.

**Function contract:**

```js
calculateRoi({
  hosts,
  socketsPerHost,
  coresPerSocket,
  currentPricePerCorePerYear,
  targetPricePerSocketPerYear,
  migrationCost,
  years
})
```

**Expected output fields:**

```js
{
  totalCores,
  totalSockets,
  currentAnnualCost,
  targetAnnualCost,
  annualSavings,
  totalSavingsOverPeriod,
  netSavingsAfterMigration,
  paybackYears,
  roiPercent
}
```

**Initial test case:**
- `10 hosts * 2 sockets * 24 cores = 480 cores`
- Current: `480 * $200 = $96,000/year`
- Target: `20 * $600 = $12,000/year`
- Annual savings: `$84,000/year`
- Migration cost: `$40,000`
- Payback: `0.48 years`

**Acceptance criteria:**
- Test verifies all calculated fields above.
- Current browser UI still displays the same baseline result.

### Task 3: Replace implicit DOM globals

**Objective:** Make browser code robust and maintainable.

**Files:**
- Modify: `app.js`
- Modify: `index.html` if IDs need alignment

**Changes:**
- Replace `hosts.value` style globals with `document.getElementById(...)`.
- Add a single `getInputs()` function.
- Add a single `renderResults(result)` function.

**Acceptance criteria:**
- No direct reliance on element IDs becoming global variables.
- `npm test` passes.
- Manual browser check shows calculations update on input.

### Task 4: Improve form semantics and defaults

**Objective:** Make the calculator understandable for a real buyer/evaluator.

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Fields:**
- Current platform name, default `VMware`
- Target platform name, default `Morpheus VM Essentials`
- Hosts, default `10`
- Sockets per host, default `2`
- Cores per socket, default `24`
- Current price per core/year, default `200`
- Target price per socket/year, default `600`
- One-time migration/project cost, default `40000`
- Analysis period in years, default `3`

**Acceptance criteria:**
- Every input has a real `<label>`.
- Numeric inputs have sensible `min` and `step` values.
- Defaults match the product story.

### Task 5: Render decision-focused outputs

**Objective:** Turn raw numbers into a decision summary.

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `style.css`

**Output cards:**
- Current annual cost
- Target annual cost
- Annual savings
- Payback period
- Net savings over analysis period
- ROI percentage

**Decision labels:**
- `Strong case` if payback <= 1 year and annual savings > 0
- `Worth evaluating` if payback <= 3 years and annual savings > 0
- `Weak financial case` if savings <= 0 or payback > 3 years

**Acceptance criteria:**
- Results are formatted as currency/percent/year values.
- Negative or zero savings produce clear messaging, not misleading payback.

### Task 6: Add formula transparency

**Objective:** Increase trust by showing how results are calculated.

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `README.md`

**Formulas:**

```text
Total cores = hosts × sockets per host × cores per socket
Total sockets = hosts × sockets per host
Current annual cost = total cores × current price/core/year
Target annual cost = total sockets × target price/socket/year
Annual savings = current annual cost - target annual cost
Payback years = migration cost / annual savings
Net savings = annual savings × years - migration cost
ROI % = net savings / migration cost × 100
```

**Acceptance criteria:**
- README documents formulas and default scenario.
- UI includes a compact assumptions/formulas section.

---

## Phase 2: Product Polish

### Task 7: Improve visual design

**Objective:** Make the app feel like a real SaaS-style calculator.

**Design direction:**
- Professional infrastructure/FinOps feel.
- Clear hero section.
- Two-column layout on desktop, single column on mobile.
- Result cards with visual hierarchy.
- No heavy assets or JS libraries.

**Acceptance criteria:**
- Usable on mobile.
- Lighthouse/accessibility basics are acceptable.
- CSS remains maintainable and contained in `style.css`.

### Task 8: Add shareable scenario URLs

**Objective:** Let users share a calculated scenario without backend storage.

**Approach:**
- Serialize inputs into URL query parameters.
- On load, hydrate form from query parameters.
- Add a `Copy share link` button.

**Acceptance criteria:**
- Reloading a copied URL restores the scenario.
- Defaults are used when query params are missing or invalid.

### Task 9: Add scenario presets

**Objective:** Help users start faster with common virtualization comparisons.

**Initial presets:**
- VMware renewal → Morpheus VM Essentials
- VMware renewal → generic per-socket alternative
- Custom blank scenario

**Acceptance criteria:**
- Selecting a preset updates labels and default prices.
- User can still override every value.

---

## Phase 3: GitHub Pages Readiness

### Task 10: Add GitHub Pages deployment notes

**Objective:** Make deployment reproducible.

**Files:**
- Modify: `README.md`
- Optionally create: `.github/workflows/pages.yml` only if not using GitHub's built-in static Pages source.

**Acceptance criteria:**
- README explains local preview: `python3 -m http.server`.
- README explains GitHub Pages setup from `main` branch root.

### Task 11: Add basic quality checks

**Objective:** Keep future edits safe without making the project heavy.

**Files:**
- Modify: `package.json`

**Scripts:**

```json
{
  "scripts": {
    "test": "node --test tests/*.test.js",
    "check:js": "node --check app.js"
  }
}
```

**Acceptance criteria:**
- `npm test` passes.
- `npm run check:js` passes.

---

## Immediate Next Implementation Slice

Implement Phase 1 Tasks 1-6 first. This creates the smallest real product increment:

1. Tested calculator logic.
2. Professional input model.
3. Decision-focused outputs.
4. Transparent formulas.
5. Clean README.
6. Still deployable as static GitHub Pages.

## Out of Scope For Now

- Backend/API.
- User accounts.
- Data persistence beyond URL query parameters.
- Framework migration to React/Vue/Svelte.
- Vendor-specific quote ingestion.
- Multi-scenario comparison tables.

These can come later if the static calculator proves useful.
