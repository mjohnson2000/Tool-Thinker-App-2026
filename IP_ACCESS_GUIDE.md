# IP Address Access Guide

## Issue: HTTPS Access via IP Address

When accessing `https://72.62.170.11` via HTTPS, you'll see an SSL certificate error:
- **Error**: `NET::ERR_CERT_COMMON_NAME_INVALID`
- **Reason**: The SSL certificate is issued for `toolthinker.com`, not the IP address

## Solution

### Option 1: Use HTTP for IP Access (Recommended)
Access the site via HTTP when using the IP address:
```
http://72.62.170.11
```

The Nginx configuration automatically redirects HTTPS requests from the IP to HTTP.

### Option 2: Use the Domain Name
Always use the domain name for HTTPS access:
```
https://toolthinker.com
```

This uses the correct SSL certificate and works perfectly.

## Why This Happens

1. **SSL Certificates are Domain-Specific**: Let's Encrypt certificates are issued for specific domain names, not IP addresses.

2. **Certificate Validation**: Browsers check that the certificate's Common Name (CN) or Subject Alternative Name (SAN) matches the hostname you're accessing.

3. **IP vs Domain**: When you access via IP (`72.62.170.11`), the certificate shows it's for `toolthinker.com`, causing a mismatch.

## Current Nginx Configuration

The Nginx configuration handles this by:
- **HTTP via IP**: Serves content directly ✅
- **HTTPS via IP**: Redirects to HTTP ✅
- **HTTPS via Domain**: Works with SSL certificate ✅

## Testing

```bash
# HTTP via IP - Works ✅
curl -I http://72.62.170.11

# HTTPS via IP - Redirects to HTTP ✅
curl -I https://72.62.170.11

# HTTPS via Domain - Works with SSL ✅
curl -I https://toolthinker.com
```

## Fix Script

If you need to update the Nginx configuration, run:
```bash
bash fix-ip-https-issue.sh
```

This will:
1. Add a catch-all HTTPS server block for IP addresses
2. Redirect HTTPS IP requests to HTTP
3. Test and reload Nginx

## Best Practice

**Always use the domain name for production access:**
- ✅ `https://toolthinker.com`
- ❌ `https://72.62.170.11` (will show certificate error)

The IP address is mainly useful for:
- Server administration
- Testing before DNS propagation
- Direct server access

