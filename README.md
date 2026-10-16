# DevOps Demo Application

A minimal, production-style Node.js and Express service created as part of a practical DevOps learning project covering CI, CD, monitoring, and logging across incremental phases.

## Endpoints

- `GET /`: Returns JSON greeting (`{ "message": "Hello from the DevOps demo app" }`) and sets `X-Request-Id` header.
- `GET /health`: Returns JSON health status (`{ "status": "ok" }`).
- `GET /error`: Returns HTTP 500 (`{ "error": "intentional failure for testing alerts" }`) to simulate failures.
- `GET /metrics`: Exposes Prometheus metrics (Node.js runtime metrics + custom `http_requests_total` counter and `http_request_duration_seconds` histogram).

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

## CD (Continuous Delivery)

Continuous Delivery is managed via GitOps using Argo CD running on a local Docker Desktop Kubernetes cluster:

1. **Merge to `main`**: A feature branch is merged into `main`.
2. **CI Builds & Pushes**: GitHub Actions tests, builds, scans, and pushes the container image to GHCR.
3. **Manifest Tag Update**: The `update-manifest` workflow job modifies the image tag in `k8s/deployment.yaml` with the commit SHA and pushes `chore: deploy <sha> [skip ci]` directly to `main`.
4. **GitOps Sync**: Argo CD continuously monitors the repository, detects the updated manifest in Git, and automatically synchronizes (prunes and self-heals) the state into the `demo` namespace in the Docker Desktop Kubernetes cluster.

## Monitoring

The `monitoring/` directory provisions an in-cluster observability stack using Prometheus and Grafana:

- **Prometheus**: Automatically discovers and scrapes `demo-api` pods using Kubernetes pod annotations (`prometheus.io/scrape`), evaluates alert rules, and stores metrics.
- **Grafana**: Automatically provisions Prometheus as the default datasource and imports a pre-built "Demo API - Golden Signals" dashboard.

### Alert Rules

- `AppDown`: Fires if all `demo-api` pods are unreachable (`up{job="demo-api"} == 0`) for 1 minute.
- `HighErrorRate`: Fires if 5xx responses exceed 5% of total requests over a 2-minute window.
- `HighMemory`: Fires if resident memory of a `demo-api` pod exceeds 100MB for 2 minutes.
- `SlowRequests`: Fires if 95th percentile request latency exceeds 500ms over a 2-minute window.

### Accessing Prometheus

```powershell
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```
Open `http://localhost:9090` in your browser.

## Logging

The logging architecture uses **Grafana Alloy** for log collection and **Grafana Loki** for indexing and storage:

- **Grafana Alloy**: Discovers `demo-api` pods via the Kubernetes API, extracts container logs, attaches labels (`namespace`, `pod`, `container`, `app`), and pushes them directly to Loki.
- **Why Alloy instead of Promtail?**: Promtail reached its official End of Life (EOL) on March 2, 2026. Grafana Alloy is the official unified, next-generation collector for logs, metrics, and traces across the Grafana ecosystem.
- **Grafana Loki**: Minimal single-binary log aggregation database configured with TSDB index and filesystem storage.

### Useful LogQL Queries

- **All Demo API logs**:
  ```logql
  {namespace="demo", app="demo-api"}
  ```
- **Parse JSON logs and filter by level (errors only)**:
  ```logql
  {namespace="demo", app="demo-api"} | json | level="error"
  ```
- **Log volume rate over time grouped by level**:
  ```logql
  sum by (level) (count_over_time({namespace="demo", app="demo-api"} | json [1m]))
  ```
- **Trace a single request using its correlation ID**:
  ```logql
  {namespace="demo", app="demo-api"} |= "<requestId>"
  ```

### Accessing Grafana (Metrics & Logs)

```powershell
kubectl port-forward -n monitoring svc/grafana 3001:80
```
Open `http://localhost:3001` in your browser:
- **Username**: `admin`
- **Password**: `admin`
- **Dashboards**:
  - `Demo API - Golden Signals` (Prometheus metrics)
  - `Demo API - Logs` (Loki logs with request ID filtering)

> [!WARNING]
> The Grafana credentials (`admin` / `admin`) are hardcoded for this local learning environment only. Production deployments should use Kubernetes Secrets or an external secret store.

## Project Phases (Complete)

- **Phase 0: Base Service** — Minimal Node.js Express service, Dockerfile, and docker-compose.
- **Phase 1: CI (Continuous Integration)** — Automated testing, container scanning (Trivy), and GHCR publishing.
- **Phase 2: CD (Continuous Delivery/Deployment)** — GitOps delivery with Argo CD on Docker Desktop Kubernetes.
- **Phase 3: Monitoring** — Prometheus metrics scraping, alerting rules, and Grafana Golden Signals dashboard.
- **Phase 4: Logging** — Structured JSON logging with request correlation IDs, Grafana Alloy collector, Loki store, and Grafana Logs dashboard.
