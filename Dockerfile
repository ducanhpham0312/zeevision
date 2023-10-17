# Use golang as the backend builder image
FROM golang:1.21-alpine AS backend-builder

WORKDIR /build

# Download backend dependencies
COPY backend/go.mod backend/go.sum ./
RUN go mod download

ENV CGO_ENABLED=0
ENV GOOS=linux
# GOARCH is automatically detected from the environment i.e. the build image.

# Build the backend
COPY backend/ ./
RUN go build -o ../zeevision ./cmd/zeevision/main.go

# Use node as the frontend builder image
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Build the frontend
COPY frontend/ ./
RUN npm run build

# Install
FROM alpine:3.18

WORKDIR /app

COPY --from=backend-builder /zeevision /usr/bin/zeevision
COPY --from=frontend-builder /build/dist /app/static

ENV ENDPOINT_PORT=8080

EXPOSE ${ENDPOINT_PORT}

CMD ["zeevision"]
