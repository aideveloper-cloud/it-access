#!/bin/bash
# Deploy ขึ้น it.access.kgarden.co.th (รันจาก Git Bash: bash deploy.sh)
# ขั้นตอน: build standalone -> อัปโหลด -> restart pm2
set -e
cd "$(dirname "$0")"

SERVER=root@152.42.177.130
APP_DIR=/opt/it-web

echo "[1/3] Building..."
bun run build

echo "[2/3] Uploading..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
rm -rf .next/standalone/data   # ห้ามทับฐานข้อมูลบน server
tar czf - -C .next/standalone . | ssh "$SERVER" "tar xzf - -C $APP_DIR"

echo "[3/3] Restarting..."
ssh "$SERVER" "pm2 restart it-web && sleep 2 && curl -s -o /dev/null -w 'health: %{http_code}\n' http://127.0.0.1:3005/login"

echo "Done -> https://it.access.kgarden.co.th"
