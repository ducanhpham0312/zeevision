#!/usr/bin/env sh

# This starts the backend server in the background. It has only the API exposed and playground enabled.
# NOTE: run this from /backend directory.

docker build --tag zeevision_backend .
docker run --rm -it --pull never --name zeevision_backend --network kafka_network --detach --publish 8081:8081 zeevision_backend
