# Use Node.js 20 base image
FROM node:20-alpine

# Use /app as the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expone the port the app runs on
EXPOSE 5000

# Start command
CMD ["node", "server.js"]
