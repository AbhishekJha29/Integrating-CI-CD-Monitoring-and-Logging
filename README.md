# DevOps Demo Application (Phase 0)

A minimal, production-style Node.js and Express service created as Phase 0 of a practical DevOps learning project. This project focuses strictly on CI, CD, monitoring, and logging across incremental phases without unnecessary complexity.

## Endpoints

- `GET /`: Returns JSON greeting (`{ "message": "Hello from the DevOps demo app" }`).
- `GET /health`: Returns JSON health status (`{ "status": "ok" }`).
- `GET /metrics`: Exposes Prometheus metrics (Node.js default runtime metrics + custom `http_requests_total` counter).

## Running the Application

### Option 1: Locally with Node.js
```powershell
npm install
npm start
```

### Option 2: Using Docker Compose
```powershell
docker compose up --build
```

## Future Phases

- **Phase 1: CI (Continuous Integration)** — Automated linting, verification, and container builds.
- **Phase 2: CD (Continuous Delivery/Deployment)** — Automated deployment workflows.
- **Phase 3: Monitoring** — Prometheus scraping and Grafana dashboard visualization.
- **Phase 4: Logging** — Centralized log collection and analysis using structured stdout JSON.
