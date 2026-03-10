#!/bin/bash
# =============================================================
# VacationPro WordPress Droplet Setup
# DigitalOcean hosts WordPress only — Vercel hosts Next.js
#
# Usage: ssh root@YOUR_IP 'bash -s' < nginx/setup-droplet.sh
# =============================================================

set -e

echo "========================================="
echo "  VacationPro WordPress Setup"
echo "========================================="

# --- 1. System updates ---
echo ""
echo "[1/5] Updating system packages..."
apt update && apt upgrade -y

# --- 2. Install Nginx, PHP, MySQL ---
echo ""
echo "[2/5] Installing Nginx, PHP, MySQL..."
apt install -y nginx mysql-server \
  php-fpm php-mysql php-xml php-mbstring php-curl php-zip php-gd php-intl php-imagick

# --- 3. Set up MySQL + WordPress database ---
echo ""
echo "[3/5] Setting up WordPress database..."
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

# --- 4. Install WordPress ---
echo ""
echo "[4/5] Installing WordPress..."
mkdir -p /var/www
cd /var/www
curl -sO https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
chown -R www-data:www-data /var/www/wordpress
rm latest.tar.gz

# --- 5. Install SSL tooling ---
echo ""
echo "[5/5] Installing Certbot for SSL..."
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
echo "  3. Point DNS A record for blog.vacationpro.co to this droplet IP"
echo ""
echo "  4. Set up SSL:"
echo "     certbot --nginx -d blog.vacationpro.co"
echo ""
echo "  5. Visit http://YOUR_IP to complete WordPress setup"
echo "     DB Name: wordpress"
echo "     DB User: wpuser"
echo "     DB Pass: ${WPDB_PASS}"
echo ""
echo "  6. In Vercel, add environment variable:"
echo "     WORDPRESS_URL=https://blog.vacationpro.co"
echo ""
echo "  7. Set WordPress permalinks to /blog/%postname%/"
echo ""
