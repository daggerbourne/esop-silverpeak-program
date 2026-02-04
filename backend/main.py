import uvicorn
from fastapi import FastAPI, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
import os
from pydantic import Field
import requests
import urllib3

# Disable SSL warnings for internal API calls (configure SSL properly for production)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from database import init_db
from routers import auth, user
from auth.auth_handler import get_current_active_user
from models import User

load_dotenv()
BASE_API_URL = os.getenv("BASE_API_URL")
API_KEY = os.getenv("API_KEY")


if not BASE_API_URL or not API_KEY:
    raise RuntimeError("Missing BASE_API_URL or API_KEY in .env")

# Pydantic Models
class Appliance(BaseModel):
    id: str
    hostName: str
    nePk: str
    site: Optional[str] = None # site may be absent
    ip: str
    model: Optional[str] = None
    softwareVersion: Optional[str] = None
    
    model_config = {
        "extra": "ignore",
    }

# DHCP Lease Model
class Lease(BaseModel):
    lease: str
    starts: int
    ends: int
    cltt: int
    state: str
    nextState: str
    rewind_binding_state: str
    mac: str
    client_hostname: Optional[str] = Field(None, alias="client-hostname")

    model_config = {
        "extra": "ignore",
        "populate_by_name": True,
    }

class Clients(BaseModel):
    clients: Dict[str, Lease]

# FastAPI app setup
app = FastAPI(debug=True)

# Initialize database and create default admin
init_db()

# CORS origins - add production URLs via CORS_ORIGINS env var
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, tags=["users"])

# Fetch DHCP leases from Silver Peak API - Helper function  
def make_api_request(url: str) -> dict:
    """Make authenticated request to SilverPeak API"""
    resp = requests.get(
        url,
        headers={
            "X-AUTH-TOKEN": API_KEY,
            "Accept": "application/json",
        },
        timeout=10,
        verify=False
    )
    resp.raise_for_status()
    return resp.json()

# API Endpoints
@app.get("/appliances", response_model=List[Appliance])
def get_appliances(current_user: User = Depends(get_current_active_user)):
    """Fetch all appliances from SilverPeak (requires authentication)"""
    url = f"{BASE_API_URL}/appliance"
    data = make_api_request(url)
    return data

@app.get("/clients", response_model=Clients)
def get_clients(
    nePk: str = Query(..., description="Network element primary key"),
    current_user: User = Depends(get_current_active_user)
):
    """Fetch DHCP clients for a specific appliance (requires authentication)"""
    url = f"{BASE_API_URL}/dhcpConfig/leases?nePk={nePk}"
    data = make_api_request(url)
    return Clients(clients=data)

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
