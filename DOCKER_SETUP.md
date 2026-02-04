# Docker Setup Checklist

Follow these steps to configure and run the application with Docker.

## Prerequisites

- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] SilverPeak SD-WAN API access credentials

## Configuration Steps

### ⚠️ Important: Where to Configure Everything

**You ONLY edit the `.env` file!**
- ✅ **DO:** Edit `.env` file (all your settings)
- ❌ **DON'T:** Edit `docker-compose.yml` (it reads from .env automatically)
- ❌ **DON'T:** Edit `docker-compose.example.yml` (just rename it)

**To change ports:** Edit `BACKEND_PORT` and `FRONTEND_PORT` in `.env`  
**To change API keys:** Edit `BASE_API_URL` and `API_KEY` in `.env`  
**To change passwords:** Edit `DEFAULT_ADMIN_PASSWORD` in `.env`

Everything else happens automatically!

---

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure Required API Credentials

Edit `.env` (Windows: `notepad .env`, Linux: `nano .env`) and set these **REQUIRED** values:

```bash
# Get these from your SilverPeak SD-WAN administrator
BASE_API_URL=https://your-silverpeak-domain.com/api/v1
API_KEY=your_actual_api_token_here
```

**Where to find these:**
- **BASE_API_URL**: Your SilverPeak Orchestrator URL + `/api/v1`
- **API_KEY**: Generated in SilverPeak Orchestrator → Administration → API Tokens

### 3. Configure Optional Settings

In `.env`, customize these if needed:

```bash
# Ports (change if default ports are in use)
BACKEND_PORT=8000
FRONTEND_PORT=5173

# Security (change for production)
SECRET_KEY=your_secure_random_key_here
DEFAULT_ADMIN_PASSWORD=admin123

# Database (default uses SQLite)
DATABASE_URL=sqlite:///./data/esop.db
```

### 4. Verify Configuration

Check that your `.env` file has all required values:

```bash
# Quick verification (bash/linux)
grep -E "BASE_API_URL|API_KEY" .env

# PowerShell verification
Get-Content .env | Select-String "BASE_API_URL|API_KEY"
```

## Running the Application

### Standard Startup

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### First Time Access

1. **Open browser**: `http://localhost:5173` (or your FRONTEND_PORT)
2. **Login with default admin**:
   - Username: `admin`
   - Password: `admin123` (or your DEFAULT_ADMIN_PASSWORD)
3. **⚠️ IMPORTANT**: Reset admin password immediately!

### Verify API Connection

Check that backend can connect to SilverPeak:

```bash
# Check backend logs for errors
docker-compose logs backend

# Test API endpoint (requires login first)
curl http://localhost:8000/docs
```

## Troubleshooting

### Error: "BASE_API_URL must be set in .env file"

**Cause**: Missing or empty BASE_API_URL in .env file

**Solution**: 
```bash
# Edit .env and add:
BASE_API_URL=https://your-silverpeak-url.com/api/v1
```

### Error: "API_KEY must be set in .env file"

**Cause**: Missing or empty API_KEY in .env file

**Solution**:
```bash
# Edit .env and add:
API_KEY=your_actual_token
```

### Error: Port already in use

**Cause**: Another service is using the default ports

**Solution**: Change ports in `.env`:
```bash
BACKEND_PORT=8001
FRONTEND_PORT=5174
```

### Backend can't connect to SilverPeak

**Symptoms**: 
- Login works but appliance list is empty
- Backend logs show connection errors

**Solutions**:
1. Verify BASE_API_URL is correct (include `/api/v1`)
2. Verify API_KEY is valid and not expired
3. Check network connectivity from Docker to SilverPeak
4. Verify SilverPeak API is accessible

## Quick Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart after config change
docker-compose restart

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

## Validation Checklist

Before considering setup complete:

- [ ] `.env` file created with all required variables
- [ ] BASE_API_URL points to correct SilverPeak instance
- [ ] API_KEY is valid and working
- [ ] Containers start without errors (`docker-compose ps` shows healthy)
- [ ] Frontend accessible at configured port
- [ ] Backend API docs accessible at `http://localhost:8000/docs`
- [ ] Can login with admin credentials
- [ ] Appliance list loads successfully
- [ ] Admin password has been changed

## Security Reminders

- [ ] Change DEFAULT_ADMIN_PASSWORD before production
- [ ] Generate new SECRET_KEY for production
- [ ] Never commit `.env` file to version control
- [ ] Restrict API_KEY permissions in SilverPeak
- [ ] Use HTTPS in production (reverse proxy)
- [ ] Review CORS_ORIGINS for production domains

## Need Help?

See detailed documentation:
- **[DOCKER_PORTS.md](DOCKER_PORTS.md)** - Port configuration
- **[README.md](README.md)** - Full project documentation  
- **[.env.example](.env.example)** - All environment variables

## Example Working Configuration

```bash
# .env file example (with fake values)
BASE_API_URL=https://silverpeak.mycompany.com/api/v1
API_KEY=abc123def456ghi789jkl012mno345pqr678stu901
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
DEFAULT_ADMIN_PASSWORD=MySecurePassword123!
BACKEND_PORT=8000
FRONTEND_PORT=5173
DATABASE_URL=sqlite:///./data/esop.db
CORS_ORIGINS=http://localhost:5173
```

---

**Ready to deploy?** Run: `docker-compose up -d`
