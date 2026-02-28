/**
 * k6 smoke test – quick sanity check (low load)
 * Run: k6 run stress/smoke.js
 */

import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://yq4vmvpnrv.us-east-1.awsapprunner.com/api/v1';

export const options = {
  vus: 3,
  duration: '10s',
};

const HEADERS = { 'Accept': 'application/json', 'Origin': 'https://dev.d1t0xal4my8btp.amplifyapp.com' };

export default function () {
  const fighters = http.get(`${BASE_URL}/fighters?page=1`, { headers: HEADERS });
  check(fighters, { 'fighters ok': (r) => r.status === 200 });

  const events = http.get(`${BASE_URL}/events/upcoming`, { headers: HEADERS });
  check(events, { 'events ok': (r) => r.status === 200 });

  const markets = http.get(`${BASE_URL}/fights/deployed-markets`, { headers: HEADERS });
  check(markets, { 'deployed-markets ok': (r) => r.status === 200 });
}

export function handleSummary(data) {
  const path = __ENV.K6_SUMMARY_PATH || 'summary.json';
  return { [path]: JSON.stringify(data, null, 2) };
}
