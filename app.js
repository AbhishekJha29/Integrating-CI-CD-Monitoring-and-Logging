// Import Express web framework
const express = require('express');

// Import prom-client to capture and expose Prometheus metrics
const client = require('prom-client');

const app = express();

// Port configuration: read from PORT environment variable, defaulting to 3000
const PORT = process.env.PORT || 3000;

// Collect default Node.js and runtime metrics (heap memory, event loop lag, CPU, etc.)
client.collectDefaultMetrics();

// Define a custom Prometheus counter to count HTTP requests labeled by method, route, and HTTP status
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status'],
});

// Define a Prometheus histogram to measure HTTP request latency in seconds across routes and statuses
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Middleware for request metrics tracking and structured JSON logging to stdout
app.use((req, res, next) => {
  // Capture high-resolution start time for accurate duration calculation
  const start = process.hrtime();

  // Wait until the response is sent to capture the final status code and resolved route
  res.on('finish', () => {
    // Label cardinality protection: use route pattern or fallback to "unmatched" rather than req.path
    // to prevent malicious or randomized URLs from exploding metric cardinality in Prometheus
    const route = req.route ? req.route.path : 'unmatched';
    const status = res.statusCode;
    const method = req.method;

    // Calculate elapsed time in seconds
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    // Increment custom Prometheus counter with label values
    httpRequestCounter.inc({
      method: method,
      route: route,
      status: status,
    });

    // Record request latency in the histogram
    httpRequestDuration.observe(
      {
        method: method,
        route: route,
        status: status,
      },
      durationSeconds
    );

    // Write a single structured JSON log line to stdout for log aggregators
    const logEntry = {
      time: new Date().toISOString(),
      level: 'info',
      method: method,
      path: req.path,
      status: status,
    };
    console.log(JSON.stringify(logEntry));
  });

  next();
});

// Root endpoint: simple greeting response
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the DevOps demo app' });
});

// Health check endpoint: used by container orchestrators and monitoring to verify liveness/readiness
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Intentional error endpoint: exists strictly to simulate 5xx errors for testing alert rules
app.get('/error', (req, res) => {
  res.status(500).json({ error: 'intentional failure for testing alerts' });
});

// Prometheus metrics endpoint: scraped by Prometheus server
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Start the Express server only when executed directly (not when imported by test suites)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(JSON.stringify({
      time: new Date().toISOString(),
      level: 'info',
      message: `Server listening on port ${PORT}`,
    }));
  });
}

// Export the Express application instance for automated testing
module.exports = app;
