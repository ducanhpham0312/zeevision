# zeevision
A Zeebe workflow monitoring application.

| Folder | Master | Code coverage |
|--------|--------|---------------|
| Frontend  | ![Master](https://github.com/ducanhpham0312/zeevision/actions/workflows/frontend-build.yml/badge.svg) | ![Codecov](https://codecov.io/gh/ducanhpham0312/zeevision/graph/badge.svg?token=CJ4PLKQ839&flag=frontend) |
|Backend| ![Master](https://github.com/ducanhpham0312/zeevision/actions/workflows/backend-build.yml/badge.svg) | ![Codecov](https://codecov.io/gh/ducanhpham0312/zeevision/graph/badge.svg?token=CJ4PLKQ839&flag=backend) |

For developers, below are some shortcuts to the designated "areas":
- [Project Board](https://github.com/users/ducanhpham0312/projects/1)
- [Internal workflow documentation](https://github.com/ducanhpham0312/zeevision-private/blob/master/workflow/README.md)
- [Internal discussion with customer](https://github.com/ducanhpham0312/zeevision-private/discussions/113)
- [Codecov detailed Code Coverage report](https://app.codecov.io/gh/ducanhpham0312/zeevision)

## Build and Run

Building and running the whole stack (backend and frontend) is done by running

```bash
$ docker compose up --build
```

in the root directory of the project. Use the `--build` flag to ensure the images used are up-to-date. You may need to `docker image prune` once in a while to clean up old images.

Docker will build the backend and frontend separately, and combine them to single image where backend serves the frontend. The app will be available at `localhost:8080`. The API will be available at `localhost:8081/graphql` and the API Playground at `localhost:8081/playground`.

## API and Playground

When backend is running locally, you can access [`localhost:8081/playground`](http://localhost:8081/playground) to try out the API. For more information about the playground, see [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql).

To try out the API Playground, try putting the query below to the query field and executing it with the pink arrow.

```graphql
query ManyProcesses {
  processes(pagination: { limit: 3, offset: 0 }) {
    totalCount
    items {
        bpmnProcessId
        processKey
    }
  }
}
```

You should see a JSON response with structure similar to this (after [filling the database](#filling-database-with-data) or deploying a process to Zeebe):

```json
{
  "data": {
    "processes": {
      "totalCount": 5,
      "items": [
        {
          "bpmnProcessId": "money-loan",
          "processKey": 123456
        },
        {
          "bpmnProcessId": "order-subprocess",
          "processKey": 409187
        },
        {
          "bpmnProcessId": "order-main",
          "processKey": 912375
        }
      ]
    }
  }
}
```

The whole GraphQL API schema is defined [here](../backend/graph/schema.graphqls), and it is used directly by [gqlgen](https://gqlgen.com/) to generate Go code.

## GUI database management

With `pgadmin`, you can perform query, visualise data, utilize dashboards, etc with GUI. See more [here](https://www.pgadmin.org/docs/pgadmin4/7.8/index.html)

### Environment variables

- `POSTGRES_DB`: zeevision_db
- `POSTGRES_USER`: user
- `POSTGRES_PASSWORD`: pass
- `HOST`: postgres
- `PGADMIN_EMAIL`: user@example.com
- `PGADMIN_PASSWORD`: pass

Defined in [docker-compose.yml](../docker-compose.yml)

### Set up and access step-by-step

1.  After backend is running, open login page through [`localhost:5050`](http://localhost:5050)
2. Log in with `PGADMIN_EMAIL` and `PGADMIN_PASSWORD`
3. In *Quick Links* box, choose **Add New Server**, then it will pop up *Register-Server* modal 
4. In *General* tab, put `POSTGRES_DB` into *Name* field
5. In *Connection* tab, 
   - put `HOST` into **Host name/address** field
   - put `POSTGRES_USER` into **Username** field
   - put `POSTGRES_PASSWORD` into **Password** field
6. Choose **Save**

After this you should see *Servers* on the right menu.

### Filling database with data

You can use [`fill_db.sql`](test/data/fill_db.sql) to fill the database with some data. You can open the *Query Tool* for the database, paste the contents of the file there, and execute it. You can also use the *Query Tool* to execute any other SQL queries you want.

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
    postgres <-.-> |GUI managed| pgadmin([PgAdmin])
```

Consumer has connection to Kafka and streams them directly to _Storage_ using its provided **Store API**. Consumer here indirectly filters unnecessary information from the received messages when converting to Storage compatible types. Storage has **Fetch API** which is used by the _Endpoint_ to fetch data from the database. Endpoint has GraphQL API which is used by the _Frontend_ to query data from the backend. Arrows in the diagram show the direction of the data flow.