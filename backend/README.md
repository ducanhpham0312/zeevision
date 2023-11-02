# ZeeVision Backend

- [ZeeVision Backend](#zeevision-backend)
  - [Build and Run](#build-and-run)
  - [API and Playground](#api-and-playground)
  - [Architecture](#architecture)
  - [Directory structure](#directory-structure)
  - [Development guidelines](#development-guidelines)
    - [File naming](#file-naming)
    - [Named return values and Naked returns](#named-return-values-and-naked-returns)

This subdirectory contains code for the backend of the ZeeVision application. It serves GraphQL based API for the frontend and consumes Kafka stream of Zeebe data. Backend uses PostgreSQL to store information
received from Kafka.

## Build and Run

Building and running the whole stack (backend and frontend) is done by running

```bash
$ docker compose up --build
```

in the root directory of the project. Use the `--build` flag to ensure the images used are up-to-date. You may need to `docker image prune` once in a while to clean up old images.

Docker will build the backend and frontend separately, and combine them to single image where backend serves the frontend. The app will be available at `localhost:8080`. The API will be available at `localhost:8081/graphql` and the API Playground at `localhost:8081/playground`.

To build and run only the backend without hosting also the frontend, you can run the [`run_api.sh`](run_api.sh) script from this directory. API and API Playground will be available at the same addresses as above. You can use this image for easier development of the frontend with hot-reloading by running `npm run dev` normally.

## API and Playground

When backend is running locally, you can access [`localhost:8081/playground`](http://localhost:8081/playground) to try out the API. For more information about the playground, see [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql).

To try out the API Playground, try putting the query below to the query field and executing it with the pink arrow.

```graphql
query ManyProcesses {
    processes {
        processId
        processKey
    }
}
```

You should see a JSON response with structure similar to this:

```json
{
  "data": {
    "processes": [
      {
        "processId": 123,
        "processKey": 1
      },
      {
        "processId": 222,
        "processKey": 2
      }
    ]
  }
}
```

The whole GraphQL API schema is defined [here](../backend/graph/schema.graphqls), and it is used directly by [gqlgen](https://gqlgen.com/) to generate Go code.

## Architecture

Simplified architecture diagram of ZeeVision and its relation Kafka, PostgreSQL and the frontend:

```mermaid
flowchart LR
    kafka([Kafka]) -.->|Sarama lib| Consumer
    subgraph ZeeVision
        Consumer -->|Store API| Storage
        Storage -->|Fetch API| Endpoint
    end
    Storage <-.->|GORM lib| postgres[(PostgreSQL)]
    Endpoint -.->|GraphQL| front([Frontend])
```

Consumer has connection to Kafka and streams them directly to _Storage_ using its provided **Store API**. Consumer here indirectly filters unnecessary information from the received messages when converting to Storage compatible types. Storage has **Fetch API** which is used by the _Endpoint_ to fetch data from the database. Endpoint has GraphQL API which is used by the _Frontend_ to query data from the backend. Arrows in the diagram show the direction of the data flow.

## Directory structure

This directory mostly follows the [standard Go project layout](https://github.com/golang-standards/project-layout). The most important directories are:

- [`cmd`](cmd): Contains the main entrypoint of the application.
- [`graph`](graph): Contains the GraphQL schema and generated code.
- [`internal`](internal): Contains the internal packages of the application. These are not meant to be imported from outside the application for any reason.

## Development guidelines

Useful resources about Go:

- [Effective Go](https://go.dev/doc/effective_go)
- [Go by Example](https://gobyexample.com/)

Below are some exceptions and additions to the guidelines.

### File naming

- Use nouns and `snake_case` for file names.
- Prefer concise names which describe the content of the file.

### Named return values and Naked returns

- Prefer to not use named return values. Return values should be obvious from the context, their types, and finally from the function/method comment.
- Don't use naked returns. They make the code harder to read and understand.