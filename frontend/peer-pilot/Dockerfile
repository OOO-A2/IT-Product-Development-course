# Build stage
FROM node AS builder

WORKDIR /app

# Copy package files separately for better caching
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies (this layer will be cached if package files don't change)
RUN npm ci

# Copy source code (this happens after dependency installation)
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]