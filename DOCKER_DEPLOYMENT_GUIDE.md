# Deploying to Another Machine with Docker

**Never used Docker before?** No problem! This guide will walk you through everything step-by-step.

## What is Docker and Why Use It?

**Docker** packages your entire application (code + dependencies + configuration) into containers that run the same way on any machine. 

**Benefits:**
- ✅ No need to install Python, Node.js, or any dependencies
- ✅ Works the same on Windows, Linux, or Mac
- ✅ Easy to update and maintain
- ✅ Can run multiple instances on the same server

Think of it like shipping your application in a box that contains everything it needs to run.

---

## Step-by-Step Deployment Guide

### Step 1: Install Docker on Target Machine

#### On Windows (Target Machine)

1. Download **Docker Desktop** from: https://www.docker.com/products/docker-desktop
2. Run the installer
3. Restart your computer
4. Open Docker Desktop and wait for it to start
5. Verify installation:
   ```powershell
   docker --version
   docker-compose --version
   ```

#### On Linux Server (Ubuntu/Debian)

```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
docker-compose --version
```

#### On Linux Server (RHEL/CentOS)

```bash
# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

---

### Step 2: Transfer Application Files to Target Machine

You need to copy your entire project folder to the target machine.

#### Option A: Using Git (Recommended)

If you have this in a Git repository:

```bash
# On target machine
git clone <your-repository-url>
cd esop-silverpeak-program
```

#### Option B: Using USB Drive or Network Share

1. Copy the entire `esop-silverpeak-program` folder to a USB drive
2. Plug USB into target machine
3. Copy folder to target machine (e.g., `C:\Projects\` or `/home/user/`)

#### Option C: Using SCP (Linux to Linux or Windows with PowerShell)

From your current machine:

```bash
# Compress the project
tar -czf esop-app.tar.gz esop-silverpeak-program/

# Copy to target machine (replace with actual IP/hostname)
scp esop-app.tar.gz user@target-machine-ip:/home/user/

# On target machine, extract
tar -xzf esop-app.tar.gz
cd esop-silverpeak-program
```

#### Option D: Using WinSCP (Windows GUI tool)

1. Download WinSCP: https://winscp.net/
2. Connect to target machine
3. Drag and drop the `esop-silverpeak-program` folder

---

### Step 3: Configure the Application

On the target machine, create your environment configuration:

```bash
# Navigate to the project folder
cd esop-silverpeak-program

# Copy the example environment file
cp .env.example .env

# Edit the file with your credentials
# Windows: notepad .env
# Linux: nano .env
```

**Edit `.env` and set these REQUIRED values:**

```bash
# Your SilverPeak API Configuration
BASE_API_URL=https://your-silverpeak-url.com/api/v1
API_KEY=your_actual_api_token_here

# Port Configuration (change if needed)
BACKEND_PORT=8000
FRONTEND_PORT=5173

# Security (IMPORTANT: Change for production!)
SECRET_KEY=generate_a_new_random_secret_key_here
DEFAULT_ADMIN_PASSWORD=ChangeThisPassword123!
```

**Generate a secure SECRET_KEY:**

```bash
# On Linux/Mac or Git Bash on Windows:
openssl rand -hex 32

# On PowerShell (Windows):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### Step 4: Rename Docker Compose File

The example file needs to be renamed:

```bash
# Rename docker-compose.example.yml to docker-compose.yml
# Windows:
move docker-compose.example.yml docker-compose.yml

# Linux:
mv docker-compose.example.yml docker-compose.yml
```

---

### Step 5: Start the Application

Now the easy part! Docker does all the work:

```bash
# Build and start the application
docker-compose up -d

# -d means "detached mode" (runs in background)
```

**What happens now:**
1. Docker downloads base images (first time only, takes 5-10 minutes)
2. Docker builds your application containers
3. Docker starts both backend and frontend
4. Application is ready to use!

**Check if it's running:**

```bash
# View running containers
docker-compose ps

# Should show:
# esop-backend    running
# esop-frontend   running
```

---

### Step 6: Access the Application

Open a web browser and go to:

```
http://target-machine-ip:5173
```

**Examples:**
- Same machine: `http://localhost:5173`
- Another computer on network: `http://192.168.1.100:5173`
- Server with domain: `http://myserver.company.com:5173`

**Default login:**
- Username: `admin`
- Password: `admin123` (or whatever you set in DEFAULT_ADMIN_PASSWORD)

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## Common Docker Commands (Cheat Sheet)

### Viewing Status and Logs

```bash
# View running containers
docker-compose ps

# View logs (live updating)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# View last 50 lines of logs
docker-compose logs --tail=50
```

### Starting and Stopping

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Updating the Application

```bash
# After making code changes or pulling updates:
docker-compose up -d --build

# This rebuilds containers with new code
```

### Cleaning Up

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes database!)
docker-compose down -v

# Remove unused Docker images (free up space)
docker system prune -a
```

---

## Troubleshooting

### Problem: "docker: command not found"

**Solution:** Docker is not installed or not in PATH
- Reinstall Docker Desktop (Windows)
- Log out and back in (Linux after adding to docker group)

### Problem: "permission denied"

**Solution on Linux:** Add your user to docker group
```bash
sudo usermod -aG docker $USER
# Log out and back in
```

**Solution on Windows:** Run PowerShell as Administrator

### Problem: "port is already in use"

**Solution:** Change ports in `.env` file:
```bash
BACKEND_PORT=8001
FRONTEND_PORT=5174
```
Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Problem: Can't access from another computer

**Solutions:**
1. Check firewall allows ports (default: 8000, 5173)
   ```bash
   # Windows Firewall
   netsh advfirewall firewall add rule name="ESOP Backend" dir=in action=allow protocol=TCP localport=8000
   netsh advfirewall firewall add rule name="ESOP Frontend" dir=in action=allow protocol=TCP localport=5173
   
   # Linux (Ubuntu)
   sudo ufw allow 8000
   sudo ufw allow 5173
   ```

2. Verify Docker containers are running:
   ```bash
   docker-compose ps
   ```

3. Find your machine's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux
   ip addr show
   hostname -I
   ```

### Problem: Application shows errors about SilverPeak API

**Solution:** Check your API configuration in `.env`:
1. Verify BASE_API_URL is correct
2. Verify API_KEY is valid
3. Check network connectivity to SilverPeak from target machine

### Problem: "BASE_API_URL must be set in .env file"

**Solution:** You forgot to create or configure the `.env` file
```bash
# Create it from example
cp .env.example .env

# Edit and add your credentials
# Windows: notepad .env
# Linux: nano .env
```

---

## Moving to Production Server

### Additional Steps for Production

1. **Use a Reverse Proxy (nginx)**
   - Don't expose backend directly to internet
   - Handle SSL/TLS certificates
   - See: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

2. **Use PostgreSQL instead of SQLite**
   - Better for multi-user production use
   - Add to docker-compose.yml:
   ```yaml
   postgres:
     image: postgres:15
     environment:
       POSTGRES_DB: esop
       POSTGRES_USER: esop_user
       POSTGRES_PASSWORD: secure_password
     volumes:
       - postgres-data:/var/lib/postgresql/data
   ```
   - Update .env:
   ```bash
   DATABASE_URL=postgresql://esop_user:secure_password@postgres:5432/esop
   ```

3. **Generate Strong Secrets**
   ```bash
   # New SECRET_KEY
   openssl rand -hex 32
   
   # New DEFAULT_ADMIN_PASSWORD
   # Use a password manager to generate
   ```

4. **Configure Backups**
   ```bash
   # Backup database volume
   docker run --rm -v esop_backend-data:/data -v $(pwd):/backup ubuntu tar czf /backup/backup.tar.gz /data
   
   # Restore
   docker run --rm -v esop_backend-data:/data -v $(pwd):/backup ubuntu tar xzf /backup/backup.tar.gz -C /
   ```

5. **Set up automatic restarts**
   - Already configured in docker-compose.yml: `restart: unless-stopped`

---

## Complete Example Walkthrough

Here's everything from start to finish on a fresh Linux server:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in

# 2. Get the application
git clone https://your-repo.com/esop-silverpeak-program.git
cd esop-silverpeak-program

# 3. Configure
cp .env.example .env
nano .env
# Add your BASE_API_URL and API_KEY, save and exit

# 4. Prepare Docker Compose
mv docker-compose.example.yml docker-compose.yml

# 5. Start it!
docker-compose up -d

# 6. Check status
docker-compose ps
docker-compose logs -f

# 7. Open browser to http://your-server-ip:5173
```

That's it! Your application is running!

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Start application | `docker-compose up -d` |
| Stop application | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart | `docker-compose restart` |
| Update code | `docker-compose up -d --build` |
| Check status | `docker-compose ps` |
| Access frontend | `http://server-ip:5173` |
| Access backend API docs | `http://server-ip:8000/docs` |

---

## Need More Help?

- **Docker Documentation:** https://docs.docker.com/get-started/
- **Docker Compose Documentation:** https://docs.docker.com/compose/
- **Project Documentation:** See [README.md](README.md)
- **Setup Details:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)

## What You Learned

🎉 Congratulations! You now know:
- ✅ What Docker is and why it's useful
- ✅ How to install Docker on different systems
- ✅ How to transfer your application to another machine
- ✅ How to configure environment variables
- ✅ How to start, stop, and manage your application
- ✅ How to troubleshoot common issues

Docker makes deployment much easier - you just did it! 🚀
