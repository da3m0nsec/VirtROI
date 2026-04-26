# VirtROI

VirtROI is a static web calculator that helps infrastructure and platform teams estimate whether changing virtualization licensing models is financially worth it.

The first product scenario compares a current VMware-style renewal priced per core/year against a target Morpheus VM Essentials-style alternative priced per socket/year.

## What it calculates

VirtROI estimates:

- current annual licensing cost
- target annual licensing cost
- annual savings
- migration payback period
- net savings across an analysis period
- ROI percentage
- a simple decision signal: `Strong case`, `Worth evaluating`, or `Weak financial case`

## Default scenario

The default values model this comparison:

| Input | Default |
| --- | ---: |
| Current platform | VMware |
| Target platform | Morpheus VM Essentials |
| Hosts | 10 |
| Sockets per host | 2 |
| Cores per socket | 24 |
| Current price/core/year | $200 |
| Target price/socket/year | $600 |
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

## Formulas

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
