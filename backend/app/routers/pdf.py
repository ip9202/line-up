from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from datetime import datetime

from app.utils.database import get_db
from app.models.lineup import Lineup
from app.services.pdf_service import PDFService

router = APIRouter()

@router.post("/lineup/{lineup_id}")
async def generate_lineup_pdf(
    lineup_id: int,
    format: str = "A4",
    orientation: str = "portrait",
    db: Session = Depends(get_db)
):
    """라인업 PDF 생성"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    pdf_service = PDFService()
    pdf_path = pdf_service.generate_lineup_pdf(
        lineup=lineup,
        format=format,
        orientation=orientation
    )
    
    filename = f"lineup_{lineup_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return {
        "pdf_url": f"/api/v1/pdf/download/{lineup_id}",
        "filename": filename,
        "size": os.path.getsize(pdf_path),
        "created_at": datetime.now().isoformat()
    }

@router.get("/lineup/{lineup_id}/download")
async def download_lineup_pdf(
    lineup_id: int,
    db: Session = Depends(get_db)
):
    """라인업 PDF 다운로드"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    pdf_service = PDFService()
    pdf_path = pdf_service.get_lineup_pdf_path(lineup_id)
    
    if not os.path.exists(pdf_path):
        # Generate PDF if not exists
        pdf_path = pdf_service.generate_lineup_pdf(lineup=lineup)
    
    filename = f"lineup_{lineup_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return FileResponse(
        path=pdf_path,
        filename=filename,
        media_type="application/pdf"
    )

@router.get("/lineup/{lineup_id}/preview")
async def preview_lineup_pdf(
    lineup_id: int,
    db: Session = Depends(get_db)
):
    """라인업 PDF 미리보기"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    pdf_service = PDFService()
    pdf_path = pdf_service.get_lineup_pdf_path(lineup_id)
    
    if not os.path.exists(pdf_path):
        # Generate PDF if not exists
        pdf_path = pdf_service.generate_lineup_pdf(lineup=lineup)
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf"
    )
