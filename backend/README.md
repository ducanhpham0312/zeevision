# ZeeVision Backend

- [ZeeVision Backend](#zeevision-backend)
  - [Build and Run](#build-and-run)
  - [API Playground](#api-playground)

This subdirectory contains code for the backend of the ZeeVision application. It serves GraphQL based API for the frontend and consumes Kafka stream of Zeebe data. Backend uses PostgreSQL to store information
received from Kafka.

## Build and Run

To build and run only the backend without hosting also the frontend, you can run the [`run_api.sh`](run_api.sh) script from this directory. The API will be available at `localhost:8081/graphql` but requires external
tools to make requests to.

## API Playground

When backend is running, you can access [`localhost:8081/playground`](http://localhost:8081/playground) to try out the API. For example, try putting this query to the query field and executing it with the pink arrow or `Ctrl+Enter`:

```graphql
query Test {
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

You can also query for just one process by its key:

```graphql
query Test {
    process(processKey: 1) {
        processId
        processKey
    }
}
```

The response should look like this:

```json
{
  "data": {
    "process": {
      "processId": 123,
      "processKey": 1
    }
  }
}
```
