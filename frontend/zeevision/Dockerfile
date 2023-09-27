## Dockerfile for Frontend (Development) ##

# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Expose the port that development server runs on 
EXPOSE 3000

# Define the command to start development server 
CMD ["npm", "run", "dev"]
