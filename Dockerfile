FROM nginx:alpine

WORKDIR /usr/share/nginx/html

ENV PORT=80

# Ship prebuilt static files from the repository to avoid build-time npm issues.
COPY . /usr/share/nginx/html/

# Let the official nginx entrypoint render the Zeabur runtime port into config.
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
