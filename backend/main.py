import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
import os
from pydantic import Field
import requests

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
            "X-API-KEY": f"{API_KEY}",
            "Accept": "application/json",
        },
        timeout=10,
    )
    resp.raise_for_status()

    return resp.json()  # dict keyed by IP



@app.get("/clients", response_model=Clients)
def get_clients():
    data = fetch_clients()
    return Clients(clients=data)





if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

# {
#     "10.35.19.3": {
#         "lease": "10.35.19.3",
#         "starts": 1770046042,
#         "ends": 1770060442,
#         "cltt": 1770046042,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "7c:a8:ec:bc:cd:01",
#         "set_vendor-class-identifier_=_\"Aruba_S0U60A": "5420"
#     },
#     "10.35.19.4": {
#         "lease": "10.35.19.4",
#         "starts": 1770046617,
#         "ends": 1770061017,
#         "cltt": 1770046617,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "34:c5:15:07:ca:01",
#         "set_vendor-class-identifier_=_\"Aruba_S0U60A": "5420"
#     },
#     "10.35.11.6": {
#         "lease": "10.35.11.6",
#         "starts": 1770051363,
#         "ends": 1770065763,
#         "cltt": 1770051363,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "1c:6a:1b:8d:03:d6",
#         "uid": "\\001\\034j\\033\\215\\003\\326",
#         "set_vendor-class-identifier_=_\"udhcp": "1.34.1",
#         "client-hostname": "idf"
#     },
#     "10.35.11.5": {
#         "lease": "10.35.11.5",
#         "starts": 1770050375,
#         "ends": 1770064775,
#         "cltt": 1770050375,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "58:d6:1f:23:37:e8",
#         "uid": "\\001X\\326\\037#7\\350",
#         "client-hostname": "Unifi-Winder-2"
#     },
#     "10.35.250.45": {
#         "lease": "10.35.250.45",
#         "starts": 1770051432,
#         "ends": 1770065832,
#         "cltt": 1770051432,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "96:03:77:d6:82:e2",
#         "uid": "\\001\\226\\003w\\326\\202\\342",
#         "client-hostname": "iPhone"
#     },
#     "10.35.250.46": {
#         "lease": "10.35.250.46",
#         "starts": 1770051502,
#         "ends": 1770065902,
#         "cltt": 1770051502,
#         "state": "active",
#         "nextState": "free",
#         "rewind_binding_state": "free",
#         "mac": "7a:95:a6:49:50:38",
#         "uid": "\\001z\\225\\246IP8",
#         "client-hostname": "iPhone"
#     }
# }