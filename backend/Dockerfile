# Build
FROM golang:1.21.1-alpine AS builder

WORKDIR /build

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

ENV CGO_ENABLED=0
ENV GOOS=linux
# GOARCH is automatically detected from the environment i.e. the build image.

# Build
COPY . ./
RUN go build -o ../zeevision ./cmd/zeevision/main.go

# Install
FROM alpine:3.18

WORKDIR /app
COPY --from=builder /zeevision /usr/bin/zeevision

ENV PORT=8080

EXPOSE 8080

CMD ["zeevision"]
