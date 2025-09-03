"""
PDF 생성 서비스
A4 사이즈 야구 라인업 PDF를 생성합니다.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from typing import List, Dict, Any
import os
from datetime import datetime


class PDFService:
    def __init__(self):
        self.page_width, self.page_height = A4
        self.setup_fonts()
        self.setup_styles()
    
    def setup_fonts(self):
        """한글 폰트 설정"""
        try:
            # 시스템 폰트 경로 (macOS)
            font_paths = [
                "/System/Library/Fonts/AppleGothic.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "/Library/Fonts/Arial Unicode MS.ttf"
            ]
            
            for font_path in font_paths:
                if os.path.exists(font_path):
                    pdfmetrics.registerFont(TTFont('Korean', font_path))
                    break
            else:
                # 폰트를 찾을 수 없는 경우 기본 폰트 사용
                pdfmetrics.registerFont(TTFont('Korean', 'Helvetica'))
        except Exception:
            # 폰트 등록 실패 시 기본 폰트 사용
            pass
    
    def setup_styles(self):
        """스타일 설정"""
        self.styles = getSampleStyleSheet()
        
        # 제목 스타일
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica'
        )
        
        # 부제목 스타일
        self.subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica'
        )
        
        # 일반 텍스트 스타일
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=12,
            fontName='Helvetica'
        )
    
    def create_lineup_pdf(self, lineup_data: Dict[str, Any], output_path: str) -> str:
        """
        라인업 PDF 생성
        
        Args:
            lineup_data: 라인업 데이터
            output_path: 출력 파일 경로
            
        Returns:
            생성된 PDF 파일 경로
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        
        story = []
        
        # 제목
        title = Paragraph("야구 라인업", self.title_style)
        story.append(title)
        story.append(Spacer(1, 12))
        
        # 경기 정보
        if lineup_data.get('game'):
            game_info = f"경기: {lineup_data['game'].get('opponent', '상대팀')} | "
            game_info += f"날짜: {lineup_data['game'].get('date', '날짜미정')} | "
            game_info += f"장소: {lineup_data['game'].get('venue', '장소미정')}"
            game_paragraph = Paragraph(game_info, self.subtitle_style)
            story.append(game_paragraph)
            story.append(Spacer(1, 20))
        
        # 라인업 테이블 생성
        lineup_table = self._create_lineup_table(lineup_data)
        story.append(lineup_table)
        story.append(Spacer(1, 30))
        
        # 선수 정보 테이블 생성
        players_table = self._create_players_table(lineup_data)
        story.append(players_table)
        
        # PDF 생성
        doc.build(story)
        return output_path
    
    def _create_lineup_table(self, lineup_data: Dict[str, Any]) -> Table:
        """라인업 테이블 생성"""
        # 테이블 헤더
        headers = ['타순', '위치', '성명', '배번']
        
        # 테이블 데이터
        data = [headers]
        
        # 라인업 플레이어 데이터 추가
        lineup_players = lineup_data.get('lineup_players', [])
        
        # 타순별로 정렬
        sorted_players = sorted(lineup_players, key=lambda x: x.get('batting_order', 0))
        
        for player in sorted_players:
            batting_order = player.get('batting_order', 0)
            position = player.get('position', '')
            player_name = player.get('player', {}).get('name', '')
            player_number = player.get('player', {}).get('number', '')
            
            # 타순 표시 (투수는 P로 표시)
            order_display = 'P' if batting_order == 0 else f"{batting_order}번"
            
            data.append([
                order_display,
                position,
                player_name,
                f"#{player_number}" if player_number else ""
            ])
        
        # 테이블 생성
        table = Table(data, colWidths=[30*mm, 30*mm, 50*mm, 30*mm])
        
        # 테이블 스타일
        table_style = TableStyle([
            # 헤더 스타일
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # 데이터 스타일
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        
        table.setStyle(table_style)
        return table
    
    def _create_players_table(self, lineup_data: Dict[str, Any]) -> Table:
        """선수 정보 테이블 생성"""
        # 테이블 헤더
        headers = ['등번호', '이름', '포지션', '롤', '나이']
        
        # 테이블 데이터
        data = [headers]
        
        # 라인업 플레이어 데이터 추가
        lineup_players = lineup_data.get('lineup_players', [])
        
        for player in lineup_players:
            player_info = player.get('player', {})
            position = player.get('position', '')
            
            data.append([
                f"#{player_info.get('number', '')}" if player_info.get('number') else "",
                player_info.get('name', ''),
                position,
                player_info.get('role', ''),
                f"{player_info.get('age', '')}세" if player_info.get('age') else ""
            ])
        
        # 테이블 생성
        table = Table(data, colWidths=[25*mm, 40*mm, 25*mm, 30*mm, 20*mm])
        
        # 테이블 스타일
        table_style = TableStyle([
            # 헤더 스타일
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # 데이터 스타일
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightblue),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ])
        
        table.setStyle(table_style)
        return table


# 전역 인스턴스
pdf_service = PDFService()
