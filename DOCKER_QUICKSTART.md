# Docker Quick Start

## ⚠️ Before You Start

**REQUIRED**: Configure SilverPeak API credentials in `.env` file

```bash
# 1. Copy example file
cp .env.example .env

# 2. Edit and add YOUR credentials
BASE_API_URL=https://your-silverpeak-url.com/api/v1
API_KEY=your_actual_api_token
```

Without these, the application **will not work**!

See **[DOCKER_SETUP.md](DOCKER_SETUP.md)** for detailed setup instructions.

---

## Port Customization

All ports are fully configurable via environment variables!

### Quick Examples

**Run with default ports (8000, 5173):**
```bash
docker-compose up
```

**Run with custom ports:**
```bash
BACKEND_PORT=9000 FRONTEND_PORT=3000 docker-compose up
```

**Run multiple instances:**
```bash
# Instance 1 on ports 8000/5173
docker-compose -p esop-dev up -d

# Instance 2 on ports 8001/5174
BACKEND_PORT=8001 FRONTEND_PORT=5174 docker-compose -p esop-test up -d
```

## Port Configuration Variables

| Variable | Purpose | Default | Example |
|----------|---------|---------|---------|
| `BACKEND_PORT` | Host port for backend API | 8000 | 9000 |
| `FRONTEND_PORT` | Host port for frontend | 5173 | 3000 |
| `HOST` | Backend bind address | 127.0.0.1 | 0.0.0.0 (Docker) |
| `PORT` | Backend internal port | 8000 | 8000 |
| `VITE_PORT` | Frontend dev port | 5173 | 5173 |

## Environment Files

1. Copy example: `cp .env.example .env`
2. Edit ports in `.env`:
   ```bash
   BACKEND_PORT=8000
   FRONTEND_PORT=5173
   ```
3. Run: `docker-compose up`

## Port Mapping Format

```
HOST_PORT:CONTAINER_PORT
   ↓           ↓
"9000     :   8000"
 └─ What you access from your computer
             └─ What runs inside Docker
```

**Example:** `"9000:8000"` means:
- Access backend at `http://localhost:9000` 
- Backend runs on port 8000 inside container

## See Full Documentation

- **[DOCKER_PORTS.md](DOCKER_PORTS.md)** - Complete port configuration guide
- **[docker-compose.example.yml](docker-compose.example.yml)** - Docker Compose template
- **[.env.example](.env.example)** - All environment variables

## Need Help?

Common issues and solutions in [DOCKER_PORTS.md](DOCKER_PORTS.md#troubleshooting)
