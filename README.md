# Polarix

Polarix is a full-stack web application featuring a Java-based backend and a Next.js frontend, containerized with Docker for easy setup and deployment.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Technology Stack

- **Backend**: Java, Spring Boot
- **Frontend**: Next.js, React, TypeScript
- **UI Library**: `@polarix/ui` (Internal component library)
- **Database**: PostgreSQL
- **Authentication**: Keycloak
- **Containerization**: Docker, Docker Compose

## Project Structure

The repository is organized into the following main directories:

- `backend/`: Contains the Java/Spring Boot backend application.
- `frontend/`: Contains the Next.js frontend application.
- `polarix_ui/`: A dedicated UI component library for internal use.
- `data/`: Contains data scripts, including Keycloak realm configurations.
- `postgres-init/`: Initialization scripts for the PostgreSQL database.
- `docker-compose.yml`: Defines the services, networks, and volumes for the Docker application.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Java](https://www.oracle.com/java/technologies/downloads/) (for running backend outside of docker)
- [Node.js](https://nodejs.org/en/download/) (for running frontend outside of docker)

### Installation

1.  **Clone the repository**
    
    git clone <repository-url>
    cd polarix
    2.  **Build and run with Docker Compose**

    From the root directory, run the following command to build and start all the services defined in `docker-compose.yml`:
    
    docker-compose up --build
        This will start the backend, frontend, database, and other services in their respective Docker containers.

## Usage

Once the services are running, you can access the application:

-   **Frontend**: Open your browser and navigate to `http://localhost:5173`
-   **Backend API**: The API should be accessible at `http://localhost:8080`

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
