# frontend/custom-nginx.template
upstream backend {
    server ${BACKEND_HOST};
}

server {
    listen 80;

    location /api/ {
      proxy_pass http://backend$request_uri;
    }

    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
    }
}

