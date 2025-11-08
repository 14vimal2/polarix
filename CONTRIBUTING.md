# Contributing to Polarix

First and foremost, thank you for considering contributing to Polarix! We truly appreciate the time and effort you're willing to invest. Contributions are the lifeblood of open source, and every contribution, no matter how small, is valuable.

## Code of Conduct

We have a [Code of Conduct](./CODE_OF_CONDUCT.md) that we expect all contributors to adhere to. Please take a moment to read it before you start.

## How Can I Contribute?

There are many ways to contribute, from writing code and documentation to reporting bugs and suggesting new features.

### Reporting Bugs

If you find a bug, please open an issue on our [GitHub issue tracker](https://github.com/your-repo/polarix/issues). When you report a bug, please include:

-   A clear and descriptive title.
-   A detailed description of the problem, including steps to reproduce it.
-   Information about your environment (e.g., browser, OS).
-   Any relevant logs or screenshots.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please open an issue to discuss it. This allows us to give you feedback and ensure that your contribution aligns with the project's goals.

### Pull Requests

We welcome pull requests! If you'd like to contribute code, please follow these steps:

1.  **Fork the repository** and create a new branch from `main`.
2.  **Set up your development environment** by following the instructions below.
3.  **Make your changes.** Ensure that your code follows the project's coding conventions.
4.  **Write tests** for your changes. We strive for a high level of test coverage.
5.  **Ensure all tests pass** before submitting your pull request.
6.  **Submit a pull request** with a clear description of your changes.

## Development Setup

The recommended way to set up your development environment is by using Docker. This ensures that you have a consistent environment that matches production.

1.  **Follow the instructions** in the main [README.md](./README.md) to get the full application stack running with `docker-compose up --build`.

2.  **Live Reloading**: The `docker-compose.yml` is configured to mount the source code directories (`backend`, `frontend`, `polarix_ui`) into the respective service containers. This means that any changes you make to the code on your local machine will be reflected inside the containers, and services like the Next.js frontend should automatically reload.

### Optional: Running Services Natively

In some cases, you might want to run a specific service outside of Docker (natively on your machine) for easier debugging or faster feedback loops.

To do this, you would first stop the specific service in Docker:
`docker-compose stop <service_name>` (e.g., `frontend`)

Then, you can follow the instructions below to run it on your host machine.

#### Backend (Java/Spring Boot)

1.  Navigate to the `backend` directory.
2.  Build the project:
    
    cd backend
    ./mvnw clean install
    3.  Run the application:
    
    ./mvnw spring-boot:run
    #### Frontend (Next.js)

1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    
    cd frontend
    npm install
    3.  Run the development server:
    npm run dev
    #### UI Library (`polarix_ui`)

The UI library is a separate package. If you make changes here, you'll need to rebuild it to see the changes in the frontend.

1.  Navigate to the `polarix_ui` directory.
2.  Install dependencies and build the library:
    
    cd polarix_ui
    npm install
    npm run build
    ## Coding Conventions

### Java (Backend)

-   Please adhere to standard Java coding conventions.
-   We recommend using an IDE that supports Checkstyle to ensure your code is formatted correctly.

### TypeScript/React (Frontend & UI Library)

-   We use ESLint and Prettier for code linting and formatting.
-   Before committing your changes, please run:
    
    npm run lint
    npm run format
    ## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us generate changelogs and makes it easier to track changes.

Examples:
- `feat(frontend): add user profile page`
- `fix(backend): correct password validation logic`
- `docs: update README with setup instructions`

## Pull Request Process

1.  Ensure your pull request has a clear title and description.
2.  Link to any relevant issues.
3.  Your pull request will be reviewed by at least one maintainer.
4.  Once your pull request is approved, it will be merged into the `main` branch.

Thank you for your contribution!