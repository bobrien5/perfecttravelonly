#!/bin/bash
# =============================================================
# VacationPro Droplet Setup Script
# Run this on your DigitalOcean droplet as root
#
# Usage: ssh root@YOUR_IP 'bash -s' < nginx/setup-droplet.sh
# =============================================================

set -e

echo "========================================="
echo "  VacationPro Droplet Setup"
echo "========================================="

# --- 1. System updates ---
echo ""
echo "[1/7] Updating system packages..."
apt update && apt upgrade -y

# --- 2. Install Nginx, PHP, MySQL ---
echo ""
echo "[2/7] Installing Nginx, PHP, MySQL..."
apt install -y nginx mysql-server \
  php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-gd php-intl php-imagick

# --- 3. Install Node.js (for Next.js) ---
echo ""
echo "[3/7] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# --- 4. Set up MySQL + WordPress database ---
echo ""
echo "[4/7] Setting up WordPress database..."
WPDB_PASS=$(openssl rand -base64 16)
mysql -e "CREATE DATABASE IF NOT EXISTS wordpress;"
mysql -e "CREATE USER IF NOT EXISTS 'wpuser'@'localhost' IDENTIFIED BY '${WPDB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON wordpress.* TO 'wpuser'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo ""
echo "  ✅ WordPress DB created"
echo "  📝 DB User: wpuser"
echo "  📝 DB Pass: ${WPDB_PASS}"
echo "  ⚠️  SAVE THIS PASSWORD — you'll need it during WordPress setup"
echo ""

# --- 5. Install WordPress ---
echo ""
echo "[5/7] Installing WordPress..."
mkdir -p /var/www
cd /var/www
curl -sO https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
chown -R www-data:www-data /var/www/wordpress
rm latest.tar.gz

# --- 6. Set up Next.js app directory ---
echo ""
echo "[6/7] Setting up Next.js app directory..."
mkdir -p /var/www/vacationpro
echo "  📁 Created /var/www/vacationpro"
echo "  📝 Deploy your Next.js build here (see instructions below)"

# --- 7. Install SSL tooling ---
echo ""
echo "[7/7] Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "========================================="
echo "  ✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. Copy the Nginx config to the droplet:"
echo "     scp nginx/vacationpro.conf root@YOUR_IP:/etc/nginx/sites-available/vacationpro"
echo ""
echo "  2. Enable the config:"
echo "     ln -s /etc/nginx/sites-available/vacationpro /etc/nginx/sites-enabled/"
echo "     rm -f /etc/nginx/sites-enabled/default"
echo "     nginx -t && systemctl reload nginx"
echo ""
echo "  3. Point your domain DNS (A record) to this droplet's IP"
echo ""
echo "  4. Set up SSL:"
echo "     certbot --nginx -d vacationpro.co -d www.vacationpro.co"
echo ""
echo "  5. Visit http://YOUR_IP/blog to complete WordPress setup"
echo "     DB Name: wordpress"
echo "     DB User: wpuser"
echo "     DB Pass: ${WPDB_PASS}"
echo ""
echo "  6. Deploy Next.js:"
echo "     - Build locally: npm run build"
echo "     - Copy .next/, public/, package.json, node_modules/ to /var/www/vacationpro/"
echo "     - Start with PM2: cd /var/www/vacationpro && pm2 start npm --name vacationpro -- start"
echo "     - Save PM2: pm2 save && pm2 startup"
echo ""
echo "  7. Set WordPress permalinks to /blog/%postname%/"
echo ""
