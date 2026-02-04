# Copilot Instructions - ESOP SilverPeak Program

## Project Overview
Full-stack DHCP lease monitoring application with FastAPI backend and React frontend featuring role-based authentication. Backend proxies appliance and DHCP lease data from SilverPeak SD-WAN API; frontend displays site selection and client leases with user management for admins.

## Architecture

### Backend (`backend/`)
- **Framework**: FastAPI + Uvicorn (port 8000) + SQLAlchemy + SQLite
- **Authentication**: JWT tokens (8-hour expiry) with role-based access control
  - **Roles**: `admin` (full access), `user` (read-only)
  - **Default Admin**: username=`admin`, password=`admin123` (override with `DEFAULT_ADMIN_PASSWORD` env var)
- **Data Source**: SilverPeak SD-WAN API (via `BASE_API_URL` env var)
- **API Authentication**: Bearer token (`API_KEY` env var) sent as `X-AUTH-TOKEN` header to SilverPeak
- **SSL Verification**: Disabled (`verify=False`) for internal API requests
- **Database**: SQLite (`esop.db`) stores user accounts with hashed passwords (bcrypt)
- **Authentication Endpoints**:
  - `POST /auth/token` → Login (returns JWT)
  - `POST /auth/register` → Create user (admin only)
- **User Management Endpoints** (all require authentication):
  - `GET /users/me` → Current user profile
  - `GET /users` → List all users (admin only)
  - `GET /users/{id}` → Get user by ID (admin only)
  - `PATCH /users/{id}` → Update user (admin only)
  - `POST /users/me/reset-password` → Reset own password
  - `POST /users/{id}/reset-password` → Reset any password (admin only)
  - `DELETE /users/{id}` → Delete user (admin only)
- **Protected Endpoints**:
  - `GET /appliances` → List appliances (requires authentication)
  - `GET /clients?nePk=<id>` → DHCP leases (requires authentication)
- **Data Models**:
  - `User`: `id`, `username`, `email`, `hashed_password`, `role` (admin/user), `is_active`
  - `Appliance`: `id`, `hostName`, `nePk`, `site`, `ip`, `model`, `softwareVersion`
  - `Lease`: Uses `Field(alias=...)` for hyphenated JSON keys (e.g., `client_hostname` ↔ `"client-hostname"`)

### Frontend (`frontend/`)
- **Framework**: React 18 + Vite + React Router v6 + Axios
- **Port**: 5173 (dev server)
- **Authentication**: Context-based with `AuthProvider` wrapping app
  - Stores JWT in localStorage
  - Auto-redirects to `/login` on 401 responses
  - Axios interceptors inject `Authorization: Bearer <token>` header
- **Routing**:
  - `/login` → Login page (public)
  - `/` → Home page (protected)
  - `/select-site` → SiteSelector (protected)
  - `/clients/:nePk` → Clients (protected)
  - `/admin` → Admin Dashboard (protected, admin only)
  - `/reset-password` → Password Reset (protected)
- **State Management**: AuthContext for global auth state, local useState/useEffect for component data
- **Role-Based UI**: Admin navigation items and functions only visible to admin users

### Data Flow
```
Login → JWT Token → Axios Interceptor → Protected Routes
                         ↓
SilverPeak API ← Backend FastAPI ← Frontend React
  (X-AUTH-TOKEN)   (JWT validation)   (Bearer token)
```

## Development Workflow

### Backend Setup
```bash
cd backend
# Create .env file:
# BASE_API_URL=https://silverpeak.example.com/api/v1
# API_KEY=your_silverpeak_api_token
# DEFAULT_ADMIN_PASSWORD=admin123  # Optional, defaults to admin123
# SECRET_KEY=your_jwt_secret_key   # Optional, has default
pip install -r requirements.txt
python main.py
```
**Critical**: 
- Missing `.env` causes immediate runtime error
- Database auto-initializes with default admin on first run
- Backend must run first or frontend API calls fail

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Hot reload enabled. Navigate to `http://localhost:5173/login` to start.

### First Login
1. Navigate to `http://localhost:5173/login`
2. Login with default admin: `admin` / `admin123`
3. **Immediately reset admin password** via `/reset-password`
4. Create additional users via `/admin` dashboard (admin only)

### Testing API (with authentication)
```bash
# Login to get token
curl -X POST http://localhost:8000/auth/token \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"

# Use token in subsequent requests
curl http://localhost:8000/appliances \
  -H "Authorization: Bearer <your_token_here>"
```

## Code Conventions

### Backend Patterns
- **Authentication Dependencies**: Use `get_current_active_user` for any auth, `get_current_admin_user` for admin-only routes
- **Password Hashing**: Always use `get_password_hash()` and `verify_password()` from `auth/auth_handler.py`
- **JWT Tokens**: 8-hour expiry configured in `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Pydantic Field Aliases**: Use `Field(alias=...)` for hyphenated API keys
- **Config Requirements**: Set `model_config = {"extra": "ignore"}` to tolerate unknown API fields
- **Database Sessions**: Always use `db: Session = Depends(get_db)` pattern
- **Enum Usage**: Import `UserRole` from `models` for role assignments

### Frontend Patterns
- **API Calls**: Always use [api.js](frontend/src/api.js) axios instance (auto-adds auth headers)
- **Route Protection**: Wrap routes with `<ProtectedRoute>` or `<ProtectedRoute adminOnly={true}>`
- **Auth Context**: Access user data via `const { user, isAdmin, logout } = useContext(AuthContext)`
- **Token Management**: Never manually set headers; axios interceptor handles it
- **Error Handling**: 401 errors auto-redirect to login; other errors shown in UI

## Security & Future Enhancements

### Current Security
- Bcrypt password hashing (cost factor: default)
- JWT tokens with 8-hour expiry
- Role-based access control enforced on both frontend and backend
- SQLite database excluded from version control

### Future Authentication (Entra/Azure AD Integration)
The codebase is structured for modular auth replacement:
1. **Backend**: Replace `auth/auth_handler.py` authentication logic with Entra OAuth2 flow
2. **Keep**: JWT generation, role management, user models
3. **Frontend**: Update `AuthContext.jsx` login flow to redirect to Entra login page
4. **Keep**: ProtectedRoute, role checks, token storage patterns
5. **Migration**: Map Entra roles to local `UserRole` enum

**Integration Points**:
- `auth/auth_handler.py` - OAuth2 flow replaces password verification
- `routers/auth.py` - Add `/auth/callback` for Entra redirect
- `AuthContext.jsx` - Replace form login with Entra redirect
- Keep all role-checking logic unchanged

## Known Issues & TODOs
1. **Hardcoded API URL**: Frontend should use Vite env vars for production
2. **Missing .env Template**: Add `.env.example` to document all required variables
3. **SSL Verification Disabled**: Production should use proper SSL cert validation
4. **No Token Refresh**: Tokens expire after 8 hours; consider refresh token pattern
5. **Email Validation**: Email field exists but no email verification implemented

## Key Files

### Backend Authentication
- [backend/models.py](backend/models.py) - User model with roles and SQLAlchemy setup
- [backend/schemas.py](backend/schemas.py) - Pydantic schemas for auth requests/responses
- [backend/database.py](backend/database.py) - SQLite setup and default admin creation
- [backend/auth/auth_handler.py](backend/auth/auth_handler.py) - JWT, password hashing, role dependencies
- [backend/routers/auth.py](backend/routers/auth.py) - Login and registration endpoints
- [backend/routers/user.py](backend/routers/user.py) - User management endpoints
- [backend/main.py](backend/main.py) - FastAPI app with protected endpoints

### Frontend Authentication
- [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) - Global auth state management
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx) - Login form
- [frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx) - Route protection wrapper
- [frontend/src/components/AdminDashboard.jsx](frontend/src/components/AdminDashboard.jsx) - User management UI (admin only)
- [frontend/src/components/PasswordReset.jsx](frontend/src/components/PasswordReset.jsx) - Password change form
- [frontend/src/api.js](frontend/src/api.js) - Axios instance with auth interceptors
- [frontend/src/App.jsx](frontend/src/App.jsx) - Protected routing configuration

### Data Flow
- [frontend/src/components/SiteSelector.jsx](frontend/src/components/SiteSelector.jsx) - Appliance list with search
- [frontend/src/components/Clients.jsx](frontend/src/components/Clients.jsx) - DHCP lease table
