from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime, timedelta
from pydantic import BaseModel

app = FastAPI(title="Sentinel Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_tle_cache: dict = {"data": None, "fetched_at": None}
CACHE_TTL = timedelta(hours=6)
CELESTRAK_URL = "https://celestrak.org/NORAD/elements/gp.php"


class SatelliteTLE(BaseModel):
    name: str
    norad_id: int
    line1: str
    line2: str


def parse_tle_text(text: str) -> list[SatelliteTLE]:
    """Parse 3-line TLE text into a list of SatelliteTLE objects."""
    lines = text.strip().splitlines()
    result: list[SatelliteTLE] = []
    for i in range(0, len(lines) - 2, 3):
        name = lines[i].strip()
        line1 = lines[i + 1].strip()
        line2 = lines[i + 2].strip()
        if not (line1.startswith("1 ") and line2.startswith("2 ")):
            continue
        try:
            norad_id = int(line1[2:7])
        except ValueError:
            continue
        result.append(SatelliteTLE(name=name, norad_id=norad_id, line1=line1, line2=line2))
    return result


async def fetch_sentinel_tles() -> list[SatelliteTLE]:
    """Fetch all Sentinel TLEs from CelesTrak and filter to S-1 and S-2 families."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            CELESTRAK_URL,
            params={"NAME": "sentinel", "FORMAT": "tle"},
        )
        resp.raise_for_status()

    all_sats = parse_tle_text(resp.text)
    return [
        sat for sat in all_sats
        if sat.name.startswith(("SENTINEL-1", "SENTINEL-2"))
    ]


@app.get("/")
def root() -> dict:
    return {"status": "ok", "service": "sentinel-tracker-api"}


@app.get("/api/satellites", response_model=list[SatelliteTLE])
async def get_satellites() -> list[SatelliteTLE]:
    """Return TLE line strings for active Sentinel-1 and Sentinel-2 satellites."""
    now = datetime.utcnow()
    if _tle_cache["data"] and _tle_cache["fetched_at"]:
        if now - _tle_cache["fetched_at"] < CACHE_TTL:
            return _tle_cache["data"]

    try:
        filtered = await fetch_sentinel_tles()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"CelesTrak fetch failed: {exc}")

    _tle_cache["data"] = filtered
    _tle_cache["fetched_at"] = now
    return filtered
