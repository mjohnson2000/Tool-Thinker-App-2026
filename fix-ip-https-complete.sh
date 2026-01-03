#!/bin/bash

# Complete fix for HTTPS access via IP address
# This replaces the entire Nginx config to ensure proper ordering

echo "🔧 Fixing HTTPS access via IP address..."

# Backup current config
echo "💾 Backing up current config..."
cp /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-available/tool-thinker.backup.$(date +%Y%m%d_%H%M%S)

# Create complete Nginx config with proper ordering
cat > /etc/nginx/sites-available/tool-thinker << 'EOF'
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

# HTTPS server for domain - MUST come before default_server
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

# Catch-all HTTPS server for IP and any other requests
# This MUST be last and use default_server to catch unmatched requests
server {
    listen 443 ssl http2 default_server;
    server_name _;
    
    # Use domain cert (will show warning but allows redirect)
    ssl_certificate /etc/letsencrypt/live/toolthinker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/toolthinker.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Redirect HTTPS to HTTP for IP access
    return 301 http://$host$request_uri;
}
EOF

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
    echo "  - Recreated entire Nginx config with proper server block ordering"
    echo "  - Domain HTTPS server comes first (specific match)"
    echo "  - Catch-all HTTPS server comes last with default_server"
    echo "  - HTTPS requests to IP will now redirect to HTTP"
    echo ""
    echo "🧪 Test it:"
    echo "  curl -I http://72.62.170.11"
    echo "  curl -I https://72.62.170.11  # Should redirect to HTTP"
    echo "  curl -I https://toolthinker.com  # Should work normally"
else
    echo "❌ Configuration test failed!"
    echo "Restoring backup..."
    cp /etc/nginx/sites-available/tool-thinker.backup.* /etc/nginx/sites-available/tool-thinker 2>/dev/null || echo "Manual restore needed"
    exit 1
fi

