# AMMA-Stress

k6 load and stress tests for the AMMA / Cage Calls API.

- **API:** https://yq4vmvpnrv.us-east-1.awsapprunner.com/api/v1  
- **Docs:** https://yq4vmvpnrv.us-east-1.awsapprunner.com/api/v1/docs  
- **App:** https://dev.d1t0xal4my8btp.amplifyapp.com/

## Prerequisites

Install k6. **If `k6` is not recognized** (e.g. on Windows without Chocolatey):

1. **Windows – direct install:**  
   Download the installer and run it:  
   [https://github.com/grafana/k6/releases](https://github.com/grafana/k6/releases) → pick the latest `k6-v*-windows-amd64.msi`, install, then **restart your terminal** (or open a new one).

2. **Windows – winget (if available):**  
   ```powershell
   winget install Grafana.K6
   ```
   Then restart the terminal.

3. **Docker (no local install):**  
   From repo root:  
   ```powershell
   docker run --rm -v "${PWD}:/scripts" grafana/k6 run /scripts/stress/load-7000.js
   ```
   Or smoke: `docker run --rm -v "${PWD}:/scripts" grafana/k6 run /scripts/stress/smoke.js`

## Run (from repo root)

```bash
# Smoke – 3 VUs, 15s
k6 run stress/smoke.js

# Load – ramp to 50 VUs
k6 run stress/load.js

# 500 VUs
k6 run stress/load-500.js

# 7000 VUs
k6 run stress/load-7000.js
```

Override base URL:

```bash
k6 run --env BASE_URL=https://your-api.com/api/v1 stress/load.js
```

## Pipeline

**GitHub Actions:** [.github/workflows/k6-stress.yml](.github/workflows/k6-stress.yml)

- **Push/PR:** All 4 scripts run **in parallel** (smoke, load, load-500, load-7000). A **report** job then merges summaries and uploads **k6-stress-report** (HTML + JSON).
- **Manual run:** Actions → **Run workflow** → choose **test_suite**: `all` or `smoke` / `load` / `load-500` / `load-7000` to run a single test or all.
- Uses Docker image `grafana/k6`. Download **k6-stress-report** from the run to get `results/index.html` (all cases and metrics) and per-script JSON.

To run the same locally (Docker):

```bash
docker run --rm -v $PWD:/scripts grafana/k6 run /scripts/stress/smoke.js
docker run --rm -v $PWD:/scripts grafana/k6 run /scripts/stress/load.js
docker run --rm -v $PWD:/scripts grafana/k6 run /scripts/stress/load-500.js
docker run --rm -v $PWD:/scripts grafana/k6 run /scripts/stress/load-7000.js
```

## Scripts

| Script           | VUs    | Duration (approx) |
|------------------|--------|-------------------|
| `stress/smoke.js` | 3      | 10s               |
| `stress/load.js`  | 10→50  | ~1.5 min          |
| `stress/load-500.js`  | 100→500 | ~2 min        |
| `stress/load-7000.js` | 1000→7000 | ~4.5 min   |

All use GET-only endpoints. Thresholds are relaxed for pipeline (e.g. fail rate &lt; 20–25%) so flaky APIs don’t fail the run.

## Run single or all in pipeline

- **Push/PR:** All 4 tests run in parallel, then one combined HTML report is uploaded.
- **Manual (Actions → Run workflow):** Choose **Run single test or all** → pick `all`, `smoke`, `load`, `load-500`, or `load-7000`. Single = one job; all = 4 parallel jobs.
