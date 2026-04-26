# VirtROI

Live app: https://da3m0nsec.github.io/VirtROI/

VirtROI is a static web calculator that helps infrastructure and platform teams estimate whether changing virtualization licensing models is financially worth it.

It supports products priced per core/year or per socket/year, lets you enter capacity either as topology or absolute totals, and includes extra annual costs such as HCI TBs, backup, support, or other add-ons.

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
- language options for English, Spanish, Portuguese, Italian, Japanese, and German
- an editable report that can include chart snapshots and be exported to PDF with the browser print dialog

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

## Additional annual costs

Both current and target products include an **Additional annual costs** field.

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

## Editable PDF report

The **Report** tab can generate a browser-side, editable business-case report from the current inputs and results. The generated report includes:

- executive summary
- key metrics
- chart snapshots
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
License annual cost = unit price × selected quantity, either total cores or total sockets
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
