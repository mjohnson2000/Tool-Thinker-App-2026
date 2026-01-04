# Domain Setup Guide for toolthinker.com

## Step 1: Configure DNS Records

Go to your domain registrar (where you bought toolthinker.com) and add these DNS records:

### A Record (Root Domain)
```
Type: A
Name: @ (or blank/root)
Value: 72.62.170.11
TTL: 3600 (or Auto)
```

### A Record (WWW Subdomain)
```
Type: A
Name: www
Value: 72.62.170.11
TTL: 3600 (or Auto)
```

**Common Domain Registrars:**
- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: DNS Management → Records
- **Google Domains**: DNS → Custom Records
- **Cloudflare**: DNS → Records
- **Hostinger**: Domain → DNS Zone Editor

## Step 2: Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours to propagate, but usually takes 10-30 minutes.

**Check if DNS is working:**
```bash
# From your local computer
ping toolthinker.com
nslookup toolthinker.com
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

## Step 3: Run Setup Script on Server

Once DNS is pointing to your server, SSH into your server and run:

```bash
cd ~/tool-thinker

# Pull the latest script
git pull

# Make it executable
chmod +x SETUP_DOMAIN.sh

# Run the setup
./SETUP_DOMAIN.sh
```

Or manually run these commands:

```bash
# Update Nginx config
cat > /etc/nginx/sites-available/tool-thinker << 'EOF'
server {
    listen 80;
    server_name toolthinker.com www.toolthinker.com 72.62.170.11;

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
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx

# Install Certbot for SSL
apt update
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d toolthinker.com -d www.toolthinker.com --non-interactive --agree-tos --email admin@toolthinker.com --redirect
```

## Step 4: Verify

After setup, your site should be accessible at:
- ✅ https://toolthinker.com
- ✅ https://www.toolthinker.com
- ✅ http://toolthinker.com (redirects to HTTPS)
- ✅ http://www.toolthinker.com (redirects to HTTPS)

## Troubleshooting

### DNS not working?
1. Check DNS records are correct at your registrar
2. Wait 10-15 more minutes for propagation
3. Clear your browser cache
4. Try from a different network/device

### SSL certificate fails?
1. Make sure DNS is pointing to your server (check with `nslookup toolthinker.com`)
2. Make sure port 80 is open: `ufw allow 80/tcp`
3. Make sure Nginx is running: `systemctl status nginx`
4. Check Nginx config: `nginx -t`

### Domain works but shows default Nginx page?
- Make sure you removed the default site: `rm -f /etc/nginx/sites-enabled/default`
- Restart Nginx: `systemctl restart nginx`

## Quick Commands Reference

```bash
# Check DNS
nslookup toolthinker.com

# Check Nginx status
systemctl status nginx

# Test Nginx config
nginx -t

# View Nginx config
cat /etc/nginx/sites-available/tool-thinker

# Restart Nginx
systemctl restart nginx

# Check SSL certificate
certbot certificates

# Renew SSL certificate manually
certbot renew

# View Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

