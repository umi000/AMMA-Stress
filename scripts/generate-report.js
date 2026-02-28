#!/usr/bin/env node
/**
 * Generate HTML report from k6 --summary-export JSON files.
 * Reads all results/*.json and writes results/index.html
 * Usage: node scripts/generate-report.js
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'results');
const CASES = [
  { file: 'smoke.json', name: 'Smoke', description: '3 VUs, 10s' },
  { file: 'load.json', name: 'Load (50 VUs)', description: '10→50 VUs, ~1.5 min' },
  { file: 'load-500.json', name: 'Load (500 VUs)', description: '100→500 VUs, ~2 min' },
  { file: 'load-7000.json', name: 'Load (7000 VUs)', description: '1000→7000 VUs, ~4.5 min' },
];

function getMetric(values, key) {
  if (!values || typeof values !== 'object') return null;
  const v = values[key];
  return v !== undefined && v !== null ? v : null;
}

function formatNum(n) {
  if (n == null) return '—';
  if (typeof n === 'number' && (n % 1 !== 0 || n > 1e6)) return Number(n).toFixed(2);
  return String(n);
}

function formatMs(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(2) + ' s';
  return Math.round(n) + ' ms';
}

function extractMetrics(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const metrics = data.metrics || {};
    const out = {};
    const m = (name) => metrics[name] && metrics[name].values ? metrics[name].values : {};
    out.http_reqs_count = getMetric(m('http_reqs'), 'count');
    out.http_reqs_rate = getMetric(m('http_reqs'), 'rate');
    out.http_req_duration_avg = getMetric(m('http_req_duration'), 'avg');
    out.http_req_duration_min = getMetric(m('http_req_duration'), 'min');
    out.http_req_duration_max = getMetric(m('http_req_duration'), 'max');
    out.http_req_duration_p95 = getMetric(m('http_req_duration'), 'p(95)') ?? getMetric(m('http_req_duration'), 'med');
    out.http_req_failed_rate = getMetric(m('http_req_failed'), 'rate');
    out.http_req_failed_count = getMetric(m('http_req_failed'), 'passes') ?? getMetric(m('http_req_failed'), 'fails');
    out.iterations = getMetric(m('iterations'), 'count');
    out.vus_max = getMetric(m('vus_max'), 'value') ?? getMetric(m('vus'), 'value');
    out.iteration_duration_avg = getMetric(m('iteration_duration'), 'avg');
    return out;
  } catch (e) {
    return null;
  }
}

function buildHtml() {
  const runs = CASES.map((c) => {
    const metrics = extractMetrics(path.join(RESULTS_DIR, c.file));
    return { ...c, metrics };
  });

  const rows = runs.map(
    (r) => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>${r.description}</td>
      <td>${formatNum(r.metrics && r.metrics.iterations)}</td>
      <td>${formatNum(r.metrics && r.metrics.http_reqs_count)}</td>
      <td>${formatNum(r.metrics && r.metrics.http_reqs_rate)}</td>
      <td>${formatMs(r.metrics && r.metrics.http_req_duration_avg)}</td>
      <td>${formatMs(r.metrics && r.metrics.http_req_duration_p95)}</td>
      <td>${formatMs(r.metrics && r.metrics.http_req_duration_min)}</td>
      <td>${formatMs(r.metrics && r.metrics.http_req_duration_max)}</td>
      <td>${r.metrics && r.metrics.http_req_failed_rate != null ? (r.metrics.http_req_failed_rate * 100).toFixed(2) + '%' : '—'}</td>
      <td>${formatNum(r.metrics && r.metrics.vus_max)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AMMA-Stress k6 Report</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
    h1 { color: #f8fafc; margin-bottom: 8px; }
    .meta { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #334155; color: #f1f5f9; font-weight: 600; }
    tr:hover { background: #33415540; }
    .pass { color: #86efac; }
    .fail { color: #fca5a5; }
    footer { margin-top: 24px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <h1>AMMA-Stress k6 Report</h1>
  <p class="meta">Generated from pipeline run. All cases and metrics below.</p>
  <table>
    <thead>
      <tr>
        <th>Case</th>
        <th>Description</th>
        <th>Iterations</th>
        <th>HTTP requests</th>
        <th>Req/s</th>
        <th>Duration avg</th>
        <th>Duration p95</th>
        <th>Duration min</th>
        <th>Duration max</th>
        <th>Failed rate</th>
        <th>VUs max</th>
      </tr>
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
  <footer>AMMA / Cage Calls API · k6 stress tests · stress/smoke.js, load.js, load-500.js, load-7000.js</footer>
</body>
</html>`;
}

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}
fs.writeFileSync(path.join(RESULTS_DIR, 'index.html'), buildHtml(), 'utf8');
console.log('Report written to results/index.html');
