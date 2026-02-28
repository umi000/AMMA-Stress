/**
 * k6 stress test – 500 virtual users
 * Run: k6 run stress/load-500.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://yq4vmvpnrv.us-east-1.awsapprunner.com/api/v1';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // ramp to 100
    { duration: '1m', target: 300 },   // ramp to 300
    { duration: '30s', target: 500 },  // ramp to 500
    { duration: '2m', target: 500 },   // hold 500 VUs
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% under 5s
    http_req_failed: ['rate<0.10'],    // <10% errors
  },
};

const GET_ENDPOINTS = [
  '/fighters?page=1', '/fighters/onchain/565', '/relics/relic-for-fighter?fighterId=0f9a118d-94e4-440e-8ede-566cedc629e3',
  '/fighters/grouped', '/fighters/images', '/fighters/stats',
  '/events', '/events/list', '/events/upcoming', '/events/past',
  '/events/8c9e0c5f-0d3b-4ba3-8393-2c85188b554a', '/events/25baca5e-bfb1-4091-819a-c03c6b7e2c1c',
  '/collections', '/event-overlays',
  '/fights/upcoming?page=1&pageSize=20', '/fights/deployed-markets', '/relics', '/votes/check',
];

const HEADERS = { 'Accept': 'application/json', 'Origin': 'https://dev.d1t0xal4my8btp.amplifyapp.com' };

export default function () {
  const path = GET_ENDPOINTS[Math.floor(Math.random() * GET_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${path}`, { headers: HEADERS, tags: { name: path } });
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(0.3 + Math.random() * 0.7);
}
