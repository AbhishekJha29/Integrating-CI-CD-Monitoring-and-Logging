const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

// Test GET / root endpoint returns expected greeting JSON
test('GET / returns 200 and greeting message', async () => {
  const res = await request(app).get('/');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { message: 'Hello from the DevOps demo app' });
});

// Test GET /health returns status ok
test('GET /health returns 200 and status ok', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: 'ok' });
});

// Test GET /metrics returns Prometheus metric http_requests_total
test('GET /metrics returns 200 and contains http_requests_total', async () => {
  const res = await request(app).get('/metrics');
  assert.strictEqual(res.status, 200);
  assert.ok(res.text.includes('http_requests_total'), 'Metrics response body should contain http_requests_total');
});
