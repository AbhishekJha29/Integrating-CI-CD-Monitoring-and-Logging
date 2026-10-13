# DevOps Demo App

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

2. Run automated tests:
   ```bash
   npm test
   ```

3. Start the server:
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

## Continuous Integration (CI)

This project uses GitHub Actions (`.github/workflows/ci.yml`) for automated testing, image building, security scanning, and container publishing.

- **On Pull Requests (any branch):**
  1. Runs automated tests via `npm test` using Node.js 20.
  2. Builds the Docker image locally.
  3. Scans the container image with Aqua Security Trivy for fixable `CRITICAL` vulnerabilities.
  4. The image is **not** pushed to any registry.

- **On Push / Merge to `main`:**
  1. Executes the exact same test, build, and Trivy security scanning steps.
  2. Authenticates with GitHub Container Registry (`ghcr.io`).
  3. Pushes the validated Docker image tagged with both the commit SHA (`:<sha>`) and `:latest`.
  4. Triggers the CD manifest update job to bump the image tag in `k8s/deployment.yaml`.

- **Finding Pushed Images:**
  Published images are available on GitHub under your repository's **Packages** page (`ghcr.io/<owner>/<repo>:<tag>`).

## Continuous Deployment (CD)

Continuous Deployment is handled using GitOps via Argo CD targeting a local Kubernetes cluster (Docker Desktop Kubernetes or kind):

1. **Automated Manifest Update:** When code is merged to `main`, the CI workflow builds and pushes the new container image to GHCR, then runs the `update-manifest` job to replace the image tag in `k8s/deployment.yaml` with the new commit SHA and commits the change back to `main`.
2. **GitOps Sync:** Argo CD monitors the Git repository. Upon detecting changes to `k8s/`, it automatically synchronizes and applies the manifests (`namespace.yaml`, `deployment.yaml`, `service.yaml`) to the `demo` namespace in the local cluster with zero downtime.
