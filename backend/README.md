# ZeeVision Backend

- [ZeeVision Backend](#zeevision-backend)
  - [Directory structure](#directory-structure)
  - [Development guidelines](#development-guidelines)
    - [File naming](#file-naming)
    - [Named return values and Naked returns](#named-return-values-and-naked-returns)
    - [Updating type and query definitions](#updating-type-and-query-definitions)

This subdirectory contains code for the backend of the ZeeVision application. It serves GraphQL based API for the frontend and consumes Kafka stream of Zeebe data. Backend uses PostgreSQL to store information
received from Kafka.

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

### Updating type and query definitions

During the development process, it is sometimes required to update type and queries, e.g., for `Process`, `Instance`, `Timer`, etc. All the changes must be made in `graph/schema.graphqls`:
- Open the file and navigate to the type/query you want to update.
- Update the type / query with correct fields.
- Under `/backend`, run `./run_gqlgen.sh` to update query in automatically generated files (`generated.go`, `models_gen.go`, `schema.resolvers.go`). DO NOT manually update those files (except `schema.resolvers.go` as the functions here create the query itself).
- Open the playground to test the new changes.
