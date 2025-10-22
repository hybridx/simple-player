# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create music directory
RUN mkdir -p /app/music

# Expose the port the app runs on
EXPOSE 8080

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S musicapi -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R musicapi:nodejs /app
USER musicapi

# Start the application
CMD ["npm", "start"]