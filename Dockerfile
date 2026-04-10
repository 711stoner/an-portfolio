# Multi-stage build: first compress assets, then serve with nginx
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Run compression
RUN npx terser assets/js/main.js -c -m -o assets/js/main.min.js && \
    npx terser assets/js/data.js -c -m -o assets/js/data.min.js && \
    npx terser assets/js/detail.js -c -m -o assets/js/detail.min.js && \
    npx csso assets/css/style.css -o assets/css/style.min.css && \
    npx csso assets/css/fonts.css -o assets/css/fonts.min.css

# Final stage: nginx server
FROM nginx:alpine

# Copy compressed assets from builder
COPY --from=builder /app /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

