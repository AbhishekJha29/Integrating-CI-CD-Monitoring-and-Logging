const express = require('express');
const client = require('prom-client');

const app = express();

// Enable default system/process metrics collection (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics();

// Custom counter to track total HTTP requests with dimensional labels
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests handled',
  labelNames: ['method', 'route', 'status']
});

// Middleware for request metrics tracking and structured JSON logging
// Attached to the 'finish' event so we can capture the final HTTP status and resolved route
app.use((req, res, next) => {
  res.on('finish', () => {
    // Extract route pattern (e.g. /health) if matched to avoid high-cardinality label values; fallback to path
    const route = req.route ? req.route.path : req.path;

    // Increment Prometheus counter
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status: res.statusCode
    });

    // Output single structured JSON log line to stdout for observability and log shipping
    const logEntry = {
      time: new Date().toISOString(),
      level: 'info',
      method: req.method,
      path: req.originalUrl || req.path,
      status: res.statusCode
    };
    console.log(JSON.stringify(logEntry));
  });

  next();
});

// Root endpoint: basic greeting response
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the DevOps demo app' });
});

// Health endpoint: used by container orchestrators/load balancers for liveness and readiness probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Metrics endpoint: scraped by Prometheus collectors
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Port configuration: use PORT environment variable or fall back to port 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(JSON.stringify({
    time: new Date().toISOString(),
    level: 'info',
    message: `Server listening on port ${PORT}`
  }));
});
