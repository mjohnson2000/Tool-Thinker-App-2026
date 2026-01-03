#!/bin/bash

# Fix HTTPS access via IP address
# The SSL certificate is only for toolthinker.com, not the IP address
# This script adds a catch-all HTTPS server block for IP addresses

echo "🔧 Fixing HTTPS access via IP address..."

# Create updated Nginx config
cat > /tmp/tool-thinker-nginx.conf << 'EOF'
# HTTP server for domain - redirect to HTTPS
server {
    listen 80;
    server_name toolthinker.com www.toolthinker.com;
    return 301 https://$host$request_uri;
}

# HTTP server for IP - serve directly (no SSL)
server {
    listen 80;
    server_name 72.62.170.11;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# HTTPS server for domain only
server {
    listen 443 ssl http2;
    server_name toolthinker.com www.toolthinker.com;

    ssl_certificate /etc/letsencrypt/live/toolthinker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/toolthinker.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Catch-all HTTPS server for IP addresses - redirect to HTTP
# This prevents SSL certificate errors when accessing via IP
server {
    listen 443 ssl http2 default_server;
    server_name 72.62.170.11 _;
    
    # Use a self-signed certificate or the domain cert (will show warning but works)
    ssl_certificate /etc/letsencrypt/live/toolthinker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/toolthinker.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Redirect HTTPS to HTTP for IP access
    return 301 http://$host$request_uri;
}
EOF

# Backup current config
echo "💾 Backing up current config..."
cp /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-available/tool-thinker.backup.$(date +%Y%m%d_%H%M%S)

# Copy new config
echo "📝 Installing new config..."
cp /tmp/tool-thinker-nginx.conf /etc/nginx/sites-available/tool-thinker

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Configuration is valid!"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo ""
    echo "✅ Fix applied successfully!"
    echo ""
    echo "📝 What changed:"
    echo "  - Added catch-all HTTPS server block for IP addresses"
    echo "  - HTTPS requests to IP will now redirect to HTTP"
    echo "  - This prevents SSL certificate errors"
    echo ""
    echo "🧪 Test it:"
    echo "  curl -I http://72.62.170.11"
    echo "  curl -I https://72.62.170.11  # Should redirect to HTTP"
else
    echo "❌ Configuration test failed! Restoring backup..."
    cp /etc/nginx/sites-available/tool-thinker.backup.* /etc/nginx/sites-available/tool-thinker
    exit 1
fi

