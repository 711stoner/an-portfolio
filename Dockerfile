FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Ship prebuilt static files from the repository to avoid build-time npm issues.
COPY . /usr/share/nginx/html/

# Use the custom nginx config for SPA-style routing and cache headers.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
