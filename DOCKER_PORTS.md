# Docker Port Configuration Guide

This guide explains how to customize ports for Docker deployment.

## Environment Variables for Ports

### Backend (FastAPI)
- **`HOST`**: Bind address (use `0.0.0.0` for Docker)
- **`PORT`**: Internal container port (default: `8000`)
- **`BACKEND_PORT`**: Host machine port for docker-compose (default: `8000`)

### Frontend (React/Vite)
- **`VITE_PORT`**: Development server port (default: `5173`)
- **`VITE_HOST`**: Bind address (use `true` or `0.0.0.0` for Docker)
- **`FRONTEND_PORT`**: Host machine port for docker-compose (default: `5173`)

## Configuration Methods

### Method 1: Using .env File with Docker Compose

Create a `.env` file in the project root:

```bash
# Port mapping for host machine
BACKEND_PORT=8000
FRONTEND_PORT=5173

# Backend configuration
HOST=0.0.0.0
PORT=8000

# Frontend configuration (for dev mode)
VITE_PORT=5173
VITE_HOST=true

# Required API configuration
BASE_API_URL=https://silverpeak.example.com/api/v1
API_KEY=your_api_key_here
SECRET_KEY=your_jwt_secret_here
```

Run with:
```bash
docker-compose up
```

### Method 2: Custom Ports via Command Line

Override ports when starting containers:

```bash
# Use custom ports 9000 and 3000
BACKEND_PORT=9000 FRONTEND_PORT=3000 docker-compose up
```

### Method 3: Multiple Environments

Create environment-specific compose files:

**docker-compose.dev.yml** (ports 8000, 5173)
```yaml
services:
  backend:
    ports:
      - "8000:8000"
  frontend:
    ports:
      - "5173:80"
```

**docker-compose.staging.yml** (ports 8001, 5174)
```yaml
services:
  backend:
    ports:
      - "8001:8000"
  frontend:
    ports:
      - "5174:80"
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

## Port Mapping Explained

### Backend Port Mapping
```
HOST_MACHINE:CONTAINER
    8000    :   8000
     ↑            ↑
  External    Internal
(configurable) (fixed in container)
```

Example: `"9000:8000"` means:
- Access backend at `http://localhost:9000` from host
- Backend inside container runs on port `8000`

### Frontend Port Mapping
```
HOST_MACHINE:CONTAINER
    5173    :    80
     ↑            ↑
  External     Nginx
(configurable) (fixed in container)
```

Example: `"3000:80"` means:
- Access frontend at `http://localhost:3000` from host
- Nginx inside container serves on port `80`

## Running Multiple Instances

Run multiple instances on different ports:

**Instance 1 - Development:**
```bash
BACKEND_PORT=8000 FRONTEND_PORT=5173 docker-compose -p esop-dev up -d
```

**Instance 2 - Testing:**
```bash
BACKEND_PORT=8001 FRONTEND_PORT=5174 docker-compose -p esop-test up -d
```

**Instance 3 - Demo:**
```bash
BACKEND_PORT=8002 FRONTEND_PORT=5175 docker-compose -p esop-demo up -d
```

## Production Considerations

### Using a Reverse Proxy (Recommended)

Instead of exposing ports directly, use nginx or traefik:

```yaml
services:
  backend:
    expose:
      - "8000"  # Only accessible within Docker network
    # No ports mapping
    
  frontend:
    expose:
      - "80"
    # No ports mapping
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Security Best Practices

1. **Don't expose backend directly** in production
2. **Use HTTPS** with proper SSL certificates
3. **Frontend should proxy API requests** to avoid CORS
4. **Use firewall rules** to restrict port access
5. **Change default ports** for security through obscurity

## Troubleshooting

### Port Already in Use

Error: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution 1:** Change the host port
```bash
BACKEND_PORT=8001 docker-compose up
```

**Solution 2:** Stop conflicting service
```bash
# Find process using port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac

# Stop the process
taskkill /PID <pid> /F        # Windows
kill -9 <pid>                 # Linux/Mac
```

### Frontend Can't Connect to Backend

**Issue:** Frontend shows connection errors

**Solutions:**
1. Check CORS_ORIGINS includes frontend URL
2. Verify VITE_API_BASE_URL points to correct backend port
3. Ensure both containers are on same Docker network
4. Check firewall/security group rules

### Container Port vs Host Port Confusion

Remember:
- **Container port**: Fixed in Dockerfile/code (8000 for backend, 80 for frontend)
- **Host port**: Flexible, set in docker-compose.yml or .env
- **Mapping format**: `HOST:CONTAINER` (e.g., `9000:8000`)

## Quick Reference

| Component | Internal Port | Default Host Port | Environment Variable |
|-----------|---------------|-------------------|----------------------|
| Backend   | 8000          | 8000              | BACKEND_PORT         |
| Frontend  | 80            | 5173              | FRONTEND_PORT        |
| PostgreSQL| 5432          | 5432              | POSTGRES_PORT        |

## Examples

### Standard Development Setup
```bash
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
docker-compose up
```

### Custom Ports
```bash
# Backend: http://localhost:9000
# Frontend: http://localhost:3000
BACKEND_PORT=9000 FRONTEND_PORT=3000 docker-compose up
```

### Production with Reverse Proxy
```bash
# All traffic through nginx on ports 80/443
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

For more information, see:
- [docker-compose.example.yml](docker-compose.example.yml)
- [.env.example](.env.example)
- [README.md](README.md)
