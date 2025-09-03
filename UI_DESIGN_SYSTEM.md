# 🎨 UI 디자인 시스템 - Line-Up 야구 라인업 관리 서비스

> **작성일**: 2025년 09월 03일 09시 52분  
> **최종 선택된 UI 디자인 시스템**

---

## 📋 디자인 시스템 개요

### 핵심 원칙
- **Minimal Flat**: 깔끔하고 심플한 느낌
- **Modern Sans**: 가독성 우선, 모던한 느낌
- **Desktop First**: 데스크톱 기능 중심
- **Standard Performance**: 표준화된 성능 최적화

---

## 🏗️ 레이아웃 구조

### 관리자 패널 레이아웃
- **네비게이션**: 좌측 계층형 메뉴
- **대시보드**: 위젯 기반 그리드
- **데이터 테이블**: 페이지네이션
- **모달**: 편집/추가 폼
- **권한**: 역할 기반 접근

### Bootstrap Style 그리드 시스템
- **컬럼**: 12컬럼 (Bootstrap 호환)
- **간격**: 30px (1.875rem)
- **브레이크포인트**: 
  - sm: 576px
  - md: 768px
  - lg: 992px
  - xl: 1200px
- **컨테이너**: max-width 1140px
- **특징**: 표준화된 빠른 개발

---

## 🎨 컴포넌트 디자인

### Minimal Flat 컴포넌트 스타일
```css
/* 기본 컴포넌트 스타일 */
.component {
  border: 1px solid #e2e8f0;
  background: transparent;
  box-shadow: none;
  transition: background 0.2s ease;
}

.component:hover {
  background: #f8fafc;
}
```

**특징**:
- **테두리**: border 1px solid #e2e8f0
- **배경**: transparent
- **그림자**: none
- **호버**: background #f8fafc
- **트랜지션**: background 0.2s ease
- **특징**: 깔끔하고 심플한 느낌

---

## 🔤 타이포그래피

### Modern Sans 폰트 시스템
```css
/* 폰트 설정 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

body {
  font-family: 'Pretendard', 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
}
```

**타이포그래피 규칙**:
- **영문**: Inter (300-700)
- **한글**: Pretendard (300-700)
- **폴백**: system-ui, sans-serif
- **크기**: 16px 기준, 1.25 배율
- **행간**: 1.5-1.6
- **특징**: 가독성 우선, 모던한 느낌

---

## 🎭 애니메이션 효과

### Fade Transition 인터랙션
```css
/* 페이드 트랜지션 */
.fade-transition {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.fade-transition.active {
  opacity: 1;
  visibility: visible;
}
```

**애니메이션 규칙**:
- **트랜지션**: opacity + visibility
- **지속시간**: 0.2s ease-in-out
- **적용 요소**: 모달, 팝업, 페이지 전환
- **성능**: opacity는 GPU 가속
- **접근성**: 부드러운 전환으로 사용자 경험 향상

---

## 📱 반응형 전략

### Desktop First 반응형 전략
```css
/* 데스크톱 우선 설계 */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 태블릿 */
@media (max-width: 992px) {
  .container {
    max-width: 768px;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .container {
    max-width: 100%;
    padding: 0 10px;
  }
}
```

**반응형 접근법**:
- **우선순위**: 데스크톱 우선 설계
- **브레이크포인트**: max-width 기준
- **그리드**: 다중 컬럼 → 단일 컬럼
- **네비게이션**: 전체 메뉴 → 햄버거 메뉴
- **이미지**: 큰 크기 → 작은 크기
- **특징**: 데스크톱 기능 중심

---

## ⚡ 성능 최적화

### Standard 성능 최적화
```css
/* 성능 최적화 설정 */
* {
  box-sizing: border-box;
}

img {
  max-width: 100%;
  height: auto;
  format: webp;
}

/* 폰트 최적화 */
@font-face {
  font-display: swap;
}
```

**성능 최적화 전략**:
- **이미지**: WebP 포맷 사용
- **폰트**: Google Fonts 최적화
- **CSS**: 파일 압축 및 최소화
- **JS**: 번들링 및 최소화
- **캐싱**: 브라우저 캐싱 활용

---

## 🎨 색상 시스템

### 기본 색상 팔레트
```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  
  /* Gray Colors */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

---

## 🧩 컴포넌트 라이브러리

### 버튼 컴포넌트
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-200);
  background: transparent;
  color: var(--gray-700);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.btn-primary {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-600);
  border-color: var(--primary-600);
}
```

### 카드 컴포넌트
```css
.card {
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}
```

### 폼 컴포넌트
```css
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

---

## 📊 야구 라인업 특화 컴포넌트

### 라인업 그리드
```css
.lineup-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.position-card {
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.position-card:hover {
  background: var(--gray-50);
  border-color: var(--primary-300);
}

.position-card.dragover {
  background: var(--primary-50);
  border-color: var(--primary-500);
  border-style: dashed;
}
```

### 선수 카드
```css
.player-card {
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  cursor: grab;
}

.player-card:hover {
  background: var(--gray-50);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.player-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}
```

---

## 🎯 적용 가이드라인

### 1. 일관성 유지
- 모든 컴포넌트는 Minimal Flat 스타일 적용
- 색상은 정의된 CSS 변수만 사용
- 폰트는 Pretendard/Inter 조합 사용

### 2. 접근성 고려
- 충분한 색상 대비 (4.5:1 이상)
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 3. 성능 최적화
- CSS/JS 파일 압축
- 이미지 WebP 포맷 사용
- 폰트 preload 적용

### 4. 반응형 대응
- Desktop First 접근법
- 모바일에서 터치 친화적
- 브레이크포인트 일관성 유지

---

## 📝 개발 체크리스트

### 디자인 시스템 적용 시
- [ ] Minimal Flat 스타일 적용
- [ ] Pretendard/Inter 폰트 사용
- [ ] 정의된 색상 변수 사용
- [ ] Fade Transition 애니메이션 적용
- [ ] Desktop First 반응형 구현
- [ ] 성능 최적화 고려

### 컴포넌트 개발 시
- [ ] 일관된 스타일 가이드 준수
- [ ] 접근성 표준 충족
- [ ] 브라우저 호환성 확인
- [ ] 모바일 최적화 검증

---

*작성일: 2025년 09월 03일 09시 52분*  
*프로젝트: Line-Up 야구 라인업 관리 서비스*  
*디자인 시스템: Minimal Flat + Modern Sans + Desktop First*
