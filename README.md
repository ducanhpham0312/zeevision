# ZeeVision
A Zeebe workflow monitoring application.

| Folder | Master | Code coverage |
|--------|--------|---------------|
| Frontend  | ![Master](https://github.com/ducanhpham0312/zeevision/actions/workflows/frontend-build.yml/badge.svg) | [![Codecov](https://codecov.io/gh/ducanhpham0312/zeevision/graph/badge.svg?token=CJ4PLKQ839&flag=frontend)](https://app.codecov.io/gh/ducanhpham0312/zeevision) |
|Backend| ![Master](https://github.com/ducanhpham0312/zeevision/actions/workflows/backend-build.yml/badge.svg) | [![Codecov](https://codecov.io/gh/ducanhpham0312/zeevision/graph/badge.svg?token=CJ4PLKQ839&flag=backend)](https://app.codecov.io/gh/ducanhpham0312/zeevision) |

- [ZeeVision](#zeevision)
  - [Installations](#installations)
  - [Setup the test-bench](#setup-the-test-bench)
  - [Run the application](#run-the-application)
  - [Deploy processes and create instances](#deploy-processes-and-create-instances)

## Installations
- [Git](https://formulae.brew.sh/formula/git)
- [Docker](https://www.docker.com/get-started/)
- Backend- and frontend-specific development tools: Check the [backend README](./backend/README.md) and [frontend README](./frontend/README.md)

## Setup the test-bench
1. Clone the modified [zeebe-test-bench](https://github.com/kauppie/zeebe-test-bench): 
   ```bash 
   git clone https://github.com/kauppie/zeebe-test-bench.git
   ```
2. Open `zeebe-test-bench`, follow the [Installation](https://github.com/kauppie/zeebe-test-bench/blob/main/README.md#installation) and [Setup](https://github.com/kauppie/zeebe-test-bench/blob/main/README.md#setup) guidelines in the repository's README. Verify in Docker Desktop that the containers are running normally.

## Run the application
1. Clone ZeeVision: 
   ```bash 
   git clone https://github.com/ducanhpham0312/zeevision.git
   ```
2. Open `zeevision` in the command line, then build and run the application as a whole stack: 
   ```bash
   docker compose up --build
   ```
3. Open `localhost:8080` to start.

## Deploy processes and create instances
- Please follow the guidelines in `zeebe-test-bench` to see the steps

