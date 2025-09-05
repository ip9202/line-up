from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import subprocess

from app.utils.database import engine, Base
from app.routers import players, games, lineups, pdf, excel, auth, teams, venues

# Import all models to ensure they are registered
from app.models import player, game, lineup, lineup_player, user, team, venue

# Create database tables
Base.metadata.create_all(bind=engine)

# Run migrations if RUN_MIGRATIONS is set
if os.getenv("RUN_MIGRATIONS") == "true":
    try:
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("Database migrations completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Migration failed: {e}")
    except Exception as e:
        print(f"Migration error: {e}")

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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["teams"])
app.include_router(venues.router, prefix="/api/v1/venues", tags=["venues"])
app.include_router(players.router, prefix="/api/v1/players", tags=["players"])
app.include_router(games.router, prefix="/api/v1/games", tags=["games"])
app.include_router(lineups.router, prefix="/api/v1/lineups", tags=["lineups"])
app.include_router(pdf.router, prefix="/api/v1/pdf", tags=["pdf"])
app.include_router(excel.router, prefix="/api/v1/excel", tags=["excel"])

@app.get("/")
async def root():
    return {"message": "Line-Up API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "line-up-api"}

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
