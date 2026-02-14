from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import asyncio
import random
import os

app = FastAPI(
    title="JobCenter Kronach API",
    version="1.0.0"
)

# Исправленный CORS: Добавляем твой Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://jobcetnerportfolio.vercel.app", # Твой фронтенд
        "https://jobcetnerportfolio-git-main-rebrom1s-projects.vercel.app" # GitHub Preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# (Остальные модели данных оставляем как в твоем коде...)

# WebSocket Connection Manager с защитой от ошибок
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                continue

manager = ConnectionManager()

# (Остальные эндпоинты API оставляем...)

if __name__ == "__main__":
    # Используем порт из переменных окружения Railway
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)