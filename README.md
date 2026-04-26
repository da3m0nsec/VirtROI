# VirtROI

VirtROI is a static web calculator that helps infrastructure and platform teams estimate whether changing virtualization licensing models is financially worth it.

It supports products priced per core/year or per socket/year, lets you enter capacity either as topology or absolute totals, and includes extra annual costs such as vSAN TBs, backup, support, or other add-ons.

## What it calculates

VirtROI estimates:

- current annual licensing cost
- target annual licensing cost
- additional annual costs for each product
- annual savings
- migration payback period
- net savings across an analysis period
- ROI percentage
- a simple decision signal: `Strong case`, `Worth evaluating`, or `Weak financial case`
- dynamic charts for cumulative cost and net savings over time

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

- vSAN TB capacity
- backup add-ons
- support uplift
- management tooling
- storage or replication licensing

## Default scenario

The default values model this comparison:

| Input | Default |
| --- | ---: |
| Current platform | VMware |
| Target platform | Morpheus VM Essentials |
| Capacity mode | Hosts × sockets × cores |
| Hosts | 10 |
| Sockets per host | 2 |
| Cores per socket | 24 |
| Current pricing unit | Per core / year |
| Current unit price | $200 |
| Target pricing unit | Per socket / year |
| Target unit price | $600 |
| Current additional annual costs | $0 |
| Target additional annual costs | $0 |
| One-time migration cost | $40,000 |
| Analysis period | 3 years |

Default result:

| Metric | Value |
| --- | ---: |
| Total cores | 480 |
| Total sockets | 20 |
| Current annual cost | $96,000 |
| Target annual cost | $12,000 |
| Annual savings | $84,000 |
| Payback period | 0.48 years |
| Net savings after migration, 3 years | $212,000 |
| ROI | 530% |

## Dynamic charts

The **Dynamic charts** tab renders browser-native canvas charts without external dependencies:

- **Cumulative cost**: current platform cost vs target platform cost including migration cost.
- **Net savings**: savings after accounting for migration cost over the selected analysis period.

Charts update automatically when any input changes.

## Formulas

```text
Total cores = hosts × sockets per host × cores per socket
Total sockets = hosts × sockets per host
Absolute mode total cores = entered total cores
Absolute mode total sockets = entered total sockets
License annual cost = unit price × selected quantity, either total cores or total sockets
Total annual cost = license annual cost + additional annual costs
Annual savings = current annual cost - target annual cost
Payback years = migration cost / annual savings
Net savings = annual savings × years - migration cost
ROI % = net savings / migration cost × 100
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
