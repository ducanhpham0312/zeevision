## Dockerfile for Frontend ##

# Use node as the builder image
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

COPY . ./

# Build the project
RUN npm run build

# Use nginx as the production image
FROM nginx:1.25-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output for serving
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
