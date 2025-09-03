from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.utils.database import engine, Base
from app.routers import players, games, lineups
# from app.routers import pdf  # TODO: PDF 서비스 구현 후 활성화

# Import all models to ensure they are registered
from app.models import player, game, lineup, lineup_player

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Line-Up API",
    description="야구 라인업 관리 서비스 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(players.router, prefix="/api/v1/players", tags=["players"])
app.include_router(games.router, prefix="/api/v1/games", tags=["games"])
app.include_router(lineups.router, prefix="/api/v1/lineups", tags=["lineups"])
# app.include_router(pdf.router, prefix="/api/v1/pdf", tags=["pdf"])  # TODO: PDF 서비스 구현 후 활성화

@app.get("/")
async def root():
    return {"message": "Line-Up API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "line-up-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
