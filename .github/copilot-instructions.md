# Copilot Instructions - ESOP SilverPeak Program

## Project Overview
Full-stack DHCP lease monitoring application with FastAPI backend and React frontend. Backend proxies appliance and DHCP lease data from SilverPeak SD-WAN API; frontend displays site selection and client leases.

**⚠️ LEGACY CODE**: `Fruits.jsx` and `AddFruitForm.jsx` are unused template remnants. Active components are `SiteSelector.jsx` and `Clients.jsx`.

## Architecture

### Backend (`backend/`)
- **Framework**: FastAPI + Uvicorn (port 8000)
- **Data Source**: SilverPeak SD-WAN API (via `BASE_API_URL` env var)
- **Authentication**: Bearer token (`API_KEY` env var) sent as `X-AUTH-TOKEN` header
- **SSL Verification**: Disabled (`verify=False`) for internal API requests
- **Endpoints**:
  - `GET /appliances` → List of network appliances (returns `List[Appliance]`)
  - `GET /clients?nePk=<id>` → DHCP leases for specific appliance (returns `{"clients": {<ip>: <lease_data>}}`)
- **Data Models**:
  - `Appliance`: `id`, `hostName`, `nePk` (primary key), `site`, `ip`, `model`, `softwareVersion`
  - `Lease`: Uses `Field(alias=...)` for hyphenated JSON keys (e.g., `client_hostname` ↔ `"client-hostname"`)
  - Both models use `model_config = {"extra": "ignore"}` to handle dynamic API fields

### Frontend (`frontend/`)
- **Framework**: React 18 + Vite + React Router v6
- **Port**: 5173 (dev server)
- **API Layer**: Axios instance ([api.js](frontend/src/api.js)) hardcoded to `http://localhost:8000`
- **Routing**:
  - `/` → Home page
  - `/select-site` → SiteSelector (appliance list with search)
  - `/clients/:nePk` → Clients (DHCP lease table for selected appliance)
- **State Management**: Local useState/useEffect (no global state)

### Data Flow
```
SilverPeak API → Backend FastAPI → Frontend React
  (X-AUTH-TOKEN)  (/appliances,    (axios calls)
                   /clients?nePk)
```

User selects appliance → Navigate to `/clients/:nePk` with `{ hostname, site }` state → Fetch DHCP leases

## Development Workflow

### Backend Setup
```bash
cd backend
# Create .env file:
# BASE_API_URL=https://silverpeak.example.com/api/v1
# API_KEY=your_api_token
pip install -r requirements.txt
python main.py
```
**Critical**: Missing `.env` causes immediate runtime error. Backend must run first or frontend API calls fail.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Hot reload enabled. Backend must be accessible at `http://localhost:8000`.

### Testing API
```bash
# Test appliances endpoint
curl http://localhost:8000/appliances

# Test clients endpoint (requires valid nePk from appliances response)
curl http://localhost:8000/clients?nePk=<nePk_value>
```

## Code Conventions

### Backend Patterns
- **Pydantic Field Aliases**: Always use `Field(alias=...)` for hyphenated API keys (see [main.py#L52](backend/main.py#L52))
- **Config Requirements**: Set `model_config = {"extra": "ignore"}` to tolerate unknown API fields
- **Helper Functions**: `make_api_request(url)` centralizes authentication headers (see [main.py#L78](backend/main.py#L78))
- **CORS**: Update `origins` list in [main.py#L66](backend/main.py#L66) when adding deployment URLs

### Frontend Patterns
- **API Calls**: Always use [api.js](frontend/src/api.js) axios instance, never raw `fetch()`
- **Routing with State**: Pass appliance metadata via `navigate()` state (see [SiteSelector.jsx#L48](frontend/src/components/SiteSelector.jsx#L48))
- **Response Structure**: Backend returns nested `{"clients": {}}` format; access via `response.data.clients`
- **Component Data Access**: `Clients.jsx` extracts `nePk` from URL params and `hostname`/`site` from `location.state`
- **Error Handling**: Console.error only (no user-facing error UI)

## Known Issues & TODOs
1. **Legacy Template Code**: Remove unused `Fruits.jsx` and `AddFruitForm.jsx` components
2. **Hardcoded API URL**: Frontend API URL should use Vite env vars (`import.meta.env.VITE_API_URL`) for production
3. **No Error UI**: API errors only logged to console; consider adding toast notifications
4. **Missing .env Template**: Add `.env.example` to document required environment variables
5. **SSL Verification Disabled**: Production should use proper SSL cert validation
6. **Backend TODOs**: Refresh appliance list on startup cached (see [main.py#L10](backend/main.py#L10))

## Key Files
- [backend/main.py](backend/main.py) - FastAPI app with `/appliances` and `/clients` endpoints
- [frontend/src/api.js](frontend/src/api.js) - Axios instance configuration
- [frontend/src/components/SiteSelector.jsx](frontend/src/components/SiteSelector.jsx) - Appliance list with search
- [frontend/src/components/Clients.jsx](frontend/src/components/Clients.jsx) - DHCP lease table for selected site
- [frontend/src/App.jsx](frontend/src/App.jsx) - React Router configuration
