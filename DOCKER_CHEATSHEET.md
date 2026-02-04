# Docker Cheat Sheet - Print This!

## One-Time Setup (New Machine)

### 1. Install Docker
**Windows:** https://www.docker.com/products/docker-desktop  
**Linux:** `curl -fsSL https://get.docker.com | sh`

### 2. Get Application Files
Copy `esop-silverpeak-program` folder to target machine

### 3. Configure
```bash
cd esop-silverpeak-program
cp .env.example .env
# Edit .env: Add BASE_API_URL and API_KEY
mv docker-compose.example.yml docker-compose.yml
```

---

## Daily Commands

| Task | Command |
|------|---------|
| **Start** | `docker-compose up -d` |
| **Stop** | `docker-compose down` |
| **Restart** | `docker-compose restart` |
| **View logs** | `docker-compose logs -f` |
| **Check status** | `docker-compose ps` |
| **Update code** | `docker-compose up -d --build` |

---

## Access

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API Docs** | http://localhost:8000/docs |
| **Default Login** | admin / admin123 |

---

## Configuration (.env file)

### REQUIRED
```bash
BASE_API_URL=https://your-silverpeak-url.com/api/v1
API_KEY=your_api_token_here
```

### OPTIONAL (Customize Ports)
```bash
BACKEND_PORT=8000
FRONTEND_PORT=5173
```

---

## Troubleshooting

### Port Already in Use
```bash
# Edit .env, change ports:
BACKEND_PORT=8001
FRONTEND_PORT=5174
# Then restart
docker-compose down
docker-compose up -d
```

### Can't Access from Another Computer
```bash
# Windows - Allow firewall
netsh advfirewall firewall add rule name="ESOP" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="ESOP Frontend" dir=in action=allow protocol=TCP localport=5173

# Linux - Allow firewall
sudo ufw allow 8000
sudo ufw allow 5173

# Access from other computer:
# http://SERVER_IP_ADDRESS:5173
```

### View Logs for Errors
```bash
# All logs
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50
```

### Missing API Credentials Error
```bash
# Error: "BASE_API_URL must be set"
# Solution: Edit .env file and add:
BASE_API_URL=https://your-url.com/api/v1
API_KEY=your_token
```

### Start Fresh (Delete Everything)
```bash
# WARNING: This deletes your database!
docker-compose down -v
docker-compose up -d
```

---

## Network Access

| From | URL Format | Example |
|------|------------|---------|
| Same machine | `http://localhost:5173` | http://localhost:5173 |
| Local network | `http://SERVER_IP:5173` | http://192.168.1.100:5173 |
| With domain | `http://DOMAIN:5173` | http://myserver.local:5173 |

**Find Server IP:**
- Windows: `ipconfig`
- Linux: `ip addr show` or `hostname -I`

---

## Backup & Restore

### Backup Database
```bash
docker run --rm -v esop-silverpeak-program_backend-data:/data -v $(pwd):/backup ubuntu tar czf /backup/backup-$(date +%Y%m%d).tar.gz /data
```

### Restore Database
```bash
docker run --rm -v esop-silverpeak-program_backend-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/backup-YYYYMMDD.tar.gz -C /
```

---

## Quick Health Check

```bash
# 1. Are containers running?
docker-compose ps
# Should show: esop-backend (Up), esop-frontend (Up)

# 2. Any errors?
docker-compose logs --tail=20

# 3. Can I access it?
# Open browser: http://localhost:5173
# Should see login page

# 4. Can backend reach SilverPeak?
# Login, go to site selector
# Should see list of appliances
```

---

## File Locations

```
esop-silverpeak-program/
├── .env                      ← Your configuration (EDIT THIS)
├── docker-compose.yml        ← Docker setup
├── backend/                  ← Backend code
├── frontend/                 ← Frontend code
└── DOCKER_*.md              ← Documentation
```

---

## Getting Help

- **5-min guide:** DOCKER_5MIN_GUIDE.md
- **Visual guide:** DOCKER_VISUAL_GUIDE.md
- **Complete guide:** DOCKER_DEPLOYMENT_GUIDE.md
- **All docs:** DOCKER_INDEX.md

---

## Security Reminders

- [ ] Change admin password after first login
- [ ] Use strong SECRET_KEY in production
- [ ] Don't commit .env file to git
- [ ] Use HTTPS in production
- [ ] Restrict firewall to known IPs

---

## Environment Variables Quick Reference

```bash
# SilverPeak API (REQUIRED)
BASE_API_URL=https://silverpeak.example.com/api/v1
API_KEY=your_token

# Ports (OPTIONAL - defaults shown)
BACKEND_PORT=8000
FRONTEND_PORT=5173
HOST=0.0.0.0
PORT=8000

# Security (OPTIONAL - change for production)
SECRET_KEY=your_secret_key
DEFAULT_ADMIN_PASSWORD=admin123

# Database (OPTIONAL)
DATABASE_URL=sqlite:///./esop.db

# CORS (OPTIONAL)
CORS_ORIGINS=http://localhost:5173
```

---

**Need to move to another machine?** Just copy the folder and repeat setup steps 2-3!

**© 2026 - ESOP SilverPeak DHCP Monitor**
