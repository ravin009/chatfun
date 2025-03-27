# Use the official Node.js image
FROM node:16-alpine

# Create and change to the app directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
