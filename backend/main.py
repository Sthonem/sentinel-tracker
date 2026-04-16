from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime, timedelta

app = FastAPI(title="Sentinel Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache
_tle_cache: dict = {"data": None, "fetched_at": None}
CACHE_TTL = timedelta(hours=6)

CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php"

async def fetch_tles(group: str) -> list[dict]:
    """Fetch TLEs from CelesTrak in JSON format."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            CELESTRAK_URL,
            params={"GROUP": group, "FORMAT": "json"},
        )
        resp.raise_for_status()
        return resp.json()

@app.get("/")
def root():
    return {"status": "ok", "service": "sentinel-tracker-api"}

@app.get("/api/satellites")
async def get_satellites():
    """Return TLEs for Sentinel-1 and Sentinel-2 satellites."""
    now = datetime.utcnow()
    if _tle_cache["data"] and _tle_cache["fetched_at"]:
        if now - _tle_cache["fetched_at"] < CACHE_TTL:
            return _tle_cache["data"]

    # Fetch both groups
    sentinel_data = await fetch_tles("sentinel")
    # Filter only Sentinel-1 and Sentinel-2 families
    filtered = [
        sat for sat in sentinel_data
        if sat.get("OBJECT_NAME", "").startswith(("SENTINEL-1", "SENTINEL-2"))
    ]

    _tle_cache["data"] = filtered
    _tle_cache["fetched_at"] = now
    return filtered