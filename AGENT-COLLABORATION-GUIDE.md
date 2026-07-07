# 🤖 에이전트 협업 가이드

K-Vibe Tracker 프로젝트에서 GitHub Copilot 에이전트를 활용하여 효율적으로 협업하는 방법입니다.

## 📚 개요

이 가이드는 팀원들이 에이전트를 통해:
- 기존 작업을 이어받기
- 일관된 코드 스타일 유지하기
- 자동화된 검증 절차 따르기
- 구조화된 커밋 메시지 작성하기

를 수행할 수 있도록 돕습니다.

---

## 🚀 에이전트 활용 워크플로우

### Phase 1: 작업 시작 (에이전트 호출)

새로운 기능이나 버그 수정을 시작할 때:

```bash
# 1. 최신 코드로 업데이트
git pull origin hslee

# 2. 작업 요청 준비 (prompt 작성)
# 아래 형식으로 에이전트에 요청
```

**에이전트에 전달할 기본 정보:**

```markdown
## 작업 요청 템플릿

### 📋 작업 제목
[기능명 또는 버그명]

### 🎯 작업 목표
[무엇을 하려고 하는가]

### 📌 참고 정보
- 관련 파일: [파일 경로 목록]
- 참고할 문서: [관련 문서 링크]
- 유사한 구현: [참고할 기존 코드]

### ⚠️ 제약사항
- [주의사항들]

### ✅ 완료 조건
- [ ] 테스트 작성/통과
- [ ] 타입 체크 통과
- [ ] Lint 통과
- [ ] 커밋/푸시 완료
```

### Phase 2: 에이전트 작업 진행

에이전트는 다음 절차를 따릅니다:

#### Step 1: 프로젝트 이해
```
✅ 현재 구조 파악 (README.md, 프로젝트 구조)
✅ 관련 파일 분석 (타입, 컴포넌트, 유틸리티)
✅ 기존 패턴 학습 (코드 스타일, 테스트 패턴)
```

#### Step 2: 구현
```
✅ 기존 코드 리뷰
✅ 타입 정의 (types/ 활용)
✅ 구현 코드 작성
✅ 테스트 코드 작성
```

#### Step 3: 검증
```
✅ 타입 체크 (npm run type-check)
✅ Lint (npm run lint)
✅ 테스트 (npm run test)
✅ 빌드 (npm run build)
```

#### Step 4: 커밋 & 푸시
```
✅ 의미 있는 커밋 메시지 작성
✅ Copilot Co-authored-by 트레일러 추가
✅ GitHub에 푸시
```

---

## 🎨 코드 스타일 & 패턴

### 프로젝트 표준

**TypeScript 타입:**
```typescript
// ✅ Good: 명확한 타입
type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

// ❌ Bad: any/unknown 사용
type Place = any;
```

**API 호출 패턴:**
```typescript
// ✅ Good: Mock fallback 활용
const result = await withFallback(
  () => fetchPlaces(params),
  MOCK_PLACES
);

// ❌ Bad: 에러 처리 없음
const result = await fetchPlaces(params);
```

**테스트 패턴:**
```typescript
// ✅ Good: 명확한 설명과 여러 케이스
describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    const distance = calculateDistance(
      { lat: 37.5665, lng: 126.978 },
      { lat: 37.5796, lng: 126.977 }
    );
    expect(distance).toBeGreaterThan(1);
  });
});

// ❌ Bad: 모호한 설명
describe('distance', () => {
  it('works', () => {
    // ...
  });
});
```

**라이브러리 import:**
```typescript
// ✅ Good: 중앙 index.ts 활용
import { calculateDistance } from '@/lib/features';
import { toCrowdLevel } from '@/lib/domain';

// ❌ Bad: 직접 파일 import
import { calculateDistance } from '@/lib/features/haversine';
```

**컴포넌트 data-testid:**
```typescript
// ✅ Good: E2E 테스트 지원
<button data-testid="save-place-btn">저장</button>

// ❌ Bad: data-testid 없음
<button>저장</button>
```

---

## 📝 커밋 메시지 규칙

### 형식

```
<type>: <subject>

<body>

<footer>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | feat: Add place search filtering |
| `fix` | 버그 수정 | fix: Handle null coordinates in map |
| `refactor` | 코드 구조 개선 | refactor: Extract place card component |
| `test` | 테스트 추가/수정 | test: Add E2E tests for map page |
| `docs` | 문서 작성/수정 | docs: Update TESTING.md |
| `perf` | 성능 개선 | perf: Memoize distance calculations |
| `chore` | 패키지, CI/CD 등 | chore: Update dependencies |

### 예시

```
feat: Add place filtering by category

**Changes:**
- Created CategoryFilter component
- Added filter state to map page
- Implemented API parameter handling

**Tests:**
- Added 4 unit tests for filter logic
- Added 2 E2E tests for user interaction

**Related:**
- Closes #123
- Related to #456

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## 🔄 Import Path 마이그레이션 체크리스트

Lib 폴더 재구조화 후 import 경로를 업데이트할 때 사용:

```typescript
// ✅ 올바른 경로 (재구조화 후)

// cache 폴더
import { readLocalApiCache, writeLocalApiCache } from '@/lib/cache';

// domain 폴더
import { toCrowdLevel, CROWD_DOT_CLASS } from '@/lib/domain';
import { tourApiRequest } from '@/lib/domain';
import { calculateRouteMeta } from '@/lib/domain';

// ui-state 폴더
import { persistPreferredLocale, readPreferredLocale } from '@/lib/ui-state';

// features 폴더
import { calculateDistance } from '@/lib/features';
import { savePlaceToDevice } from '@/lib/features';
import { sharePlace } from '@/lib/features';

// i18n 폴더
import { getUiCopy } from '@/lib/i18n';

// ❌ 잘못된 경로 (재구조화 전)
import { calculateDistance } from '@/lib/haversine';
import { toCrowdLevel } from '@/lib/crowd';
```

---

## 🧪 테스트 작성 가이드

### 각 레벨별 테스트 작성 시기

| 레벨 | 작성 시기 | 예시 |
|------|---------|------|
| Unit | 새 유틸 함수 작성 후 | `calculateDistance` 함수 테스트 |
| Integration | API 호출 로직 후 | `fetchPlaces` + cache 테스트 |
| E2E | 사용자 흐름 구현 후 | 지도 → 상세 → 저장 플로우 |

### 테스트 파일 위치

```
새 기능별 파일 → 테스트 파일 위치

util 함수      → __tests__/frontend/lib/
API 호출        → __tests__/frontend/api/
복합 기능       → __tests__/integration/
사용자 흐름    → __tests__/e2e/
```

### 테스트 작성 예시

```typescript
// __tests__/frontend/lib/my-utility.test.ts
import { describe, it, expect } from 'vitest';
import { myUtility } from '@/lib/features';

describe('myUtility', () => {
  describe('basic functionality', () => {
    it('should return expected result for valid input', () => {
      const result = myUtility('input');
      expect(result).toEqual('expected');
    });

    it('should handle edge cases', () => {
      expect(myUtility('')).toEqual('default');
      expect(myUtility(null)).toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw for invalid input', () => {
      expect(() => myUtility(undefined)).toThrow();
    });
  });
});
```

---

## 📋 작업 체크리스트

매 작업마다 다음을 확인하세요:

### 코딩
- [ ] TypeScript strict 모드 준수 (any 사용 금지)
- [ ] 기존 패턴 따르기 (lib, types, components 구조)
- [ ] Mock fallback 고려 (API 호출 시)
- [ ] Error handling 포함
- [ ] JSDoc 주석 추가

### 테스트
- [ ] Unit tests 작성 (새 함수/유틸)
- [ ] Integration tests 작성 (API 플로우)
- [ ] E2E tests 작성 (사용자 상호작용)
- [ ] `npm run test` 통과
- [ ] 80%+ 커버리지 (목표)

### 검증
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 타입 에러 0개
- [ ] Lint 에러 0개

### 커밋
- [ ] 의미 있는 커밋 메시지 작성
- [ ] 관련 이슈 참조
- [ ] Co-authored-by 트레일러 포함
- [ ] `git push origin hslee` 완료

---

## 🆘 트러블슈팅

### 문제: Import 경로 에러

```
Module not found: '@/lib/haversine'
```

**해결:**
1. 파일이 `lib/features/` 폴더로 이동됨 확인
2. `import { ... } from '@/lib/features'` 로 수정
3. AGENT-COLLABORATION-GUIDE.md 의 "Import Path 마이그레이션" 확인

### 문제: 타입 에러

```
Property 'id' does not exist on type 'unknown'
```

**해결:**
1. `types/domain.ts` 또는 `types/api.ts` 에서 적절한 타입 찾기
2. `import type { Place } from '@/types'` 로 import
3. 변수에 타입 지정: `const place: Place = ...`

### 문제: 테스트 실패

```
FAIL __tests__/frontend/api/client.test.ts
```

**해결:**
1. `npm run test -- __tests__/frontend/api/client.test.ts` 로 상세 로그 확인
2. Mock 설정 확인 (vi.fn 호출)
3. `npm run test:ui` 로 비주얼 디버깅

### 문제: 빌드 실패

```
npm run build 실패
```

**해결:**
1. `npm run type-check` 로 타입 에러 먼저 확인
2. `npm run lint` 로 lint 에러 확인
3. node_modules 재설치: `rm -rf node_modules && npm install`

---

## 📞 에이전트에 요청하는 방법

### 템플릿 1: 새 기능 추가

```markdown
## Feature Request

### 기능명
[예: Place List Pagination]

### 설명
[사용자가 어떤 이득을 얻는가]

### 구현 범위
- [ ] API 엔드포인트 확인/추가
- [ ] 프론트 타입 정의
- [ ] 컴포넌트 구현
- [ ] 유닛 테스트
- [ ] E2E 테스트

### 참고
- 관련 파일: app/[locale]/map/page.tsx
- 유사 구현: PLACE_DETAIL_MODAL
- Mock 데이터: frontend/api/mock-data.ts

이 작업을 진행해주고, 완료 시 모든 테스트와 타입 체크를 통과해야 합니다.
```

### 템플릿 2: 버그 수정

```markdown
## Bug Report

### 버그 설명
[사용자가 경험하는 문제]

### 재현 방법
1. [Step 1]
2. [Step 2]
3. [Expected vs Actual]

### 영향받는 파일
- components/map/...
- lib/domain/...

### 해결 접근법
[선택사항 - 아이디어가 있으면 제시]

이 버그를 수정해주고, 테스트를 작성해서 재발 방지해주세요.
```

### 템플릿 3: 코드 리뷰/리팩토링

```markdown
## Refactoring Request

### 현황
[현재 코드의 상태, 문제점]

### 목표
[개선 후 원하는 상태]

### 파일 목록
- [파일1]
- [파일2]

이 코드들을 리팩토링해주고, 모든 테스트가 여전히 통과하는지 확인해주세요.
```

---

## 📚 주요 문서

작업 시 참고해야 할 문서들:

| 문서 | 용도 |
|------|------|
| `README.md` | 프로젝트 개요, 구조 |
| `TESTING.md` | 테스트 실행 방법 |
| `TEST-CHECKLIST.md` | 테스트 검증 항목 |
| `types/domain.ts` | 데이터 타입 정의 |
| `types/api.ts` | API 계약 타입 |
| `frontend/api/client.ts` | API 호출 패턴 |
| `frontend/api/mock-data.ts` | Mock 데이터 |

---

## 🔄 작업 흐름 다이어그램

```
┌─────────────────┐
│  작업 요청 제시 │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  에이전트 작업 시작  │
├──────────────────────┤
│ 1. 코드 분석         │
│ 2. 구현              │
│ 3. 테스트 작성       │
│ 4. 검증 (type/lint)  │
│ 5. 커밋/푸시         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  작업 완료 리뷰      │
├──────────────────────┤
│ • 테스트 통과 확인   │
│ • 커밋 메시지 확인   │
│ • 문서 업데이트 확인 │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  PR/Merge (선택사항) │
└──────────────────────┘
```

---

## 📈 효율성 팁

### 1. 명확한 요청 작성
```
❌ "지도에 뭔가 추가해줄래?"
✅ "지도 필터링 기능을 추가해주세요. 
   카테고리별로 장소를 필터링할 수 있게 하고,
   components/map/CategoryFilter.tsx 컴포넌트를 참고해주세요."
```

### 2. 필요한 정보 포함
- 관련 파일 경로
- 참고할 기존 코드
- 구현 범위 (API, 타입, 컴포넌트, 테스트)
- 완료 조건

### 3. 반복적 리뷰 활용
대규모 작업은 여러 단계로 나누기:
1. "타입 정의만 먼저 작성해주세요"
2. "이제 컴포넌트를 구현해주세요"
3. "테스트 코드를 작성해주세요"

---

## 💡 Best Practices

### DO ✅
- 작업 전 최신 코드 pull
- 명확한 task 설명 제시
- 에러 메시지 전체 복사
- 테스트 결과 확인
- 커밋/푸시 완료 확인

### DON'T ❌
- 모호한 요청 ("고쳐줘")
- 복잡한 다중 작업 한번에 요청
- 테스트 생략
- 타입체크 무시
- 임의로 파일 구조 변경

---

## 📞 지원

질문이나 이슈가 있으면:
1. 이 가이드의 "트러블슈팅" 섹션 확인
2. `TESTING.md` 또는 관련 문서 확인
3. GitHub Issues 에서 유사 케이스 검색
4. 팀에 슬랙/디스코드로 질문
