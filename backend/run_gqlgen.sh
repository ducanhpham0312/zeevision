#!/usr/bin/env sh

# This script is used generate Go code from GraphQL schema.
# NOTE: run this every time you change the GraphQL schema.

go run github.com/99designs/gqlgen generate
