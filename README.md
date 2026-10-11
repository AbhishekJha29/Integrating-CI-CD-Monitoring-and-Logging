# DevOps Demo App - Phase 0

A minimal, production-like Node.js + Express microservice designed as the foundation for a DevOps learning journey.

## Endpoints

- `GET /` - Returns JSON `{"message": "Hello from the DevOps demo app"}`
- `GET /health` - Health check probe returning JSON `{"status": "ok"}`
- `GET /metrics` - Prometheus metrics scraped by monitoring tools, exposing default process metrics and custom counter `http_requests_total` with `method`, `route`, and `status` labels.

Every incoming request also emits a single structured JSON log line to `stdout` containing `time`, `level`, `method`, `path`, and `status`.

## How to Run

### Option 1: Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The service will run at `http://localhost:3000`.

### Option 2: Run with Docker Compose

1. Build and run the container:
   ```bash
   docker compose up --build
   ```

2. Stop the container when finished:
   ```bash
   docker compose down
   ```

## Testing the Endpoints

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

## Upcoming Phases

- **Phase 1: Continuous Integration (CI)** - Automated linting, testing, and Docker image validation on pull requests.
- **Phase 2: Continuous Deployment (CD)** - Automated deployment pipeline to container registry and target environment.
- **Phase 3: Monitoring** - Prometheus metrics scraping and Grafana dashboards for observability.
- **Phase 4: Logging** - Centralized log aggregation and querying from stdout JSON streams.
