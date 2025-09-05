FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application (TypeScript 체크 없이)
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
