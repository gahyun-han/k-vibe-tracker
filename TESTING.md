# 🧪 K-Vibe Tracker 테스트 절차 가이드

## 📋 개요

이 문서는 K-Vibe Tracker 프로젝트의 전체 테스트 절차를 설명합니다. 프로젝트는 다음 레벨의 테스트를 포함합니다:

- **Unit Tests**: 개별 함수/컴포넌트 테스트 (Vitest)
- **Integration Tests**: API/데이터 흐름 테스트 (Vitest)
- **E2E Tests**: 전체 사용자 여정 테스트 (Playwright)

---

## 🛠 사전 준비 사항

### 1. 필수 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성 (필요한 경우):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
```

### 3. 백엔드 준비

테스트를 위해 다음 중 하나를 수행하세요:

**옵션 A: Mock Data 사용 (개발/테스트)**
- 백엔드 없이 프론트엔드 테스트 가능
- `frontend/api/mock-data.ts`의 mock data 자동 사용

**옵션 B: 백엔드 실행**
- Python FastAPI 서버 실행: `cd ai-worker && python main.py`
- 또는 배포된 서버 사용

---

## ✅ 테스트 실행

### Unit Tests (단위 테스트)

개별 함수와 API 클라이언트 동작 검증

**실행 명령:**

```bash
# 전체 Unit Tests 실행
npm run test:unit

# 특정 테스트만 실행
npm run test -- __tests__/frontend/api/client.test.ts

# Watch 모드 (개발 중 자동 재실행)
npm run test:watch

# UI 대시보드로 보기
npm run test:ui

# 커버리지 리포트 생성
npm run test:coverage
```

**테스트 대상 및 내용:**

| 테스트 파일 | 검증 내용 | 테스트 수 |
|-----------|---------|--------|
| `__tests__/frontend/api/client.test.ts` | API 클라이언트, 에러 처리, Fallback 로직 | 19 |
| `__tests__/frontend/lib/domain.test.ts` | Haversine 거리 계산, 혼잡도 레벨 | 12 |
| `__tests__/frontend/lib/ui-state-cache.test.ts` | 로케일 저장, API 캐시 처리 | 11 |

**총 Unit 테스트: 42개**

---

### Integration Tests (통합 테스트)

API와 데이터 흐름의 통합 동작 검증

**실행 명령:**

```bash
# Integration Tests 실행
npm run test:integration

# Watch 모드
npm run test:watch -- __tests__/integration
```

**테스트 대상 및 내용:**

| 테스트 파일 | 검증 내용 | 테스트 수 |
|-----------|---------|--------|
| `__tests__/integration/api-integration.test.ts` | Places API 호출, Mock Fallback, 데이터 검증 | 10 |

**총 Integration 테스트: 10개**

---

### E2E Tests (엔드-투-엔드 테스트)

실제 사용자 시나리오 검증 (Playwright)

**사전 요구사항:**

1. 앱이 `http://localhost:3000`에서 실행 중이어야 합니다:

```bash
# Terminal 1: 개발 서버 시작
npm run dev
```

2. Playwright 브라우저 설치:

```bash
npx playwright install
```

**실행 명령:**

```bash
# 헤드리스 모드 (백그라운드 실행)
npm run test:e2e

# UI 대시보드 (상호작용형)
npm run test:e2e:ui

# 화면에서 보면서 실행 (디버깅용)
npm run test:e2e:headed

# 특정 테스트만 실행
npx playwright test __tests__/e2e/main.e2e.ts -g "홈"
```

**테스트 대상 및 범위:**

| 섹션 | 테스트 시나리오 | 테스트 수 |
|-----|--------------|--------|
| 홈 페이지 | 페이지 로드, 언어 변경, 내비게이션 | 4 |
| 지도 페이지 | 지도 렌더링, 필터링, 장소 상세, 저장 | 5 |
| SNS 분석 | 페이지 로드, 에러 처리 | 2 |
| 루트 페이지 | 정류장 추가, 순서 변경, 완료 표시 | 3 |
| 레이더 페이지 | 반경 조정, 시설 필터링 | 2 |
| 프로필 페이지 | 페이지 로드, 저장된 장소 | 2 |
| 성능 | 로딩 시간, 스크롤 성능 | 2 |
| 접근성 | 마크업, 네비게이션, 키보드 사용 | 3 |

**총 E2E 테스트: 23개**

---

## 📊 전체 테스트 실행

모든 테스트를 한번에 실행:

```bash
# Unit + Integration 테스트 (빠름, ~30초)
npm run test

# 전체 테스트 (Unit + Integration + E2E, ~5분)
npm run test:coverage && npm run test:e2e
```

---

## 🎯 테스트 시나리오

### Scenario 1: 새 기능 개발

```bash
# 1. 로컬에서 개발하면서 Watch 모드로 테스트 실행
npm run test:watch

# 2. 기능 구현 후 전체 테스트 실행
npm run test

# 3. E2E 테스트로 사용자 경험 확인
npm run dev  # Terminal 1
npm run test:e2e  # Terminal 2 (다른 터미널)
```

### Scenario 2: PR 제출 전 검증

```bash
# 1. 타입 체크
npm run type-check

# 2. Linting
npm run lint

# 3. 전체 테스트
npm run test

# 4. 빌드 검증
npm run build

# 5. E2E 테스트 (선택사항)
npm run test:e2e
```

### Scenario 3: Mock Data로 오프라인 개발

```bash
# 백엔드 없이 프론트엔드만 개발
npm run dev

# 브라우저에서 테스트
# → Mock data가 자동으로 사용됨
# → frontend/api/client.ts의 withFallback() 활성화
```

---

## 🔍 테스트 결과 확인

### Unit/Integration 테스트 결과

```bash
npm run test:coverage
```

생성되는 파일: `coverage/index.html` (브라우저에서 열기)

### E2E 테스트 결과

실패 시 자동으로 저장되는 파일:
- `test-results/e2e/` - HTML 리포트
- Screenshots: `test-results/e2e/` (실패 스크린샷)
- Traces: 디버깅용 상세 정보

**HTML 리포트 보기:**

```bash
# 기본 방식
open test-results/e2e/index.html

# PowerShell (Windows)
Start-Process test-results/e2e/index.html
```

---

## 🐛 테스트 디버깅

### Vitest 디버깅

**UI 대시보드로 디버깅:**

```bash
npm run test:ui
```

브라우저에서 자동으로 열리는 대시보드에서:
- 테스트 트리 확인
- 실패 내용 상세 보기
- 실시간 다시 실행

### Playwright 디버깅

**Playwright Inspector로 디버깅:**

```bash
npx playwright test --debug
```

**특정 테스트 실행 + 디버깅:**

```bash
npx playwright test __tests__/e2e/main.e2e.ts -g "홈" --debug
```

**터레이 트레이스 보기:**

```bash
npx playwright show-trace test-results/e2e/traces/trace.zip
```

---

## ✨ Mock Data 구조

### 사용 가능한 Mock 객체

`frontend/api/mock-data.ts`에 정의된 Mock data:

```typescript
// 장소 목록
MOCK_PLACES: Place[]

// 장소 상세
MOCK_PLACE_DETAIL: PlaceDetail

// 편의시설
MOCK_FACILITIES: Facility[]

// 분석 결과
MOCK_ANALYSIS_RESULT: AnalysisResult

// 루트
MOCK_ROUTES: Route[]

// 페르소나 테마
MOCK_PERSONA_THEMES: PersonaTheme[]
```

### Mock Data로 테스트하기

```typescript
// 방법 1: requestJson의 fallbackData 사용
const result = await requestJson('/api/places', {}, MOCK_PLACES);

// 방법 2: withFallback 래퍼 사용
const result = await withFallback(
  () => fetchPlaces(params),
  MOCK_PLACES
);
```

---

## 📝 테스트 작성 가이드

### Unit Test 예시

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/domain';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Integration Test 예시

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchPlaces } from '@/frontend/api/places';

describe('Places API Integration', () => {
  it('should fetch places', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ places: [] }),
      } as Response),
    );

    const result = await fetchPlaces(params);
    expect(result.places).toBeDefined();
  });
});
```

### E2E Test 예시

```typescript
import { test, expect } from '@playwright/test';

test.describe('Map Page', () => {
  test('should load map', async ({ page }) => {
    await page.goto('/ko/map');
    
    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toBeVisible();
  });
});
```

---

## ⚙️ CI/CD 통합

### GitHub Actions 예시

`.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## 📚 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Playwright 공식 문서](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [K-Vibe 프로젝트 구조](./README.md)

---

## 🆘 일반적인 문제 해결

| 문제 | 해결 방법 |
|-----|---------|
| `Cannot find module '@/...'` | vitest.config.ts의 alias 확인 |
| E2E 테스트 실패 | `npm run dev` 실행 중 확인, 포트 3000 확인 |
| Mock data가 로드되지 않음 | `frontend/api/client.ts`의 withFallback 설정 확인 |
| 테스트 타임아웃 | playwright.config.ts의 timeout 값 증가 |
| localStorage 에러 | jsdom 환경 설정 확인 (vitest.config.ts) |

---

## 📞 문의 및 피드백

테스트 관련 질문이나 개선 사항은 프로젝트 Issue를 통해 공유해주세요.
