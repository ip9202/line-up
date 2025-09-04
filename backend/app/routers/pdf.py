from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models.lineup import Lineup
from app.models.lineup_player import LineupPlayer
from app.models.player import Player
from app.models.game import Game
from app.models.team import Team
from app.models.venue import Venue
from app.models.user import User
from app.dependencies.auth import get_current_active_user
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from openpyxl.utils import get_column_letter
from io import BytesIO
from datetime import datetime
import os

router = APIRouter()

@router.get("/lineup/{lineup_id}/pdf")
async def generate_lineup_pdf(
    lineup_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """라인업 PDF 생성"""
    try:
        # 한글 폰트 등록 시도
        korean_font = 'Helvetica'  # 기본값
        
        try:
            # 시스템에 있는 한글 폰트 찾기
            import os
            font_paths = [
                '/usr/share/fonts/truetype/nanum/NanumGothic.ttf',  # Ubuntu/Debian
                '/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf',  # Ubuntu/Debian
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',  # Ubuntu
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',  # CentOS
                '/System/Library/Fonts/AppleGothic.ttf',  # macOS
            ]
            
            for font_path in font_paths:
                if os.path.exists(font_path):
                    pdfmetrics.registerFont(TTFont('KoreanFont', font_path))
                    korean_font = 'KoreanFont'
                    print(f"한글 폰트 등록 성공: {font_path}")
                    break
                    
            # 폰트 등록이 실패한 경우 기본 폰트 사용
            if korean_font == 'Helvetica':
                print("한글 폰트를 찾을 수 없어 기본 폰트 사용")
                
        except Exception as e:
            print(f"한글 폰트 등록 실패: {e}")
            print("기본 폰트 사용")
        
        # 라인업 정보 조회
        lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
        if not lineup:
            raise HTTPException(status_code=404, detail="Lineup not found")
        
        # 경기 정보 조회
        game = db.query(Game).filter(Game.id == lineup.game_id).first()
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
        
        # 상대팀 정보 조회
        opponent_team = None
        if game.opponent_team_id:
            opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
            print(f"상대팀 ID: {game.opponent_team_id}, 상대팀명: {opponent_team.name if opponent_team else 'None'}")
        else:
            print("상대팀 ID가 없습니다")
        
        # 경기장 정보 조회
        venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
        print(f"경기장 ID: {game.venue_id}, 경기장명: {venue.name if venue else 'None'}")
        
        # 감독 정보 조회 (선수 중에서 COACH 역할인 사람 우선)
        coach_player = db.query(Player).filter(Player.role == 'COACH').first()
        if coach_player:
            coach_name = coach_player.name
            print(f"감독 (선수): {coach_name}")
        else:
            # 선수 중에 감독이 없으면 사용자 테이블에서 찾기
            coach = db.query(User).filter(User.role == 'coach').first()
            coach_name = coach.username if coach else '감독'
            print(f"감독 (사용자): {coach_name}")
        
        # 우리팀 정보 조회
        our_team = db.query(Team).filter(Team.is_active == True).first()
        team_name = our_team.name if our_team else '씨밀레'
        print(f"우리팀: {team_name}")
        
        # 라인업 플레이어 정보 조회
        lineup_players = db.query(LineupPlayer).filter(
            LineupPlayer.lineup_id == lineup_id
        ).order_by(LineupPlayer.batting_order).all()
        
        # 선수 정보 조회
        player_ids = [lp.player_id for lp in lineup_players]
        players = db.query(Player).filter(Player.id.in_(player_ids)).all()
        player_dict = {p.id: p for p in players}
        
        # PDF 생성
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        
        # 스타일 정의
        styles = getSampleStyleSheet()
        
        # 팀명 스타일
        team_style = ParagraphStyle(
            'TeamStyle',
            parent=styles['Normal'],
            fontSize=24,
            spaceAfter=10,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName=korean_font
        )
        
        # 감독 스타일
        coach_style = ParagraphStyle(
            'CoachStyle',
            parent=styles['Normal'],
            fontSize=14,
            spaceAfter=5,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName=korean_font
        )
        
        # 경기 정보 스타일
        game_info_style = ParagraphStyle(
            'GameInfoStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            alignment=TA_LEFT,
            textColor=colors.black,
            fontName=korean_font
        )
        
        # 라인업 헤더 스타일
        lineup_header_style = ParagraphStyle(
            'LineupHeaderStyle',
            parent=styles['Normal'],
            fontSize=16,
            spaceAfter=10,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName=korean_font
        )
        
        # 선수명 스타일
        player_style = ParagraphStyle(
            'PlayerStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=5,
            alignment=TA_LEFT,
            textColor=colors.black,
            fontName=korean_font
        )
        
        # PDF 내용 구성
        story = []
        
        # 2열 레이아웃: 왼쪽(경기정보+라인업), 오른쪽(선수명단)
        left_content = []
        right_content = []
        
        # 왼쪽 상단: 경기 정보 테이블 (2열 구조)
        game_info_data = [
            ["팀명", team_name],
            ["감독", coach_name],
            ["날짜", f"{game.game_date.strftime('%m.%d(%a)')} {game.game_date.strftime('%H:%M')}"],
            ["구장", venue.name if venue else '미정'],
            ["상대팀", opponent_team.name if opponent_team else '미정']
        ]
        
        game_info_table = Table(game_info_data, colWidths=[0.8*inch, 2.2*inch])
        game_info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), korean_font),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        left_content.append(game_info_table)
        left_content.append(Spacer(1, 20))
        
        # 왼쪽: 라인업 테이블 데이터 구성
        lineup_data = []
        
        # 타순 1-9번
        for i in range(1, 10):
            row = [str(i), "", "", "", ""]  # 타순, 위치, 성명, 배번, 비고
            for lp in lineup_players:
                if lp.batting_order == i:
                    player = player_dict.get(lp.player_id)
                    if player:
                        position = lp.position or ""
                        if position == "1B":
                            position = "1루수"
                        elif position == "2B":
                            position = "2루수"
                        elif position == "3B":
                            position = "3루수"
                        elif position == "SS":
                            position = "유격수"
                        elif position == "LF":
                            position = "좌익수"
                        elif position == "CF":
                            position = "중견수"
                        elif position == "RF":
                            position = "우익수"
                        elif position == "C":
                            position = "포수"
                        elif position == "DH":
                            position = "지명타자"
                        elif position == "P":
                            position = "투수"
                        
                        row[1] = position
                        row[2] = player.name
                        row[3] = str(player.number)
                    break
            lineup_data.append(row)
        
        # 투수 추가
        pitcher_row = ["P", "투수", "", "", ""]
        for lp in lineup_players:
            if lp.batting_order == 0:  # 투수는 0번
                player = player_dict.get(lp.player_id)
                if player:
                    pitcher_row[2] = player.name
                    pitcher_row[3] = str(player.number)
                break
        lineup_data.append(pitcher_row)
        
        # 왼쪽 라인업 테이블
        lineup_table = Table([["타순", "위치", "성명", "배번", "비고"]] + lineup_data, 
                           colWidths=[0.5*inch, 0.8*inch, 1.2*inch, 0.5*inch, 0.5*inch])
        lineup_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), korean_font),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        left_content.append(lineup_table)
        
        # 오른쪽: 선수 명단 테이블
        all_players = db.query(Player).filter(Player.is_active == True).order_by(Player.number).all()
        player_data = []
        
        for player in all_players:
            player_data.append([str(player.number), player.name, str(player.number), ""])  # 번호, 성명, 배번, 비고
        
        # 오른쪽 선수 명단 테이블
        player_table = Table([["번호", "성명", "배번", "비고"]] + player_data,
                           colWidths=[0.5*inch, 1.5*inch, 0.5*inch, 0.5*inch])
        player_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), korean_font),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        right_content.append(player_table)
        
        # 2열 레이아웃으로 최종 배치 (간격 조정)
        main_table = Table([[left_content, right_content]], colWidths=[3.5*inch, 3*inch])
        main_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (0, -1), 0),
            ('RIGHTPADDING', (0, 0), (0, -1), 20),  # 왼쪽 열 오른쪽 패딩
            ('LEFTPADDING', (1, 0), (1, -1), 20),   # 오른쪽 열 왼쪽 패딩
            ('RIGHTPADDING', (1, 0), (1, -1), 0),
        ]))
        
        story.append(main_table)
        
        # PDF 빌드
        doc.build(story)
        buffer.seek(0)
        
        # 파일명 생성
        filename = f"lineup_{lineup_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"PDF 생성 에러: {error_detail}")
        raise HTTPException(status_code=500, detail=f"PDF 생성 중 오류가 발생했습니다: {str(e)}")