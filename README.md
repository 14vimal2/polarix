## Local Development with Docker Compose

This project is configured as a monorepo using Bun workspaces. The entire application stack is managed by Docker Compose for a consistent and reliable development environment.

**Prerequisites:**

*   Docker & Docker Compose
*   Bun (for local UI library development)

### First-Time Setup

There are two one-time steps to prepare your environment.

1.  **Generate Lockfile and Install Dependencies:**
    This command uses a Docker container to ensure the `bun.lock` file is created in a consistent environment, preventing dependency issues. It will also install dependencies into your local `node_modules` directory.
    ```bash
    docker compose run --rm dependency-builder
    ```

2.  **Build the Frontend Docker Image:**
    The frontend requires the `backend` service to be running to generate its API client. This script automates that process.
    ```bash
    ./build-frontend.sh
    ```

### Daily Development Workflow

*   **To start the entire application:**
    ```bash
    docker compose up
    ```
    This will start `postgres`, `keycloak`, `backend`, and the pre-built `frontend`.

*   **To stop the application:**
    ```bash
    docker compose down
    ```

*   **Access the services:**
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:8080`
    *   Keycloak: `http://localhost:8081`

---

### UI Library (`@polarix/ui`) Development

If you make changes to the UI library, you need to rebuild it and then rebuild the frontend Docker image to see those changes reflected in the application.

1.  **Rebuild the UI library:**
    From the project's root directory, run the build command for the `@polarix/ui` package:
    ```bash
    bun run --filter @polarix/ui build
    ```

2.  **Re-generate the lockfile:**
    After rebuilding the library, it's a good practice to regenerate the lockfile to ensure all dependencies are consistent.
    ```bash
    docker compose run --rm dependency-builder
    ```

3.  **Rebuild the frontend image:**
    Run the build script again. It will use the newly built UI library files and the updated lockfile.
    ```bash
    ./build-frontend.sh
    ```

4.  **Restart the application:**
    ```bash
    docker compose up
    ```
