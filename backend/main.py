from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import asyncio
import random

app = FastAPI(
    title="JobCenter Kronach API",
    description="Backend API for JobCenter 3D Application",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://maksym-project.vercel.app",  # Your production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Job(BaseModel):
    id: int
    title: str
    company: str
    location: str
    type: str
    salary: str
    description: str
    posted_date: str

class Stats(BaseModel):
    openPositions: int
    successfulPlacements: int
    consultationsPerMonth: int
    courses: int

class Lead(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    position: str
    source: str
    message: Optional[str] = None

class Application(BaseModel):
    job_id: int
    applicant_name: str
    email: str
    phone: str
    cv_url: Optional[str] = None
    cover_letter: Optional[str] = None

# Mock Database
JOBS_DB = [
    {
        "id": 1,
        "title": "Softwareentwickler (m/w/d)",
        "company": "Tech Solutions GmbH",
        "location": "Kronach",
        "type": "Vollzeit",
        "salary": "45.000 - 65.000 €",
        "description": "Wir suchen einen erfahrenen Softwareentwickler für spannende Projekte im Bereich Web- und Mobile-Entwicklung.",
        "posted_date": "2026-02-10"
    },
    {
        "id": 2,
        "title": "Pflegefachkraft (m/w/d)",
        "company": "Klinikum Kronach",
        "location": "Kronach",
        "type": "Vollzeit/Teilzeit",
        "salary": "38.000 - 52.000 €",
        "description": "Für unser engagiertes Team suchen wir eine qualifizierte Pflegefachkraft mit Herz und Kompetenz.",
        "posted_date": "2026-02-12"
    },
    {
        "id": 3,
        "title": "KFZ-Mechatroniker (m/w/d)",
        "company": "Autohaus Schmidt",
        "location": "Kronach",
        "type": "Vollzeit",
        "salary": "35.000 - 48.000 €",
        "description": "Sie haben eine Leidenschaft für Autos? Dann werden Sie Teil unseres Teams!",
        "posted_date": "2026-02-08"
    },
    {
        "id": 4,
        "title": "Bürokaufmann/-frau (m/w/d)",
        "company": "Stadtverwaltung Kronach",
        "location": "Kronach",
        "type": "Vollzeit",
        "salary": "32.000 - 42.000 €",
        "description": "Unterstützen Sie uns in der Verwaltung mit Ihrer Organisationsstärke und Kommunikationsfähigkeit.",
        "posted_date": "2026-02-05"
    },
]

STATS_DB = {
    "openPositions": 342,
    "successfulPlacements": 1247,
    "consultationsPerMonth": 856,
    "courses": 67,
}

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# REST API Endpoints
@app.get("/")
async def root():
    return {
        "message": "JobCenter Kronach API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/jobs", response_model=List[Job])
async def get_jobs(
    location: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = 10
):
    """Get all job listings"""
    jobs = JOBS_DB.copy()
    
    if location:
        jobs = [j for j in jobs if location.lower() in j["location"].lower()]
    if type:
        jobs = [j for j in jobs if type.lower() in j["type"].lower()]
    
    return jobs[:limit]

@app.get("/api/jobs/{job_id}", response_model=Job)
async def get_job(job_id: int):
    """Get specific job by ID"""
    job = next((j for j in JOBS_DB if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/jobs/search")
async def search_jobs(q: str):
    """Search jobs by query"""
    query = q.lower()
    results = [
        j for j in JOBS_DB
        if query in j["title"].lower() 
        or query in j["company"].lower()
        or query in j["description"].lower()
    ]
    return results

@app.post("/api/jobs/{job_id}/apply")
async def apply_to_job(job_id: int, application: Application):
    """Apply to a job"""
    job = next((j for j in JOBS_DB if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Here you would save the application to database
    # For now, just return success and broadcast to WebSocket
    
    await manager.broadcast({
        "type": "new_application",
        "data": {
            "job_title": job["title"],
            "applicant": application.applicant_name,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    return {
        "status": "success",
        "message": "Application submitted successfully",
        "application_id": random.randint(1000, 9999)
    }

@app.get("/api/stats", response_model=Stats)
async def get_stats():
    """Get current statistics"""
    return STATS_DB

@app.post("/api/leads")
async def create_lead(lead: Lead):
    """Create a new lead"""
    # Save lead to database
    lead_id = random.randint(1000, 9999)
    
    # Broadcast to WebSocket clients
    await manager.broadcast({
        "type": "new_lead",
        "data": {
            "id": lead_id,
            "name": lead.name,
            "position": lead.position,
            "source": lead.source,
            "timestamp": datetime.now().isoformat()
        }
    })
    
    # Update stats
    STATS_DB["openPositions"] += 1
    
    return {
        "status": "success",
        "lead_id": lead_id
    }

# WebSocket Endpoint for Real-time Updates
@app.websocket("/ws/stats")
async def websocket_stats(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        # Send initial stats
        await websocket.send_json({
            "event": "initial_stats",
            "data": STATS_DB
        })
        
        # Keep connection alive and send periodic updates
        while True:
            await asyncio.sleep(10)
            
            # Simulate some activity (in production, this would be real data)
            STATS_DB["consultationsPerMonth"] = random.randint(850, 870)
            
            await websocket.send_json({
                "event": "stats_update",
                "data": STATS_DB
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/leads")
async def websocket_leads(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Wait for messages
            data = await websocket.receive_json()
            
            # Echo back (in production, process the data)
            await websocket.send_json({
                "event": "lead_processed",
                "data": data
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
