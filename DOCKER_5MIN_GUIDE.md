# 5-Minute Deployment Guide

**Never used Docker?** Follow these 5 simple steps!

## Step 1: Install Docker (One Time Setup)

### Windows
1. Download: https://www.docker.com/products/docker-desktop
2. Install and restart computer
3. Open Docker Desktop app

### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and log back in
```

---

## Step 2: Copy Project to Target Machine

Copy the entire `esop-silverpeak-program` folder to your target machine using:
- USB drive
- Git clone
- Network share
- SCP/WinSCP

---

## Step 3: Configure

```bash
# Go to the project folder
cd esop-silverpeak-program

# Create configuration file
cp .env.example .env

# Edit .env file (Windows: notepad .env / Linux: nano .env)
# Add YOUR SilverPeak credentials:
#   BASE_API_URL=https://your-silverpeak-url.com/api/v1
#   API_KEY=your_token_here

# Rename docker compose file
# Windows:
move docker-compose.example.yml docker-compose.yml

# Linux:
mv docker-compose.example.yml docker-compose.yml
```

---

## Step 4: Start

```bash
docker-compose up -d
```

That's it! Docker downloads, builds, and starts everything automatically.

---

## Step 5: Access

Open browser: `http://localhost:5173`

**Login:**
- Username: `admin`
- Password: `admin123`

**⚠️ Change password immediately!**

---

## Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Check status
docker-compose ps
```

---

## Troubleshooting

**Can't access from another computer?**
- Allow ports in firewall: 8000 and 5173
- Use machine's IP address: `http://192.168.1.100:5173`

**Port already in use?**
- Edit `.env` and change `BACKEND_PORT=8001` and `FRONTEND_PORT=5174`

**Need detailed help?**
- See [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md) for complete instructions

---

## What Just Happened?

Docker packaged your entire application (Python backend + React frontend + all dependencies) into containers that:
- ✅ Run the same on any machine
- ✅ Don't require Python or Node.js installation
- ✅ Are easy to start, stop, and update
- ✅ Keep everything isolated and clean

**You just deployed a full-stack application with one command!** 🎉
