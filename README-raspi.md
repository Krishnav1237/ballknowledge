# Raspberry Pi 5 Deployment Guide 24/7 🏆

This guide walks you through setting up a production-ready environment on a **Raspberry Pi 5** (Debian/Ubuntu ARM64) to host the **Football Court** application 24/7 with a local **PostgreSQL** database, **Groq/Nvidia AI**, and **Nginx with SSL**.

---

## 1. System Update & Dependencies

First, SSH into your Raspberry Pi 5 and update the package list:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx
```

---

## 2. Install Node.js (v20 LTS)

Next.js 16 requires Node.js >= 18.17.0. We recommend Node.js v20 (LTS):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify the installation:
```bash
node -v
npm -v
```

---

## 3. Install & Configure PostgreSQL

Install PostgreSQL and its contrib packages:

```bash
sudo apt install -y postgresql postgresql-contrib
```

Start and enable the PostgreSQL service to run on boot:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User

Log in as the default postgres user:
```bash
sudo -i -u postgres psql
```

Run the following SQL commands to create a user and database for the application (replace `your_secure_password` with a strong password):

```sql
CREATE DATABASE football_court;
CREATE USER court_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE football_court TO court_admin;
-- Allow the user to create schemas (required for Prisma migrations in Postgres 15+)
\c football_court
GRANT ALL ON SCHEMA public TO court_admin;
\q
```

---

## 4. Deploy the Code

Clone your repository to the home directory of your Pi (e.g., `/home/pi/football-court`):

```bash
cd /home/pi
git clone <your-repo-url> football-court
cd football-court
```

### Setup Environment Variables

Create a `.env.production` file in the root directory:

```bash
nano .env.production
```

Add the following environment variables (make sure to replace placeholders with your actual keys and passwords):

```env
# Node Environment
NODE_ENV=production
PORT=3000

# PostgreSQL Connection String
DATABASE_URL="postgresql://court_admin:your_secure_password@localhost:5432/football_court?schema=public"

# AI API Keys
GROQ_API_KEY="gsk_your_groq_api_key_here"
NVIDIA_API_KEY="nvapi-your_nvidia_api_key_here"
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 5. Build and Run Initial Migrations

Run our automated deploy script which will install packages, compile the Next.js app, and run database migrations:

```bash
export DATABASE_URL="postgresql://court_admin:your_secure_password@localhost:5432/football_court?schema=public"
./deploy-raspi.sh
```

---

## 6. Configure 24/7 Process Manager

You have two options to keep the app running in the background 24/7:

### Option A: PM2 (Recommended)
PM2 provides CPU clustering, automatic restarts, and log management.

1. Install PM2 globally:
   ```bash
   sudo npm install -g pm2
   ```
2. Start the app using the ecosystem file:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```
3. Set PM2 to start on system boot:
   ```bash
   pm2 startup
   ```
   *Copy and run the command printed by the terminal to finalize startup.*
4. Save process list:
   ```bash
   pm2 save
   ```

### Option B: systemd Service
If you prefer not to install global npm packages:

1. Copy the systemd descriptor file to `/etc/systemd/system/`:
   ```bash
   sudo cp football-court.service /etc/systemd/system/
   ```
2. Edit the service file to load your environment configurations:
   ```bash
   sudo nano /etc/systemd/system/football-court.service
   ```
   *Uncomment `EnvironmentFile=/home/pi/football-court/.env.production` and adjust the path.*
3. Reload systemd, start the service, and enable it on boot:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start football-court
   sudo systemctl enable football-court
   ```

---

## 7. Configure Nginx Reverse Proxy & SSL

1. Copy the Nginx config template to sites-available:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/football-court
   ```
2. Open the file and replace `yourdomain.com` with your actual domain:
   ```bash
   sudo nano /etc/nginx/sites-available/football-court
   ```
3. Enable the config by creating a symlink in sites-enabled:
   ```bash
   sudo ln -s /etc/nginx/sites-available/football-court /etc/nginx/sites-enabled/
   ```
4. Test Nginx configuration and reload the service:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Request Free SSL (HTTPS) Certificate
Certbot handles requesting, installing, and auto-renewing Let's Encrypt certificates:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Select the option to automatically redirect HTTP traffic to HTTPS. Certbot will automatically inject the certificate paths into `/etc/nginx/sites-available/football-court` and restart Nginx.

Your web application is now hosted securely on your Raspberry Pi 5 and will survive reboots!

---

## 8. Client-Side Image Optimization

Portrait uploads for personalized FUT cards utilize client-side offscreen HTML canvas downscaling (max `256px`, `0.8` JPEG quality). This compresses photo strings down to ~20KB before synchronizing with the database or caching in local storage. This optimization ensures minimal memory usage, negligible server-side processing overhead, and very light database payloads, making the platform ideal for low-power host nodes like a Raspberry Pi 5.

