# Hostinger Deployment Checklist

## Step 1: SSH into Your Server

```bash
ssh root@72.62.170.11
```

## Step 2: Install Prerequisites

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Git (if not already installed)
apt install -y git

# Install Nginx (for reverse proxy, optional)
apt install -y nginx
```

## Step 3: Clone Your Repository

```bash
# Navigate to web directory (adjust path as needed)
cd /var/www  # or wherever you want to host the app

# Clone your repository
git clone https://github.com/mjohnson2000/Tool-Thinker-App-2026.git tool-thinker

# Or if you need to upload files manually, create directory:
# mkdir -p /var/www/tool-thinker
# Then upload files via SFTP
```

## Step 4: Set Up Environment Variables

```bash
cd /var/www/tool-thinker  # or your app directory

# Create .env file
nano .env
```

Add these variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dejhoudyhqjxbcnrixdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_agg_FhijhDhOMGwGP_w-6A_Vty1Qaq-
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=3000
```

Save with `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build the production app
npm run build
```

## Step 6: Start with PM2

```bash
# Start the app
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Follow the instructions it gives you (usually run a sudo command)
```

## Step 7: Verify It's Running

```bash
# Check status
pm2 status

# View logs
pm2 logs tool-thinker

# Test health endpoint
curl http://localhost:3000/api/health
```

## Step 8: Set Up Nginx Reverse Proxy (Optional but Recommended)

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/tool-thinker
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
```

Enable the site:
```bash
# Create symlink
ln -s /etc/nginx/sites-available/tool-thinker /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 9: Set Up Firewall (if needed)

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

## Troubleshooting Commands

```bash
# Check if app is running
pm2 status

# View real-time logs
pm2 logs tool-thinker --lines 50

# Restart app
pm2 restart tool-thinker

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

## Quick Commands Reference

```bash
# Start app
pm2 start ecosystem.config.js

# Stop app
pm2 stop tool-thinker

# Restart app
pm2 restart tool-thinker

# View logs
pm2 logs tool-thinker

# Monitor resources
pm2 monit

# Update app
cd /var/www/tool-thinker
git pull
npm install
npm run build
pm2 restart tool-thinker
```

## Important Notes

1. **Port 3000**: Make sure it's not blocked by firewall
2. **Domain**: Update `yourdomain.com` in Nginx config with your actual domain
3. **SSL**: Set up Let's Encrypt SSL certificate for HTTPS:
   ```bash
   apt install certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
4. **PM2 Logs**: Located in `~/.pm2/logs/` or project `logs/` directory
5. **Environment**: Make sure `.env` file has all required variables

## Security Checklist

- [ ] Change default SSH port (optional but recommended)
- [ ] Set up SSH key authentication (disable password auth)
- [ ] Configure firewall properly
- [ ] Set up SSL certificate (HTTPS)
- [ ] Keep Node.js and PM2 updated
- [ ] Regular backups of database and code

