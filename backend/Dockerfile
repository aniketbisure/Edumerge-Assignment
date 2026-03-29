# Use Node.js 20 base image
FROM node:20-alpine

# Use /app as the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including typescript) for building
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (compiles TS to JS)
RUN npx tsc

# Expose the port the app runs on
EXPOSE 5000

# Start command (runs from the compiled dist folder)
CMD ["node", "dist/server.js"]
