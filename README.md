# DevOps Demo Application

A minimal, production-style Node.js and Express service created as part of a practical DevOps learning project covering CI, CD, monitoring, and logging across incremental phases.

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

### Running Tests
```powershell
npm test
```

## CI (Continuous Integration)

This repository includes an automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`):

- **On Pull Requests (any branch):**
  - Runs automated unit tests (`npm test`).
  - Builds the container image locally.
  - Scans the image for vulnerabilities with Trivy (fails only on CRITICAL vulnerabilities).
  - *Does not push the image to any registry.*

- **On Push / Merge to `main`:**
  - Runs tests, builds the image, and scans it with Trivy.
  - Logs into GitHub Container Registry (`ghcr.io`).
  - Pushes the image tagged with both the commit SHA (`<image>:<commit-sha>`) and `:latest`.
  - Verifies the image manifest in GHCR using `docker buildx imagetools inspect`.

- **Where Pushed Images Appear:**
  - Published container images appear under the **Packages** tab on your GitHub profile (`https://github.com/<owner>?tab=packages`).

## Future Phases

- **Phase 1: CI (Continuous Integration)** — Automated testing, container scanning, and GHCR publishing.
- **Phase 2: CD (Continuous Delivery/Deployment)** — Automated deployment workflows.
- **Phase 3: Monitoring** — Prometheus scraping and Grafana dashboard visualization.
- **Phase 4: Logging** — Centralized log collection and analysis using structured stdout JSON.
