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

Run from repo root, e.g.:

```yaml
- run: k6 run stress/smoke.js
- run: k6 run stress/load-7000.js
```

## Scripts

| Script           | VUs    | Stages / duration      |
|------------------|--------|-------------------------|
| `stress/smoke.js` | 3      | 15s                     |
| `stress/load.js`  | 10→50  | ~3.5 min                |
| `stress/load-500.js`  | 100→500 | ~5 min             |
| `stress/load-7000.js` | 1000→7000 | ~13 min (ramp + 5m hold) |

All use GET-only endpoints (fighters, events, fights, relics, votes, etc.).
