#!/bin/bash
# Setup Domain and SSL for toolthinker.com
# Run this on your Hostinger VPS

DOMAIN="toolthinker.com"
IP="72.62.170.11"

echo "=== Setting up domain: $DOMAIN ==="
echo ""
echo "STEP 1: DNS Configuration"
echo "-------------------------"
echo "Before running this script, make sure you've configured DNS at your domain registrar:"
echo ""
echo "Add these DNS records:"
echo "  Type: A"
echo "  Name: @ (or blank/root)"
echo "  Value: $IP"
echo "  TTL: 3600 (or Auto)"
echo ""
echo "  Type: A"
echo "  Name: www"
echo "  Value: $IP"
echo "  TTL: 3600 (or Auto)"
echo ""
echo "Wait 5-10 minutes for DNS to propagate, then press Enter to continue..."
read -p "Press Enter when DNS is configured..."

# Update Nginx configuration with domain
echo ""
echo "STEP 2: Updating Nginx Configuration"
echo "-------------------------------------"
cat > /etc/nginx/sites-available/tool-thinker << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✓ Nginx configuration updated!"
else
    echo "ERROR: Nginx configuration test failed!"
    exit 1
fi

# Install Certbot for SSL
echo ""
echo "STEP 3: Setting up SSL (HTTPS)"
echo "-------------------------------"
echo "Installing Certbot..."

apt update
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
echo ""
echo "Obtaining SSL certificate from Let's Encrypt..."
echo "This will automatically configure HTTPS for your domain."
echo ""

certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSL certificate installed successfully!"
    echo ""
    echo "=== Setup Complete! ==="
    echo ""
    echo "Your app is now accessible at:"
    echo "  https://$DOMAIN"
    echo "  https://www.$DOMAIN"
    echo "  http://$IP (will redirect to HTTPS)"
    echo ""
    echo "SSL certificate will auto-renew. Certbot is configured to renew automatically."
else
    echo ""
    echo "⚠ SSL certificate installation failed."
    echo "This might be because:"
    echo "  1. DNS hasn't propagated yet (wait 10-15 minutes)"
    echo "  2. Domain is not pointing to $IP"
    echo "  3. Port 80 is blocked"
    echo ""
    echo "You can retry later with:"
    echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo "For now, your app is accessible at:"
    echo "  http://$DOMAIN"
    echo "  http://www.$DOMAIN"
fi

# Test domain
echo ""
echo "Testing domain..."
echo "HTTP test:"
curl -I http://$DOMAIN 2>&1 | head -3

echo ""
echo "=== Done! ==="

