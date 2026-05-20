# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY frontend/shopflow-ui/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/shopflow-ui/ ./
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine AS runtime

# Copy build output to NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom NGINX config
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]