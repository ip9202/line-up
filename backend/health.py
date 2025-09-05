#!/usr/bin/env python3
"""
Railway 헬스체크용 간단한 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    print("✅ FastAPI app imported successfully")
    print("✅ Health check passed")
    sys.exit(0)
except Exception as e:
    print(f"❌ Health check failed: {e}")
    sys.exit(1)