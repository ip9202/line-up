#!/usr/bin/env python3
"""
기본 사용자 생성 스크립트
총무와 감독 계정을 생성합니다.
"""

from sqlalchemy.orm import Session
from app.utils.database import SessionLocal
from app.models.user import User
from app.utils.auth import get_password_hash
from app.enums.user_role import UserRole

def create_default_users():
    """기본 사용자 생성"""
    db = SessionLocal()
    
    try:
        # 총무 계정 생성
        manager_user = db.query(User).filter(User.username == "manager").first()
        if not manager_user:
            manager_user = User(
                username="manager",
                password_hash=get_password_hash("manager123"),
                role="총무",
                is_active=True
            )
            db.add(manager_user)
            print("✅ 총무 계정 생성: username=manager, password=manager123")
        else:
            print("ℹ️  총무 계정이 이미 존재합니다.")
        
        # 감독 계정 생성
        coach_user = db.query(User).filter(User.username == "coach").first()
        if not coach_user:
            coach_user = User(
                username="coach",
                password_hash=get_password_hash("coach123"),
                role="감독",
                is_active=True
            )
            db.add(coach_user)
            print("✅ 감독 계정 생성: username=coach, password=coach123")
        else:
            print("ℹ️  감독 계정이 이미 존재합니다.")
        
        db.commit()
        print("\n🎉 기본 사용자 생성 완료!")
        print("📋 로그인 정보:")
        print("   총무: manager / manager123")
        print("   감독: coach / coach123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 오류 발생: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_default_users()
