// Built-in test runner modules from Node.js standard library
const { describe, it } = require('node:test');
const assert = require('node:assert');

// Supertest to simulate HTTP requests against the Express app without listening on a live port
const request = require('supertest');

// Import the Express application under test
const app = require('../app');

describe('DevOps Demo API Endpoints', () => {
  // Test root endpoint greeting
  it('GET / should return 200 and greeting message', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { message: 'Hello from the DevOps demo app' });
  });

  // Test health check endpoint
  it('GET /health should return 200 and status ok', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { status: 'ok' });
  });

  // Test error endpoint used for triggering 5xx alert rules
  it('GET /error should return 500 and intentional failure message', async () => {
    const res = await request(app).get('/error');
    assert.strictEqual(res.status, 500);
    assert.deepStrictEqual(res.body, { error: 'intentional failure for testing alerts' });
  });

  // Test Prometheus metrics endpoint
  it('GET /metrics should return 200 and expose http_requests_total metric', async () => {
    const res = await request(app).get('/metrics');
    assert.strictEqual(res.status, 200);
    assert.ok(
      res.text.includes('http_requests_total'),
      'Expected Prometheus metrics output to include http_requests_total'
    );
    assert.ok(
      res.text.includes('http_request_duration_seconds'),
      'Expected Prometheus metrics output to include http_request_duration_seconds'
    );
  });
});
