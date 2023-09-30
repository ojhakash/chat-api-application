FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code to the container
COPY . .

# Expose the port that your Node.js app will listen on (change this to match your app's port)
EXPOSE 5000

# Start the Node.js application
CMD ["npm", "run", "dev"]