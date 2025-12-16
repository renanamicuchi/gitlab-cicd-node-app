FROM node:18

# Define the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY app/package*.json ./
RUN npm install

# Copy the application code into the working directory
COPY app/ .

# Expose the port that the app listens on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]