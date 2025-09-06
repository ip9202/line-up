from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
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
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3001", 
    "http://127.0.0.1:3001",
    "https://line-up-frontend-production.up.railway.app",
    "https://web-production-20d69.up.railway.app",
    "https://line-up-backend-production.up.railway.app"
]

# Add Railway domains if available
if os.getenv("ALLOWED_ORIGINS"):
    allowed_origins.extend(os.getenv("ALLOWED_ORIGINS").split(","))

# HTTPS 강제 미들웨어 (프로덕션 환경에서만)
@app.middleware("http")
async def force_https_redirect(request: Request, call_next):
    # 프로덕션 환경에서만 HTTPS 강제
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("RAILWAY_ENVIRONMENT"):
        # X-Forwarded-Proto 헤더 확인 (Railway에서 제공)
        forwarded_proto = request.headers.get("X-Forwarded-Proto")
        if forwarded_proto == "http":
            # HTTP 요청을 HTTPS로 리다이렉트
            https_url = str(request.url).replace("http://", "https://", 1)
            return RedirectResponse(url=https_url, status_code=301)
    
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

@app.get("/api/v1/health")
async def health_check_v1():
    return {"status": "healthy", "service": "line-up-api", "version": "1.0.0"}

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
