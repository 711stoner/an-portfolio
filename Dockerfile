# Build stage - minify assets
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Minify JavaScript and CSS files
RUN npx terser assets/js/main.js -c -m -o assets/js/main.min.js && \
    npx terser assets/js/data.js -c -m -o assets/js/data.min.js && \
    npx terser assets/js/detail.js -c -m -o assets/js/detail.min.js && \
    npx csso assets/css/style.css -o assets/css/style.min.css && \
    npx csso assets/css/fonts.css -o assets/css/fonts.min.css

# Final stage - serve static files with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

