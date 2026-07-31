# VirtROI

Live app: https://da3m0nsec.github.io/VirtROI/

VirtROI is a static web calculator that helps infrastructure and platform teams estimate whether changing virtualization licensing models is financially worth it.

It supports products priced per core/year or per socket/year, lets you enter capacity either as topology or absolute totals, includes extra costs such as HCI TBs, backup, support, or other add-ons, and can treat recurring cost inputs as either annualized amounts or totals for the whole analysis period.

## What it calculates

VirtROI estimates:

- current annual licensing cost
- target annual licensing cost
- additional annual costs for each product
- annual savings
- payback period for one-time costs
- net savings across an analysis period
- ROI percentage
- a simple decision signal: `Strong case`, `Worth evaluating`, or `Weak financial case`
- dynamic charts for cumulative cost and net savings over time, including two extra projected scenario years
- an annual cash outlay chart showing what each platform actually costs per budget year, with one-time costs loaded into year 1
- a cost composition chart breaking the analysis-period total into licenses, add-ons, and one-time costs
- a full-width scenario comparison chart overlaying net savings over time for the current inputs and up to three saved scenarios
- hover tooltips on every chart and a full-screen mode that stays responsive on mobile and vertical screens
- a scenario library to save the current inputs under a name, compare saved scenarios side by side, and share a scenario via URL
- a break-even card translating the decision into concrete unit prices: the target price at which the case stops paying off, and the current-platform price that would keep you where you are
- currency output in USD, EUR, GBP, JPY, or BRL
- recurring cost inputs as annualized amounts or totals for the selected analysis period
- per-platform pricing entered either as a net unit price or as a list price with a negotiated discount
- language options for English, Spanish, Portuguese, Italian, Japanese, and German
- an editable report that can include chart snapshots and be exported to PDF with the browser print dialog

## Brand assets

The logo kit lives in `assets/`, with usage rules in [`assets/BRAND.md`](assets/BRAND.md). Placement in this app:

| Asset | Where it is used |
| --- | --- |
| `virtroi-logo.svg` | primary nav lockup, shown at 141×62 to clear the kit's 140px minimum width |
| `virtroi-icon-simple.svg` | nav mark below 640px, where the lockup falls under its minimum width, and the SVG favicon |
| `favicon.ico`, `favicon-16/32.png` | browser tab icons |
| `apple-touch-icon.png` | iOS home screen |
| `icon-192/256/512.png`, `icon-512-maskable.png` | `site.webmanifest`, including the Android adaptive icon |
| `og-image.png` | Open Graph and Twitter social preview |

The reversed lockups, tagline lockups, mono and knockout icons ship in `assets/` for slides and docs; nothing in the app renders on a dark background where they would apply.

**The generated report is deliberately unbranded** — no VirtROI name, logo, or filename appears in the report, its PDF export, the standalone HTML download, or the graphs PNG, so it can be circulated as a neutral business case. Exports are named `cost-analysis-report-<date>.html` and `cost-analysis-graphs-<date>.png`, and the report is titled "Virtualization cost analysis" in each language.

## Capacity input modes

You can model capacity in two ways:

1. **Hosts × sockets × cores**
   - hosts
   - sockets per host
   - cores per socket

2. **Absolute sockets and cores**
   - total sockets
   - total cores

The absolute mode is useful when you already know your licensed socket/core totals and do not want to model host topology.

## Pricing models

Each product can be priced independently:

- per core / year
- per socket / year

This means you can compare any combination:

- current per-core vs target per-socket
- current per-socket vs target per-socket
- current per-core vs target per-core
- current per-socket vs target per-core

## Additional recurring costs

Both current and target products include an **Additional costs** field.

Use this for recurring costs that are not captured by the base license metric, for example:

- HCI TB capacity
- backup add-ons
- support uplift
- management tooling
- storage or replication licensing

## One-time costs

VirtROI includes a separate **One-time costs** box for non-recurring project costs:

- migration services
- hardware purchases or refreshes
- bridge renewals / extensions

These values are summed and used for payback, net savings, ROI, and cumulative cost charts.

## Currency and cost input period

The currency selector changes presentation across the calculator, charts, and generated report. Available currencies are:

- USD
- EUR
- GBP
- JPY
- BRL

The **Cost values entered as** selector controls how recurring license and add-on fields are interpreted:

- **Annualized amounts**: values are already yearly costs.
- **Total for analysis period**: values are totals covering the selected analysis period; VirtROI annualizes them internally by dividing by the number of years.

One-time costs remain non-recurring and are not annualized.

## Default scenario

The default values model this comparison:

| Input | Default |
| --- | ---: |
| Current platform | Virtualization Product 1 |
| Target platform | Virtualization Product 2 |
| Capacity mode | Hosts × sockets × cores |
| Hosts | 10 |
| Sockets per host | 2 |
| Cores per socket | 24 |
| Current pricing unit | Per core / year |
| Current unit price | $400 |
| Target pricing unit | Per socket / year |
| Target unit price | $4,500 |
| Current additional annual costs | $0 |
| Target additional annual costs | $0 |
| Migration services | $40,000 |
| Hardware purchases | $0 |
| Renewals / extensions | $0 |
| Total one-time costs | $40,000 |
| Analysis period | 3 years |

Default result:

| Metric | Value |
| --- | ---: |
| Total cores | 480 |
| Total sockets | 20 |
| Current annual cost | $192,000 |
| Target annual cost | $90,000 |
| Annual savings | $102,000 |
| Payback period | 0.39 years |
| Net savings after one-time costs, 3 years | $266,000 |
| ROI | 665% |

## Dynamic charts

The **Dynamic charts** tab renders browser-native canvas charts without external dependencies:

- **Cumulative cost**: current platform cost vs target platform cost including one-time costs.
- **Net savings**: savings after accounting for one-time costs over the selected analysis period.

Charts update automatically when any input changes. The x-axis marks projected years with `*`, so a 3-year analysis also shows years 4 and 5 as forward-looking scenario points.

Hovering any chart shows exact values, and every chart card has a **Full screen** button (Escape closes it) that keeps working on mobile and vertical screens.

### Annual cash outlay

Cumulative lines answer "is the switch worth it?"; the annual cash outlay bars answer the budget owner's question, "what do I pay out each year?". Grouped bars compare the current and target platform per budget year, with one-time costs (migration, hardware, bridge renewals) loaded into the target's year 1 bar — making the typical shape visible: the target is more expensive in year 1 and cheaper every year after. Projected years render with faded bars.

### Cost composition

A stacked bar per platform showing where the money actually goes across the whole analysis period: license cost, additional annual costs (add-ons such as HCI TBs, backup, or support), and one-time costs. It answers a question the other charts cannot — whether a quote is dominated by licensing or by the add-ons stacked around it — which is often where the negotiating room turns out to be. Each segment is labelled with its amount in report snapshots, with the platform total above the bar.

### Scenario comparison

The scenario comparison chart spans the full width of the charts grid and overlays net savings over time for the current inputs plus up to three saved scenarios (same currency, in library order, with a stable color per scenario). It turns the scenario table into a race to break even: which quote crosses zero first, and which never does. The horizon extends to the longest analysis period among the compared scenarios plus two projected years.

### Scenario library

Below the calculator, the scenario library snapshots the current inputs under a name (stored in `localStorage`, so nothing leaves the browser) and compares saved scenarios side by side: annual savings, payback, net savings, ROI, and the decision signal, with the live inputs always shown as the first row. Each saved scenario can be loaded back into the form or deleted. **Copy share link** produces a URL that encodes every input as a query parameter, so a colleague opening the link sees the same scenario without anything being uploaded.

### Net price or list price + discount

Each platform's pricing block has a **Price entry** selector:

- **Net price** — type the final per-core or per-socket price directly, for when that is all you have.
- **List price + discount** — type the vendor's list price and the negotiated discount percentage. VirtROI applies `list × (1 − discount ÷ 100)` and shows the resulting effective price under the discount field, so the quote stays documented in the form the vendor presented it.

Both modes feed the same calculation and interact normally with the annualized/total cost period selector, so a three-year list price with a discount works exactly like a three-year net price. Discounts are clamped to 0–100%. Scenarios saved before this existed keep working: a scenario with no entry mode is treated as a net price.

When the target uses list entry, the break-even card additionally states break-even as a discount off list — the number to walk into a negotiation with — or, if break-even sits above list, how much headroom you have.

### Break-even unit prices

The results grid includes a break-even card that converts the whole cost model into two concrete numbers: the **target unit price** at which net savings over the analysis period hit zero (the maximum you should accept when negotiating the target quote), and the **current-platform unit price** at which staying put costs the same as switching (the renewal discount that would kill the case).

## Editable PDF report

The **Report** tab can generate a browser-side, editable business-case report from the current inputs and results.

Two selectors above the editor control what the report carries: which charts to include — **Cumulative cost** and **Net savings** are ticked by default, the rest are opt-in — and which saved scenarios appear in the scenario comparison chart. Deselecting every chart drops the charts section entirely. The same selection drives the graphs PNG download.

The generated report includes:

- executive summary
- key metrics
- a yearly breakdown table with cumulative cost per platform and net savings for each year, including the projected years marked with `*` — the exact figures the chart tooltips show, readable in a printed PDF
- titled chart snapshots
- a manual notes section for assumptions, risks, next steps, or stakeholder comments

After editing the report in-place, use **Export PDF**. VirtROI opens the browser print dialog, where you can choose **Save as PDF**. No report data leaves the browser.

## Language options

VirtROI includes a language selector with:

- English
- Spanish
- Portuguese
- Italian
- Japanese
- German

Translations live in separate files under `locales/`:

```text
locales/en.js
locales/es.js
locales/pt.js
locales/it.js
locales/ja.js
locales/de.js
```

The test suite verifies that every locale exposes the same keys and that every `data-i18n` / translated attribute key used by the page exists in the locale files.

## Formulas

```text
Total cores = hosts × sockets per host × cores per socket
Total sockets = hosts × sockets per host
Absolute mode total cores = entered total cores
Absolute mode total sockets = entered total sockets
License annual cost = effective unit price × selected quantity, either total cores or total sockets
Total annual cost = license annual cost + additional annual costs
Annual savings = current annual cost - target annual cost
One-time costs = migration services + hardware purchases + renewals/extensions
Payback years = one-time costs / annual savings
Net savings = annual savings × years - one-time costs
ROI % = net savings / one-time costs × 100

```

If annual savings are zero or negative, VirtROI reports `No payback` instead of a misleading payback period.

## Decision labels

- `Strong case`: annual savings are positive and payback is 1 year or less.
- `Worth evaluating`: annual savings are positive and payback is 3 years or less.
- `Weak financial case`: savings are zero/negative or payback takes more than 3 years.

## Run locally

No build step is required. For a browser preview:

```bash
python3 -m http.server 8123
```

Then open:

```text
http://127.0.0.1:8123/
```

## Development checks

VirtROI keeps the app static, but uses Node's built-in test runner for the pure calculation logic.

```bash
npm test
npm run check:js
```

No third-party npm dependencies are required.

## GitHub Pages deployment

This app is designed to be served directly from GitHub Pages.

Recommended setup:

1. Go to the repository settings on GitHub.
2. Open **Pages**.
3. Set source to **Deploy from a branch**.
4. Select the `main` branch and root directory `/`.
5. Save.

GitHub Pages will serve `index.html`, `style.css`, and `app.js` directly.

## Privacy

VirtROI is a static calculator. Scenario data stays in the browser and is not sent to a server.
