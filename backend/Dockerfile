# Build
FROM golang:1.21.1-alpine AS builder

WORKDIR /build
COPY . ./backend

ENV CGO_ENABLED=0
ENV GOOS=linux
# GOARCH is automatically detected from the environment i.e. the build image.

RUN go build -C ./backend -o ../zeevision ./cmd/zeevision/main.go

# Install
FROM alpine:3.18

WORKDIR /app
COPY --from=builder /build/zeevision /usr/bin/zeevision

CMD ["zeevision"]
