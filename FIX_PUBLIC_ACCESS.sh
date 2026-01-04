#!/bin/bash
# Fix Public Access - Make app accessible from outside
# Run this on your Hostinger VPS

echo "=== Fixing Public Access ==="

# Option 1: Set up Nginx Reverse Proxy (Recommended)
echo ""
echo "Setting up Nginx reverse proxy..."

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt update
    apt install -y nginx
fi

# Create nginx configuration
echo "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/tool-thinker << 'EOF'
server {
    listen 80;
    server_name 72.62.170.11 _;  # Use IP or your domain

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
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
echo "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-enabled/

# Remove default nginx site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid!"
    systemctl restart nginx
    systemctl enable nginx
    echo "Nginx restarted and enabled!"
else
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi

# Option 2: Open firewall ports (if using UFW)
echo ""
echo "Setting up firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    echo "Firewall configured!"
else
    echo "UFW not found, skipping firewall setup"
fi

# Check if app is running
echo ""
echo "Checking app status..."
pm2 status

# Test endpoints
echo ""
echo "Testing endpoints..."
echo "Localhost test:"
curl -s http://localhost:3000/api/health | head -1

echo ""
echo "Public IP test (via Nginx):"
curl -s http://localhost/api/health | head -1

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your app should now be accessible at:"
echo "  http://72.62.170.11"
echo ""
echo "If you have a domain, update the server_name in:"
echo "  /etc/nginx/sites-available/tool-thinker"
echo ""
echo "To set up SSL (HTTPS), run:"
echo "  apt install certbot python3-certbot-nginx -y"
echo "  certbot --nginx -d yourdomain.com"

