# 📍 Import Path 마이그레이션 가이드

## 🎯 개요
`Option A (즉시 마이그레이션)`를 선택하여 모든 import 경로를 새로운 구조로 일괄 업데이트합니다.

## 📊 마이그레이션 맵

### 1. **lib 폴더 재구성**
기존 구조:
```
lib/
├── haversine.ts           → 도메인 로직
├── parseLocation.ts       → 파싱 유틸
├── crowd.ts               → 도메인 로직
├── facilities.ts          → 도메인 로직
└── ...
```

새로운 구조:
```
lib/
├── domain/                 # 비즈니스 로직
│   ├── haversine.ts       # 거리 계산
│   ├── crowd.ts           # 혼잡도 분석
│   ├── facilities.ts      # 시설 관리
│   └── index.ts
├── cache/                  # API 캐싱
│   ├── memory.ts
│   ├── storage.ts
│   └── index.ts
├── ui-state/               # UI 상태 관리
│   ├── map-state.ts
│   ├── filter-state.ts
│   └── index.ts
├── features/               # 기능 유틸
│   ├── analytics.ts
│   ├── sharing.ts
│   └── index.ts
└── i18n/                   # 다국어
    ├── translations.ts
    └── index.ts
```

### 2. **마이그레이션 매핑 테이블**

| 기존 경로 | 새로운 경로 | 파일 위치 | 사유 |
|---------|-----------|---------|------|
| `lib/haversine` | `lib/domain` | `lib/domain/haversine.ts` | 비즈니스 로직 |
| `lib/parseLocation` | `lib/domain` | `lib/domain/location.ts` | 비즈니스 로직 |
| `lib/crowd` | `lib/domain` | `lib/domain/crowd.ts` | 비즈니스 로직 |
| `lib/facilities` | `lib/domain` | `lib/domain/facilities.ts` | 도메인 유틸 |
| `lib/cache` | `lib/cache` | `lib/cache/memory.ts` | 캐싱 로직 |
| `frontend/api/cache` | `lib/cache` | `lib/cache/storage.ts` | API 캐싱 |
| `frontend/hooks/useMapState` | `lib/ui-state` | `lib/ui-state/map-state.ts` | UI 상태 |
| `frontend/utils/analytics` | `lib/features` | `lib/features/analytics.ts` | 기능 유틸 |
| `frontend/i18n` | `lib/i18n` | `lib/i18n/translations.ts` | 다국어 |

### 3. **코드 예시**

#### 마이그레이션 전
```typescript
// 산재된 import
import { haversine } from '../lib/haversine';
import { parseCrowd } from '../lib/crowd';
import { getFacilities } from '../lib/facilities';
import { useMapState } from '../frontend/hooks/useMapState';
import { trackEvent } from '../frontend/utils/analytics';
import { t } from '../frontend/i18n';
```

#### 마이그레이션 후
```typescript
// 체계적인 import
import type { Place } from '@/types/domain';
import { haversine, parseCrowd, getFacilities } from '@/lib/domain';
import { useMapState } from '@/lib/ui-state';
import { trackEvent } from '@/lib/features';
import { t } from '@/lib/i18n';
```

---

## 🔧 마이그레이션 프로세스

### Step 1: 현재 상태 분석
```bash
# 1. 기존 import 경로 모두 찾기
grep -r "from ['\"]\.\./" . --include="*.ts" --include="*.tsx" | wc -l

# 2. 각 패턴별 개수 확인
grep -r "from ['\"].*lib/" . --include="*.ts" --include="*.tsx" | head -20
```

### Step 2: 자동 마이그레이션 (70% 자동화)
```bash
# 위치 이동: lib 폴더 파일들을 하위 폴더로 정렬
mv lib/haversine.ts lib/domain/haversine.ts
mv lib/crowd.ts lib/domain/crowd.ts
# ... (자세한 내용은 아래의 마이그레이션 스크립트 참고)
```

### Step 3: Import 경로 업데이트

#### 방법 1: 자동 sed 명령어 (Linux/Mac)
```bash
# domain 폴더 imports 업데이트
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's/from ['\''\"]\.\.\?\/?lib\/haversine/from "@\/lib\/domain/g'

find . -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's/from ['\''\"]\.\.\?\/?lib\/crowd/from "@\/lib\/domain/g'

# 기타 폴더들...
```

#### 방법 2: Node.js 스크립트 (플랫폼 무관)
```javascript
// scripts/migrate-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const MIGRATIONS = [
  { old: /from\s+['"]\.\.?\/lib\/haversine['"]/, new: 'from "@/lib/domain"' },
  { old: /from\s+['"]\.\.?\/lib\/crowd['"]/, new: 'from "@/lib/domain"' },
  { old: /from\s+['"]\.\.?\/lib\/facilities['"]/, new: 'from "@/lib/domain"' },
  // ... 더 많은 매핑
];

glob('**/*.{ts,tsx}', { ignore: 'node_modules/**' }, (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    MIGRATIONS.forEach(({ old, new: newPath }) => {
      content = content.replace(old, newPath);
    });
    fs.writeFileSync(file, content, 'utf-8');
  });
});
```

### Step 4: 검증
```bash
# Type check
npm run type-check

# Build 확인
npm run build

# Tests 실행
npm run test

# E2E 테스트
npm run test:e2e
```

### Step 5: Git commit
```bash
git add -A
git commit -m "refactor: reorganize lib folder structure and update import paths

- Move domain logic to lib/domain (haversine, crowd, facilities)
- Move UI state to lib/ui-state (map-state, filter-state)
- Move caching to lib/cache (memory, storage)
- Move features to lib/features (analytics, sharing)
- Move i18n to lib/i18n (translations)
- Update all imports to use @/ alias
- Add index.ts exports for better code organization

BREAKING CHANGE: Import paths have changed
- Old: import { haversine } from 'lib/haversine'
- New: import { haversine } from '@/lib/domain'

Closes #ABC"
```

---

## 🚨 주의사항

### 1. 상대 경로 vs 절대 경로
- ❌ 과거: `import { x } from '../lib/module'`
- ✅ 현재: `import { x } from '@/lib/domain'`

### 2. 동적 import
```typescript
// 수정 필요
const module = await import('@/lib/domain');
```

### 3. Next.js API Routes
```typescript
// API 라우트에서 import
import { haversine } from '@/lib/domain';

export default function handler(req, res) {
  // ...
}
```

### 4. Test 파일
```typescript
// __tests__/lib/domain/haversine.test.ts
import { haversine } from '@/lib/domain';

describe('haversine', () => {
  it('should calculate distance', () => {
    // ...
  });
});
```

---

## 📋 마이그레이션 체크리스트

### 파일 이동
- [ ] `lib/haversine.ts` → `lib/domain/haversine.ts`
- [ ] `lib/crowd.ts` → `lib/domain/crowd.ts`
- [ ] `lib/facilities.ts` → `lib/domain/facilities.ts`
- [ ] `lib/parseLocation.ts` → `lib/domain/location.ts`
- [ ] 기타 lib 파일들 정렬

### index.ts 생성
- [ ] `lib/domain/index.ts` 생성 (모든 domain 모듈 export)
- [ ] `lib/cache/index.ts` 생성
- [ ] `lib/ui-state/index.ts` 생성
- [ ] `lib/features/index.ts` 생성
- [ ] `lib/i18n/index.ts` 생성

### Import 경로 업데이트
- [ ] app/ 폴더의 모든 import 경로
- [ ] components/ 폴더의 모든 import 경로
- [ ] frontend/ 폴더의 모든 import 경로 (있다면)
- [ ] __tests__/ 폴더의 모든 import 경로
- [ ] pages/api 폴더의 모든 import 경로

### 검증
- [ ] `npm run type-check` 통과 ✅
- [ ] `npm run lint` 통과 ✅
- [ ] `npm run build` 성공 ✅
- [ ] `npm run test` 통과 ✅
- [ ] `npm run test:e2e` 통과 ✅

---

## 🔙 롤백 방법

마이그레이션 중 문제가 발생하면:

```bash
# 1. 마지막 커밋 전 상태로 돌아가기
git reset --hard HEAD~1

# 2. 특정 파일만 롤백
git checkout HEAD~1 -- lib/

# 3. Stash 사용 (커밋 전)
git stash
git stash drop
```

---

## 📚 참고 자료

- **Next.js Path Aliases**: https://nextjs.org/docs/app/building-your-application/configuring/typescript#path-aliases
- **Import Ordering**: https://eslint.org/docs/rules/sort-imports
- **Module Patterns**: https://github.com/goldbergyoni/nodebestpractices#6-project-structure-practices

---

## ❓ FAQ

### Q: import alias가 제대로 작동하지 않음
**A:** tsconfig.json의 paths 설정을 확인하세요:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Q: 다른 브랜치에서 conflict 발생
**A:** 다른 팀원이 작업 중인 경우 사전에 공지하세요. Git merge conflict를 수동으로 해결해야 합니다.

### Q: 부분 마이그레이션은 가능?
**A:** Option A는 전체 마이그레이션입니다. 단계별로 진행하려면 Option B/C를 선택하세요.
