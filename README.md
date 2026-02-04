# ESOP SilverPeak DHCP Monitoring Program

Full-stack DHCP lease monitoring application with FastAPI backend and React frontend featuring role-based authentication.

## Features

- **Backend**: FastAPI + SQLAlchemy with JWT authentication
- **Frontend**: React 18 + Vite + React Router
- **Authentication**: Role-based access control (admin/user roles)
- **Data Source**: SilverPeak SD-WAN API proxy
- **Database**: SQLite with bcrypt password hashing

## 🚀 Deployment Options

### Option 1: Docker (Recommended - Easiest!)

**Never used Docker? Start here:** **[📚 Docker Documentation Index](DOCKER_INDEX.md)**

Choose your learning path:
- **⚡ Fast Track** - [5-Minute Quick Start](DOCKER_5MIN_GUIDE.md) - Just make it work!
- **📊 Visual Learner** - [Visual Guide](DOCKER_VISUAL_GUIDE.md) - See how it works
- **📚 Detailed** - [Complete Deployment Guide](DOCKER_DEPLOYMENT_GUIDE.md) - Step-by-step
- **✅ Configuration** - [Setup Checklist](DOCKER_SETUP.md) - Verify your setup
- **🔧 Advanced** - [Port Configuration](DOCKER_PORTS.md) - Customize ports

**TL;DR - Deploy in 3 steps:**
```bash
# Install Docker, then:

# 1. Create and edit .env (ALL YOUR CONFIGURATION GOES HERE)
cp .env.example .env
notepad .env  # Add your BASE_API_URL, API_KEY, and optionally ports

# 2. Rename docker-compose file (DON'T EDIT THIS FILE - just rename it)
mv docker-compose.example.yml docker-compose.yml

# 3. Start everything (Docker reads settings from .env automatically)
docker-compose up -d

# Open http://localhost:5173
```

**⚠️ Configuration Rule:** Edit `.env` file ONLY - never edit docker-compose.yml!

### Option 2: Manual Installation (Development)

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- SilverPeak SD-WAN API access

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with your SilverPeak API credentials

# Run server
python main.py
```

Backend will run at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### First Login

1. Navigate to `http://localhost:5173/login`
2. Login with default admin credentials:
   - Username: `admin`
   - Password: `admin123` (or your `DEFAULT_ADMIN_PASSWORD` from `.env`)
3. **Immediately reset the admin password** via the profile menu
4. Create additional users via the Admin Dashboard

## Environment Variables

See [.env.example](.env.example) for all required configuration options.

### Required Variables

- `BASE_API_URL` - SilverPeak SD-WAN API base URL
- `API_KEY` - SilverPeak API authentication token

### Optional Variables

- `SECRET_KEY` - JWT signing key (has default, change for production)
- `DEFAULT_ADMIN_PASSWORD` - Initial admin password (default: `admin123`)
- `HOST` - Backend host (default: `127.0.0.1`)
- `PORT` - Backend port (default: `8000`)
- `CORS_ORIGINS` - Comma-separated list of allowed frontend URLs

## Project Structure

```
├── backend/
│   ├── auth/              # Authentication handlers
│   ├── routers/           # API route definitions
│   ├── main.py            # FastAPI application
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   └── database.py        # Database initialization
├── frontend/
│   └── src/
│       ├── components/    # React components
│       ├── contexts/      # React context providers
│       └── api.js         # Axios configuration
└── .env.example           # Environment template
```

## API Endpoints

### Authentication
- `POST /auth/token` - Login (returns JWT token)
- `POST /auth/register` - Create user (admin only)

### User Management
- `GET /users/me` - Get current user profile
- `GET /users` - List all users (admin only)
- `PATCH /users/{id}` - Update user (admin only)
- `POST /users/me/reset-password` - Reset own password
- `DELETE /users/{id}` - Delete user (admin only)

### DHCP Monitoring
- `GET /appliances` - List SilverPeak appliances (authenticated)
- `GET /clients?nePk={id}` - Get DHCP leases for appliance (authenticated)

## Security Notes

- Default admin credentials should be changed immediately after deployment
- JWT tokens expire after 8 hours
- Passwords are hashed using bcrypt
- Database file (`esop.db`) is excluded from version control
- SSL verification is disabled for internal API calls (configure properly for production)

## Development

### Backend Testing

```bash
# Get JWT token
curl -X POST http://localhost:8000/auth/token \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Use token for authenticated requests
curl http://localhost:8000/appliances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Building for Production

```bash
# Backend: runs directly with uvicorn
cd backend
python main.py

# Frontend: build static assets
cd frontend
npm run build
```

## Future Enhancements

- [ ] Azure Entra ID (Azure AD) integration
- [ ] Token refresh mechanism
- [ ] Email verification for user accounts
- [ ] SSL certificate validation for production
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests

## License

Internal use only - LJA Engineering

## Support

For issues or questions, contact the development team.
