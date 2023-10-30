# Use golang as the backend builder image
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Download backend dependencies
COPY go.mod go.sum ./
RUN go mod download

ENV CGO_ENABLED=0
ENV GOOS=linux
# GOARCH is automatically detected from the environment i.e. the build image.

# Build the backend
COPY . ./
RUN go build -o ../zeevision ./cmd/zeevision/main.go

# Install
FROM alpine:3.18

WORKDIR /app
COPY --from=builder /zeevision /usr/bin/zeevision

ENV ZEEVISION_APP_PORT=8080
ENV ZEEVISION_API_PORT=8081
ENV ZEEVISION_PROD=0
ENV ZEEVISION_HOST_PLAYGROUND=1
ENV ZEEVISION_ALLOWED_ORIGINS="*"
ENV ZEEVISION_KAFKA_ADDR="kafka:9093"

EXPOSE ${ZEEVISION_APP_PORT} ${ZEEVISION_API_PORT}

CMD ["zeevision"]
