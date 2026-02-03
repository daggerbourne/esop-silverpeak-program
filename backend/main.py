import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
import os
from pydantic import Field
import requests

# TODO:
# refresh apppliance list on startup
#       grab id, nePK, site (name)
# display appliance list
# user selects appliance(s)
# get dhcp leases for appliance(s)

# display by client-hostname if available, else by ip


load_dotenv()
SRV_ADDRESS = os.getenv("SRV_ADDRESS")
API_KEY = os.getenv("API_KEY")


if not SRV_ADDRESS or not API_KEY:
    raise RuntimeError("Missing SRV_ADDRESS or API_KEY in .env")

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
        "validate_by_name": True,
    }


class Clients(BaseModel):
    
    clients: Dict[str, Lease]


app = FastAPI(debug=True)

origins = [
    "http://localhost:5173",
    # frontend URLs can be added here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_clients() -> Dict[str, Lease]:
    resp = requests.get(
        SRV_ADDRESS,
        headers={
            "X-AUTH-TOKEN": f"{API_KEY}",
            "Accept": "application/json",
        },
        timeout=10,
        verify=False  # Disable SSL verification
    )
    resp.raise_for_status()

    return resp.json()  # dict keyed by IP


@app.get("/clients", response_model=Clients)
def get_clients():
    data = fetch_clients()
    return Clients(clients=data)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
