# 🚀 Phase 1 Implementation Guide: Import Path Migration

## 📋 Phase 1 목표
- ✅ 모든 import 경로를 새로운 lib 구조에 맞게 업데이트 (107개 import 문)
- ✅ 타입 체크 및 린트 통과
- ✅ 기존 테스트 모두 통과
- ✅ 빌드 성공
- ✅ Git에 phase별 커밋

---

## ⚡ 빠른 시작 (5분)

### 1단계: 마이그레이션 스크립트 실행
```bash
# 프로젝트 루트에서 실행
node scripts/migrate-imports.js
```

**스크립트가 하는 일:**
- ✅ 모든 TypeScript/JavaScript 파일 스캔
- ✅ import 경로 자동 업데이트 (20개 마이그레이션)
- ✅ 각 Phase 후 타입 체크 실행
- ✅ 각 Phase마다 git commit 생성
- ✅ 최종 검증 (lint + type-check)

### 2단계: 변경 사항 확인
```bash
# Phase별 커밋 확인
git log --oneline -10

# 변경된 파일 목록
git diff HEAD~5..HEAD --name-only
```

### 3단계: 최종 검증
```bash
# 타입 체크
npm run type-check

# 린트
npm run lint

# 빌드
npm run build

# 테스트
npm run test
```

---

## 📊 마이그레이션 계획 (8 Phases)

### Phase 1️⃣: Domain Models (Foundation Layer)
**목표:** 비즈니스 로직 layer 마이그레이션
**마이그레이션 경로:**
- `@/lib/haversine` → `@/lib/features`
- `@/lib/crowd` → `@/lib/domain`
- `@/lib/youtube` → `@/lib/domain`
- `@/lib/analysis` → `@/lib/domain`
- `@/lib/docent` → `@/lib/domain`
- `@/lib/tourapi` → `@/lib/domain`
- `@/lib/routes` → `@/lib/domain`
- `@/lib/facilities` → `@/lib/domain`

**파일 수:** 45개 import
**크리티컬 의존성:** 6개 (lib/domain/*.ts 내부 교차 참조)
**예상 시간:** 5-10분 (자동화)

### Phase 2️⃣: Cache Layer
**목표:** API 캐싱 layer 통합
**마이그레이션 경로:**
- `@/lib/local-api-cache` → `@/lib/cache`
- `@/lib/location-cache` → `@/lib/cache`

**파일 수:** 9개 import
**예상 시간:** 2-5분

### Phase 3️⃣: UI State
**목표:** UI 상태 관리 layer 통합
**마이그레이션 경로:**
- `@/lib/radar-radius` → `@/lib/ui-state`
- `@/lib/view-mode` → `@/lib/ui-state`
- `@/lib/persona-preference` → `@/lib/ui-state`

**파일 수:** 15개 import
**예상 시간:** 3-5분

### Phase 4️⃣: Internationalization
**목표:** 다국어 지원 layer 통합
**마이그레이션 경로:**
- `@/lib/ui-copy` → `@/lib/i18n`

**파일 수:** 20개 import
**예상 시간:** 3-5분

### Phase 5️⃣: Features Layer
**목표:** 기능 유틸리티 layer 통합
**마이그레이션 경로:**
- `@/lib/place-detail-share` → `@/lib/features`
- `@/lib/place-images` → `@/lib/features`
- `@/lib/place-social-proof` → `@/lib/features`
- `@/lib/saved-places` → `@/lib/features`
- `@/lib/map-pin-accessibility` → `@/lib/features`

**파일 수:** 12개 import
**예상 시간:** 3-5분

### Phase 6️⃣: API & Backend Layer (수동)
**목표:** 프론트엔드/백엔드 API layer 마이그레이션
**영향 파일:**
- frontend/api/analyze.ts
- frontend/api/facilities.ts
- frontend/api/routes.ts
- backend/presentation_api/*.ts

**파일 수:** 3-5개
**예상 시간:** 10-15분

### Phase 7️⃣: Pages & Components (수동)
**목표:** 남은 페이지와 컴포넌트 마이그레이션
**영향 파일:**
- app/[locale]/*.tsx (모든 페이지)
- components/**/*.tsx (모든 컴포넌트)

**파일 수:** 17-20개
**예상 시간:** 15-20분

### Phase 8️⃣: Tests (수동)
**목표:** 모든 테스트 파일 마이그레이션
**영향 파일:**
- __tests__/**/*.ts
- __tests__/**/*.tsx

**파일 수:** 19개
**예상 시간:** 10-15분

---

## 🔍 상세 실행 가이드

### Step 1: 현재 상태 백업
```bash
# 1. 현재 브랜치 확인
git branch -v

# 2. 새로운 브랜치 생성
git checkout -b feat/phase1-import-migration

# 3. 커밋 전 상태 저장
git stash  # (필요한 경우)
```

### Step 2: 마이그레이션 실행
```bash
# 1. 마이그레이션 스크립트 실행
node scripts/migrate-imports.js

# 2. 스크립트가 자동으로:
#    - Phase 1-5 마이그레이션 수행 (자동화)
#    - 각 Phase마다 타입 체크 실행
#    - 각 Phase마다 git commit 생성
```

### Step 3: 결과 검증
```bash
# 1. Git 히스토리 확인
git log --oneline -10

# 2. Phase별 커밋 메시지 확인
git show HEAD --stat
git show HEAD~1 --stat

# 3. 변경 파일 목록
git diff --name-only HEAD~5..HEAD | wc -l

# 4. 어떤 파일들이 변경되었는지
git diff --name-only HEAD~5..HEAD
```

### Step 4: 최종 검증
```bash
# 1. 타입 체크 (Phase 5 후 이미 실행됨)
npm run type-check

# 2. 린트
npm run lint

# 3. 빌드
npm run build

# 4. 단위 테스트
npm run test

# 5. E2E 테스트 (선택사항)
npm run test:e2e
```

### Step 5: Push 및 PR 생성
```bash
# 1. 변경사항 push
git push -u origin feat/phase1-import-migration

# 2. GitHub PR 생성
gh pr create \
  --title "Phase 1: Migrate lib import paths" \
  --body "Refactor: Reorganize lib folder and update all 107 import statements" \
  --base main

# 3. PR 상태 확인
gh pr view
```

---

## 🛡️ 트러블슈팅

### 문제 1: 마이그레이션 스크립트 실패
```bash
# 현상: node scripts/migrate-imports.js 실행 시 에러

# 해결방법:
# 1. Node.js 버전 확인
node --version  # v14 이상 필요

# 2. 스크립트 권한 설정
chmod +x scripts/migrate-imports.js

# 3. 직접 실행
node scripts/migrate-imports.js --verbose
```

### 문제 2: 타입 체크 실패
```bash
# 현상: "cannot find module '@/lib/domain'" 에러

# 해결방법:
# 1. tsconfig.json 확인
cat tsconfig.json | grep -A 5 paths

# 2. 해당 디렉토리 생성 확인
ls -la lib/domain/
ls -la lib/cache/
# ... 기타

# 3. index.ts 생성 확인
cat lib/domain/index.ts
cat lib/cache/index.ts
```

### 문제 3: Git Commit 실패
```bash
# 현상: "git commit failed" 에러

# 해결방법:
# 1. Git 상태 확인
git status

# 2. 스테이징된 파일 확인
git diff --cached --name-only

# 3. 수동 커밋
git add -A
git commit -m "refactor(phase-1): migrate lib import paths"
```

### 문제 4: 빌드 실패
```bash
# 현상: "npm run build" 실패

# 해결방법:
# 1. 에러 메시지 확인
npm run build 2>&1 | head -50

# 2. 의존성 재설치
npm ci

# 3. .next 캐시 제거
rm -rf .next

# 4. 재빌드
npm run build
```

### 문제 5: 특정 파일만 마이그레이션 실패
```bash
# 현상: 일부 파일의 import이 업데이트되지 않음

# 해결방법:
# 1. 파일 수동 확인
grep -r "@/lib/haversine" src/

# 2. 수동 마이그레이션
sed -i 's/@\/lib\/haversine/@\/lib\/features/g' 파일명

# 3. 재확인
grep -r "@/lib/haversine" src/
```

---

## ✅ 성공 기준

### Phase 1 완료 후 확인 사항
```
✅ 모든 import 경로 업데이트 완료 (45개)
✅ 타입 체크 통과 (0 errors)
✅ 린트 통과 (또는 경고만)
✅ 단위 테스트 통과 (100%)
✅ 빌드 성공 (.next 생성)
✅ Git 커밋 생성 (1개)
```

### Phase 1-5 (자동화 완료) 확인
```
✅ 총 107개 import 문 업데이트
✅ 20개 마이그레이션 경로 완료
✅ 59개 파일 영향
✅ 5개의 git 커밋 생성 (Phase 1-5)
✅ 모든 타입 체크 통과
✅ 빌드 성공
```

---

## 📚 참고 자료

### Phase 1 관련 문서
- **IMPORT-MIGRATION-GUIDE.md** - 상세 마이그레이션 가이드
- **DATA-TESTID-GUIDE.md** - Step 2: data-testid 추가 가이드
- **.github/workflows/ci-cd.yml** - Step 3: CI/CD 파이프라인
- **AGENT-COLLABORATION-GUIDE.md** - 팀 협업 가이드

### 마이그레이션 스크립트
- **scripts/migrate-imports.js** - 자동 마이그레이션 (Phase 1-5)
- **scripts/update-agent-guide.sh** - 프로젝트 검증
- **scripts/pre-commit.sh** - 커밋 전 검사

### 구조 참고
- **tsconfig.json** - Path alias 설정
- **.eslintrc.json** - 린트 규칙 (신규)
- **.gitignore** - 제외 파일 목록

---

## 🎯 다음 단계 (Phase 2-8)

### 자동화 완료 후 (Phase 1-5 완료)
1. ✅ Phase 6: API & Backend Layer (수동)
2. ✅ Phase 7: Pages & Components (수동)
3. ✅ Phase 8: Tests (수동)

### Phase 2-8 진행 시
- 각 Phase마다 타입 체크 + 테스트 실행
- git commit으로 진행 상황 저장
- 문제 발생 시 즉시 git reset

---

## 📞 도움말

### 자동 마이그레이션 스크립트 옵션
```bash
# 상세 로그 출력
node scripts/migrate-imports.js --verbose

# 특정 마이그레이션만 실행
node scripts/migrate-imports.js --phase 1

# 드라이런 (실제 변경 없음)
node scripts/migrate-imports.js --dry-run
```

### Git 조회 명령어
```bash
# Phase별 커밋 확인
git log --grep="refactor(phase" --oneline

# 각 커밋의 상세 내용
git show <commit-hash>

# 변경 파일 통계
git diff --stat HEAD~5..HEAD
```

---

## 🎉 완료!

Phase 1 마이그레이션 완료 후:
1. 팀에 변경사항 공지
2. PR 리뷰 요청
3. Phase 2-8 진행
4. README.md 업데이트
5. 팀 문서 업데이트

**예상 총 소요 시간: 1-2시간**
- 자동화 (Phase 1-5): 30분
- 수동 작업 (Phase 6-8): 45-60분
- 검증 및 수정: 15-30분
