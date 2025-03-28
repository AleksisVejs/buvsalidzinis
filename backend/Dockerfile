# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker layer caching
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev --only=production

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "server.js" ] 