# GitLab CI/CD Node.js Application

This repository demonstrates a simple Node.js application deployed via two different CI/CD pipelines using GitLab:

1. **Docker**: Builds and pushes a container image.
2. **Kubernetes (GCP)**: Deploys the container to a Kubernetes cluster on Google Cloud Platform (GCP).

## Project Structure

```
gitlab-cicd-node-app/
│
├── app/                  # Source code of the Node.js app
│   ├── index.js
│   └── package.json
│
├── Dockerfile            # Dockerfile used to build the container image
├── .gitlab-ci.yml        # GitLab CI/CD configuration
│
├── k8s/                  # Kubernetes deployment manifests
│   ├── deployment.yaml
│   └── service.yaml
│
└── README.md             # Project overview and usage instructions
```

## Application Overview

The application is a minimal Express server that responds with a simple message at the root endpoint. It listens on port `3000` by default and can be run locally or within a container.

### Running Locally

To run the application without containers:

```bash
# Install dependencies
cd app
npm install

# Start the server
npm start

# The application will be available at http://localhost:3000
```

### Docker Build and Run

You can build and run the Docker container manually:

```bash
# Build the image
docker build -t node-ci-cd-app .

# Run the container
docker run -p 3000:3000 node-ci-cd-app

# Access at http://localhost:3000
```

## GitLab CI/CD

The CI/CD pipeline (`.gitlab-ci.yml`) defines two stages: `build` and `deploy`. Each stage runs conditionally based on the branch.

### Build Stage

The build stage executes in a Docker environment (`docker:dind`). It performs the following steps:

1. Logs into the GitLab Container Registry using the CI credentials.
2. Builds the image defined by the `Dockerfile` and tags it as `$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_NAME`.
3. Pushes the image to the GitLab registry.

The build stage runs only on branches named `docker` or `kubernetes`.

### Deploy Stage

The deploy stage is designed to deploy the container image to a Kubernetes cluster on GCP. It runs only on the `kubernetes` branch. During deployment, it:

1. Authenticates with Google Cloud using a service account key stored in the `GCP_KEY` CI/CD variable (base64 encoded).
2. Fetches credentials for the target Kubernetes cluster using `gcloud container clusters get-credentials`.
3. Applies the Kubernetes manifests located in the `k8s/` directory via `kubectl apply -f k8s/`.

Ensure you set the following variables in your GitLab project CI/CD settings:

| Variable        | Description                                   |
|-----------------|-----------------------------------------------|
| `CI_REGISTRY`   | GitLab container registry URL                 |
| `CI_REGISTRY_USER` | Registry username (typically your GitLab CI user) |
| `CI_REGISTRY_PASSWORD` | Registry password/token                    |
| `GCP_KEY`       | Base64‑encoded JSON key for a GCP service account |
| `PROJECT_ID`    | GCP project ID                                |
| `CLUSTER_NAME`  | Name of the Kubernetes cluster                 |
| `ZONE`          | Zone/region where the cluster is located      |

### Branch Strategy

- **docker** branch: Triggers the build stage to build and push the image. No Kubernetes deployment runs on this branch.
- **kubernetes** branch: Runs both the build stage and deploy stage. This branch should contain the Kubernetes manifests with the correct image reference. You can automate replacement of the image name using your deployment scripts or specify the image directly in `k8s/deployment.yaml`.

## Kubernetes Manifests

The files under `k8s/` define how your application is deployed in Kubernetes:

- `deployment.yaml`: Describes the Deployment with 2 replicas. Update the `image:` field to match your container image (e.g., `$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_NAME` or a fixed tag).
- `service.yaml`: Exposes the application through a LoadBalancer service on port 80, forwarding traffic to port 3000 on the pods.

To deploy manually from your local machine (requires `kubectl` and `gcloud`):

```bash
# Authenticate with GCP
gcloud auth activate-service-account --key-file=path/to/keyfile.json

# Get cluster credentials
gcloud container clusters get-credentials YOUR_CLUSTER_NAME --zone YOUR_ZONE --project YOUR_PROJECT_ID

# Apply manifests
kubectl apply -f k8s/

# Check deployment and service
kubectl get deployments
kubectl get services
```

## Extending This Project

This example serves as a starting point for building more complex pipelines and deployments. You can enhance it by:

1. Adding environment‑specific configurations (dev/stage/prod).
2. Using Helm charts for more maintainable deployments.
3. Integrating automated tests in your CI pipeline.
4. Implementing continuous delivery strategies, such as Blue/Green or Canary deployments.

## License

This project is open source and free to use for educational purposes.