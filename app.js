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

// Middleware for request metrics tracking and structured JSON logging to stdout
app.use((req, res, next) => {
  // Wait until the response is sent to capture the final status code and resolved route
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    const status = res.statusCode;
    const method = req.method;

    // Increment custom Prometheus counter with label values
    httpRequestCounter.inc({
      method: method,
      route: route,
      status: status,
    });

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

// Prometheus metrics endpoint: scraped by Prometheus server
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    level: 'info',
    message: `Server listening on port ${PORT}`,
  }));
});
