# 📋 테스트 체크리스트 및 검증 절차

## ✅ 작업 완료 사항

### 1. 테스트 파일 생성 ✓

| 파일 | 설명 | 테스트 수 |
|-----|------|---------|
| `__tests__/frontend/api/client.test.ts` | API 클라이언트 테스트 | 19 |
| `__tests__/frontend/lib/domain.test.ts` | Domain 유틸리티 테스트 | 12 |
| `__tests__/frontend/lib/ui-state-cache.test.ts` | UI 상태 및 캐시 테스트 | 11 |
| `__tests__/integration/api-integration.test.ts` | API 통합 테스트 | 10 |
| `__tests__/e2e/main.e2e.ts` | E2E 사용자 여정 테스트 | 23 |

**총 테스트: 75개**

### 2. 테스트 설정 파일 생성 ✓

- `vitest.config.ts` - Vitest 설정 (jsdom 환경)
- `playwright.config.ts` - Playwright 설정 (브라우저 테스트)
- `TESTING.md` - 테스트 절차 가이드

### 3. 패키지 업데이트 ✓

- `package.json` - 테스트 스크립트 추가
- devDependencies:
  - `@playwright/test@^1.45.1`
  - `@vitejs/plugin-react@^4.2.1`
  - `@vitest/ui@^4.1.8`
  - `jsdom@^24.0.0`

### 4. Git 설정 업데이트 ✓

- `.gitignore` - 테스트 결과 디렉토리 추가

---

## 🎯 테스트 실행 명령어

### Unit & Integration 테스트

```bash
# 전체 테스트 실행
npm run test

# Watch 모드 (개발 중)
npm run test:watch

# UI 대시보드
npm run test:ui

# 커버리지 리포트
npm run test:coverage

# 특정 테스트만 실행
npm run test -- __tests__/frontend/api/client.test.ts
```

### E2E 테스트

```bash
# 헤드리스 모드
npm run test:e2e

# UI 모드 (상호작용형)
npm run test:e2e:ui

# 화면에서 보면서 실행
npm run test:e2e:headed

# 특정 테스트만
npx playwright test __tests__/e2e/main.e2e.ts -g "홈"
```

---

## 📊 테스트 커버리지 목표

| 범주 | 목표 | 상태 |
|-----|------|------|
| API 클라이언트 | 100% | ✅ 19 테스트 |
| Domain 유틸리티 | 90%+ | ✅ 12 테스트 |
| UI 상태/캐시 | 85%+ | ✅ 11 테스트 |
| API 통합 | 80%+ | ✅ 10 테스트 |
| 사용자 시나리오 | 메인 플로우 | ✅ 23 E2E 테스트 |

---

## 🔍 검증 절차

### Phase 1: 로컬 검증 (개발자용)

```bash
# 1. 타입 체크
npm run type-check

# 2. Linting
npm run lint

# 3. Unit & Integration 테스트
npm run test

# 4. 빌드
npm run build
```

### Phase 2: E2E 검증 (QA/배포 전)

```bash
# 1. 개발 서버 시작
npm run dev  # Terminal 1

# 2. E2E 테스트 실행 (다른 터미널)
npm run test:e2e

# 3. 결과 확인
# test-results/e2e/index.html 확인
```

### Phase 3: 전체 검증 (배포 전)

```bash
# 1. 모든 검사 실행
npm run type-check && npm run lint && npm run test && npm run build

# 2. E2E 테스트 실행
npm run test:e2e

# 3. 커버리지 리포트 확인
npm run test:coverage
# coverage/index.html 확인
```

---

## 🧪 테스트 대상 기능

### ✅ 구현됨

#### API & Mock 테스트
- [x] API 요청 성공/실패 처리
- [x] Mock fallback 활성화
- [x] 에러 타입별 처리
- [x] 요청 취소 (AbortSignal)
- [x] 데이터 유효성 검증

#### Domain 로직 테스트
- [x] Haversine 거리 계산
- [x] 혼잡도 레벨 판정
- [x] 로케일 저장/읽기
- [x] API 캐시 TTL 관리

#### 통합 테스트
- [x] Places API 전체 플로우
- [x] Mock 데이터 폴백
- [x] 에러 복구 시나리오
- [x] 연속 실패 처리

#### E2E 테스트
- [x] 홈 페이지 로드 및 네비게이션
- [x] 지도 페이지 필터링/상세보기
- [x] SNS 분석 페이지
- [x] 루트 페이지 (추가/순서변경/완료)
- [x] 레이더 페이지 (반경/필터)
- [x] 프로필 페이지
- [x] 성능 검증
- [x] 접근성 검증

---

## 📝 테스트 코드 예시

### Unit Test 패턴

```typescript
describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    const distance = calculateDistance(
      { lat: 37.5665, lng: 126.978 },
      { lat: 37.5796, lng: 126.977 }
    );
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(2);
  });
});
```

### Integration Test 패턴

```typescript
describe('Places API Integration', () => {
  it('should fetch places with correct parameters', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    );
    
    const result = await fetchPlaces(params);
    expect(result.places).toBeDefined();
  });
});
```

### E2E Test 패턴

```typescript
test('should load map page', async ({ page }) => {
  await page.goto('/ko/map');
  
  const mapContainer = page.locator('[data-testid="map-container"]');
  await expect(mapContainer).toBeVisible();
});
```

---

## 🐛 일반적인 문제 해결

| 문제 | 원인 | 해결책 |
|-----|------|-------|
| `Cannot find module '@/...'` | 경로 별칭 설정 오류 | vitest.config.ts의 alias 확인 |
| E2E 타임아웃 | 서버 미실행 | `npm run dev` 실행 확인 |
| localStorage 에러 | Node.js 환경 | jsdom 설정 확인 |
| Mock 데이터 미로드 | Fallback 미활성화 | client.ts의 withFallback 사용 |

---

## 📚 추가 리소스

- 테스트 실행 가이드: `TESTING.md`
- Vitest 공식 문서: https://vitest.dev/
- Playwright 공식 문서: https://playwright.dev/
- Mock 데이터: `frontend/api/mock-data.ts`
- 타입 정의: `types/api.ts`, `types/domain.ts`

---

## 🚀 배포 전 체크리스트

- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] E2E 테스트 통과 (`npm run test:e2e`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] Linting 통과 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 커버리지 80% 이상
- [ ] 성능 테스트 통과 (로딩 < 3초)
- [ ] 접근성 검증 통과
