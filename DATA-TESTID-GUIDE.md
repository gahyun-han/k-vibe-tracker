# 📋 data-testid 추가 가이드 및 체크리스트

## 🎯 목표
모든 대화형 UI 요소에 data-testid 속성 추가하여 E2E 테스트 안정성 확보

## 📊 현황
- E2E 테스트 파일: 23개 테스트 ✅
- 컴포넌트 data-testid: ❌ 부재 (34개 TSX 파일)
- E2E 테스트 신뢰성: 🔴 매우 낮음 (요소를 못 찾을 가능성 높음)

---

## 🔑 data-testid 네이밍 규칙

### 기본 원칙
- **형식**: kebab-case (예: `save-place-btn`)
- **설명적**: 기능을 명확히 나타낼 것
- **고정값**: 클래스명/스타일 변경에 영향받지 않을 것

### 네이밍 패턴

#### 1. 버튼 & 액션 요소
```typescript
// 버튼
<button data-testid="save-place-btn">저장</button>
<button data-testid="delete-place-btn">삭제</button>
<button data-testid="share-place-btn">공유</button>

// 아이콘 버튼
<IconButton data-testid="close-modal-btn">X</IconButton>
<IconButton data-testid="menu-toggle-btn">☰</IconButton>

// 링크
<Link data-testid="go-to-map-link">지도 보기</Link>
```

#### 2. 입력 요소
```typescript
// 텍스트 입력
<input data-testid="place-search" placeholder="장소 검색" />
<input data-testid="url-input" type="url" />

// 슬라이더
<input data-testid="radius-slider" type="range" />

// 체크박스/라디오
<input data-testid="place-filter-cultural" type="checkbox" />
<input data-testid="view-mode-mobile" type="radio" />
```

#### 3. 컨테이너 & 섹션
```typescript
// 컨테이너
<div data-testid="map-container">...</div>
<div data-testid="place-list">...</div>

// 모달/다이얼로그
<Modal data-testid="place-detail-modal">...</Modal>

// 카드
<div data-testid="place-card">...</div>
<div data-testid="facility-card">...</div>

// 필터/드롭다운
<div data-testid="category-filter">...</div>
<select data-testid="language-select">...</select>
```

#### 4. 목록 항목
```typescript
// 리스트 아이템
{places.map(place => (
  <div key={place.id} data-testid={`place-item-${place.id}`}>
    {place.name}
  </div>
))}

// 또는 통일된 클래스명 사용
<div data-testid="place-card" data-place-id={place.id}>...</div>
```

#### 5. 상태 지시자
```typescript
// 로딩 상태
<div data-testid="loading-spinner">...</div>
<div data-testid="empty-state">검색 결과가 없습니다</div>
<div data-testid="error-message">오류가 발생했습니다</div>

// 진행 상태
<div data-testid="route-stop" data-completed={completed}>...</div>
<div data-testid="progress-bar">...</div>
```

#### 6. 폼 요소
```typescript
<form data-testid="place-filter-form">
  <input data-testid="category-search" />
  <button data-testid="filter-submit-btn">적용</button>
  <button data-testid="filter-reset-btn">초기화</button>
</form>
```

---

## 📁 파일별 추가 체크리스트

### 📍 핵심 페이지 (최우선)

#### `app/[locale]/page.tsx` (홈)
- [ ] `<button>` - 지도 이동 → `go-to-map-btn`
- [ ] `<button>` - 필터 → `category-filter-btn`
- [ ] place 카드 목록 → `place-card` with `data-place-id`
- [ ] 빈 상태 메시지 → `empty-state`

#### `app/[locale]/map/page.tsx` (지도)
- [ ] 지도 컨테이너 → `map-container`
- [ ] 카테고리 필터 → `category-filter-{name}` (cultural, food, etc)
- [ ] 검색 입력 → `place-search`
- [ ] 장소 핀/마커 → `place-marker` with `data-place-id`
- [ ] 장소 카드 → `place-card` with `data-place-id`
- [ ] 상세보기 모달 → `place-detail-modal`
- [ ] 저장 버튼 → `save-place-btn`
- [ ] 공유 버튼 → `share-place-btn`

#### `app/[locale]/analyze/page.tsx` (분석)
- [ ] URL 입력 → `url-input`
- [ ] 분석 버튼 → `analyze-btn`
- [ ] 분석 결과 → `analysis-result`
- [ ] 에러 메시지 → `error-message`
- [ ] 로딩 스피너 → `loading-spinner`

#### `app/[locale]/route/page.tsx` (루트)
- [ ] 정류점 추가 버튼 → `add-stop-btn`
- [ ] 정류점 항목 → `route-stop` with `data-order`
- [ ] 정류점 삭제 → `delete-stop-{index}-btn`
- [ ] 완료 표시 → `complete-stop-{index}-checkbox`
- [ ] 재정렬 드래그 → `route-stops-list`

#### `app/[locale]/radar/page.tsx` (레이더)
- [ ] 레이더 컨테이너 → `radar-container`
- [ ] 반경 슬라이더 → `radius-slider`
- [ ] 시설 필터 → `facility-filter-{type}` (toilet, atm, etc)
- [ ] 시설 카드 → `facility-card` with `data-facility-id`

#### `app/[locale]/profile/page.tsx` (프로필)
- [ ] 저장된 장소 섹션 → `saved-places-section`
- [ ] 저장된 루트 섹션 → `saved-routes-section`
- [ ] 장소 카드 → `saved-place-card` with `data-place-id`
- [ ] 루트 카드 → `saved-route-card` with `data-route-id`

---

### 🧩 공통 컴포넌트 (필수)

#### `components/layout/TopBar.tsx`
- [ ] 언어 변경 버튼 → `language-switcher`
- [ ] 로고/홈 링크 → `logo-link`
- [ ] 메뉴 버튼 → `menu-toggle-btn`

#### `components/layout/BottomNav.tsx`
- [ ] 홈 네비 → `nav-home`
- [ ] 지도 네비 → `nav-map`
- [ ] 분석 네비 → `nav-analyze`
- [ ] 루트 네비 → `nav-route`
- [ ] 레이더 네비 → `nav-radar`
- [ ] 프로필 네비 → `nav-profile`

#### `components/common/ErrorBoundary.tsx`
- [ ] 에러 메시지 → `error-boundary-message`
- [ ] 재시도 버튼 → `error-retry-btn`

#### `components/map/KakaoMapView.tsx`
- [ ] 지도 DOM → `kakao-map-container`
- [ ] 마커 → `map-marker` with `data-place-id`

#### `components/map/CategoryFilter.tsx`
- [ ] 필터 컨테이너 → `category-filter`
- [ ] 필터 버튼 → `category-filter-{name}`

#### `components/map/PlaceDetailModal.tsx`
- [ ] 모달 → `place-detail-modal`
- [ ] 닫기 버튼 → `close-modal-btn`
- [ ] 저장 버튼 → `save-place-btn`
- [ ] 공유 버튼 → `share-place-btn`
- [ ] 루트 추가 → `add-to-route-btn`

---

### 🧬 추가 컴포넌트

#### `components/common/Toast.tsx`
- [ ] 토스트 메시지 → `toast-message`
- [ ] 닫기 버튼 → `toast-close-btn`

#### `components/radar/RadiusSlider.tsx`
- [ ] 슬라이더 → `radius-slider`
- [ ] 현재값 표시 → `radius-value`

#### `components/route/RouteMiniMap.tsx`
- [ ] 미니맵 → `route-mini-map`

#### `components/route/CrowdBadge.tsx`
- [ ] 혼잡도 배지 → `crowd-badge`

#### `components/auth/LoginModal.tsx`
- [ ] 로그인 모달 → `login-modal`
- [ ] 로그인 버튼 → `login-btn`

---

## 🔧 자동화 스크립트

### bash 스크립트로 자동 추가 (70% 자동화)

```bash
#!/bin/bash
# add-data-testid.sh - 특정 패턴의 data-testid 자동 추가

# 1. 버튼 요소에 자동 추가
find . -name "*.tsx" -type f -exec sed -i 's/<button/<button data-testid="btn"/g' {} \;

# 2. 입력 요소에 자동 추가
find . -name "*.tsx" -type f -exec sed -i 's/<input/<input data-testid="input"/g' {} \;

# 3. 컨테이너에 자동 추가
find . -name "*.tsx" -type f -exec sed -i 's/<div/<div data-testid="container"/g' {} \;
```

**주의:** 이는 모든 요소에 일괄 추가하므로, 수동으로 검토 후 의미 있는 이름으로 변경해야 합니다.

---

## ✅ 검증 체크리스트

각 파일 작업 후 확인:

- [ ] data-testid 속성이 있는가
- [ ] kebab-case 형식인가
- [ ] 설명적인 이름인가
- [ ] 중복된 testid가 없는가 (같은 페이지 내)
- [ ] id/className 변경에 영향받지 않는가
- [ ] E2E 테스트가 해당 요소를 찾을 수 있는가

---

## 🧪 E2E 테스트 검증

추가 후 E2E 테스트 실행:

```bash
# 1. 앱 시작
npm run dev

# 2. E2E 테스트 실행 (다른 터미널)
npm run test:e2e

# 3. UI 모드로 디버깅
npm run test:e2e:ui

# 4. 특정 테스트만 실행
npx playwright test __tests__/e2e/main.e2e.ts -g "지도"
```

---

## 📊 진행 상황 추적

### 시작 전
- 페이지별 필요 data-testid: ~50개
- 컴포넌트별 필요 data-testid: ~40개
- **총 예상: 90개**

### 진행 중
- [ ] 홈 페이지 (5개)
- [ ] 지도 페이지 (12개)
- [ ] 분석 페이지 (5개)
- [ ] 루트 페이지 (8개)
- [ ] 레이더 페이지 (6개)
- [ ] 프로필 페이지 (6개)
- [ ] 공통 컴포넌트 (20개)
- [ ] 추가 컴포넌트 (22개)

### 완료 후
- [ ] 모든 E2E 테스트 실행 가능
- [ ] 테스트 통과율 95%+
- [ ] 0개 "element not found" 에러

---

## 🎓 베스트 프랙티스

### DO ✅
- 기능을 명확히 나타내는 이름 사용
- kebab-case 일관성 유지
- 동적 ID는 data-* 속성 활용
- 주요 상호작용 요소에만 추가

### DON'T ❌
- className이나 id 노출
- 일반적인 이름 (btn, input, div)
- camelCase 또는 snake_case
- 모든 요소에 추가 (성능 영향)

---

## 📞 문제 해결

### 문제: E2E 테스트에서 요소를 못 찾음
**해결:**
1. 요소가 실제로 DOM에 존재하는지 확인
2. data-testid가 정확히 입력되었는지 확인
3. `page.waitForSelector()` 사용 고려
4. Playwright UI 모드에서 요소 위치 확인

### 문제: 동적 요소 (리스트 아이템)의 testid
**해결:**
```typescript
// 방법 1: ID 포함
<div data-testid={`place-item-${place.id}`}>

// 방법 2: 데이터 속성
<div data-testid="place-item" data-place-id={place.id}>

// E2E에서 선택
page.locator('[data-testid="place-item"][data-place-id="123"]')
```

---

## 📚 참고

- **E2E 테스트 파일**: `__tests__/e2e/main.e2e.ts`
- **테스트 실행 가이드**: `TESTING.md`
- **Playwright 선택자**: https://playwright.dev/docs/locators
