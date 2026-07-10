# 🚀 Phase 2-8 전체 실행 계획 및 예상 소요 시간

## ⏱️ **전체 예상 소요 시간**

```
Phase 1 (사전 필요): 30분
Phase 2 (data-testid):  2시간
Phase 3 (CI/CD):        30분
Phase 4-5 (정리):       30분
Phase 6 (API):          1시간 15분
Phase 7 (Pages/Components): 2시간 30분
Phase 8 (Tests):        1시간 30분
검증 & 최종 테스트:      1시간
─────────────────────────────
총 예상 소요 시간:      ~11-12시간
```

### 효율적 진행 전략
- **병렬 처리 가능**: 파일 단위로 독립적으로 진행 가능
- **검증 자동화**: GitHub Actions와 pre-commit hook으로 검증 자동화
- **점진적 진행**: Phase마다 commit & 검증으로 리스크 최소화

---

## 📋 **Phase별 상세 작업 계획**

### Phase 1️⃣: Import 마이그레이션 (사전, 30분)
**필수 완료 후 진행**

```bash
node scripts/migrate-imports.js
npm run type-check  # 검증
npm run test        # 테스트
git log -5          # 확인
```

✅ 완료 후: Phase 2 진행 가능

---

### Phase 2️⃣: data-testid 추가 (2시간)

#### Task 2-1: 컴포넌트 스캔 (30분)
- 모든 TSX 파일 스캔
- interactive 요소 파악
- 필요 data-testid 리스트 작성

#### Task 2-2: 자동 생성 (45분)
- Regex 기반 자동 추가 (70% 자동화)
  - `<button>` → `data-testid="..."`
  - `<input>` → `data-testid="..."`
  - 동적 아이템 → `data-testid={...}`
- 스크립트: `scripts/add-data-testid.js` 생성

#### Task 2-3: 수동 검증 (30분)
- 의미론적 정확성 검증
- 중복 제거
- 네이밍 규칙 확인

#### Task 2-4: E2E 테스트 (15분)
```bash
npm run test:e2e    # E2E 테스트 실행
npm run test:e2e:ui # 디버깅 모드
```

✅ **예상 완료**: 2시간 (병렬 처리 가능)

---

### Phase 3️⃣: CI/CD 파이프라인 (30분)

#### Task 3-1: GitHub Secrets 설정 (15분)
필요한 Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

#### Task 3-2: 파이프라인 테스트 (15분)
```bash
# 로컬에서 먼저 테스트
npm run type-check
npm run lint
npm run build
npm run test

# 그 후 GitHub Actions 활성화
git push  # CI/CD 자동 실행
```

✅ **예상 완료**: 30분

---

### Phase 4️⃣-5️⃣: 정리 작업 (30분)

#### 작업 내용
- Phase 1-5 자동화 완료 확인
- 크리티컬 의존성 검증
- 모든 타입 체크 통과 확인

```bash
npm run type-check  # 0 errors
npm run build       # 성공
npm run test        # 100% 통과
```

✅ **예상 완료**: 30분

---

### Phase 6️⃣: API & Backend 레이어 (1시간 15분)

#### 영향받는 파일 (8개)
```
frontend/api/
├── analyze.ts               (10min)
├── facilities.ts            (10min)
└── routes.ts                (10min)

backend/presentation_api/
├── analyze.ts               (15min)
├── facilities.ts            (15min)
├── place-detail.ts          (10min)
├── places.ts                (10min)
└── routes-generate.ts       (15min)
```

#### 작업 단계
1. 각 파일 import 경로 업데이트
2. API 테스트 실행
3. Type check 검증
4. Git commit

```bash
# 마이그레이션 실행
npm run type-check
npm run test

# 커밋
git add -A
git commit -m "refactor(phase-6): migrate API and backend layer imports"
```

✅ **예상 완료**: 1시간 15분

---

### Phase 7️⃣: Pages & Components (2시간 30분)

#### Pages (11개, 1시간)
```
app/[locale]/
├── page.tsx                 (10min)
├── map/page.tsx             (15min)
├── analyze/page.tsx         (10min)
├── route/page.tsx           (15min)
├── persona/page.tsx         (10min)
├── docent/page.tsx          (10min)
├── radar/page.tsx           (10min)
└── profile/page.tsx         (10min)
```

#### Components (17개, 1시간 30분)
```
components/
├── layout/                  (30min)
│   ├── TopBar.tsx
│   ├── BottomNav.tsx
│   └── AppLayout.tsx
├── map/                     (30min)
│   ├── KakaoMapView.tsx
│   ├── CategoryFilter.tsx
│   └── PlaceDetailModal.tsx
├── common/                  (30min)
│   ├── ErrorBoundary.tsx
│   ├── Toast.tsx
│   └── 기타
└── radar/, route/           (30min)
    └── 각 컴포넌트
```

#### 작업 단계
1. 각 파일의 import 경로 업데이트
2. 컴포넌트별 테스트 실행
3. UI 시각적 검증
4. Git commit (파일별 또는 폴더별)

```bash
# 페이지별 진행
for page in app/[locale]/*.tsx; do
  # import 경로 업데이트
  # 타입 체크
  # 테스트
done

git add -A
git commit -m "refactor(phase-7): migrate pages and components imports"
```

✅ **예상 완료**: 2시간 30분

---

### Phase 8️⃣: 테스트 파일 (1시간 30분)

#### 영향받는 파일 (19개)
```
__tests__/
├── frontend/
│   ├── api/
│   │   └── client.test.ts           (10min)
│   └── lib/
│       ├── domain/
│       │   ├── analysis.test.ts      (5min)
│       │   ├── crowd.test.ts         (5min)
│       │   ├── facilities.test.ts    (5min)
│       │   ├── routes.test.ts        (5min)
│       │   └── 기타
│       ├── cache/
│       │   ├── local-api-cache.test.ts
│       │   └── location-cache.test.ts
│       └── ui-state/
│           └── 각 테스트
├── integration/
│   └── 각 통합 테스트
└── e2e/
    └── main.e2e.ts
```

#### 작업 단계
1. 각 테스트 파일의 import 경로 업데이트
2. 테스트 실행
3. 모든 테스트 통과 확인
4. Coverage 검증

```bash
# 전체 테스트 실행
npm run test              # 유닛 & 통합
npm run test:e2e         # E2E
npm run test:coverage    # 커버리지

# 커밋
git add -A
git commit -m "refactor(phase-8): migrate test file imports"
```

✅ **예상 완료**: 1시간 30분

---

## ✅ **최종 검증 & 완료 (1시간)**

### 검증 단계
1. **전체 타입 체크** (10분)
   ```bash
   npm run type-check
   ```

2. **전체 린트** (10분)
   ```bash
   npm run lint
   ```

3. **빌드** (20분)
   ```bash
   npm run build
   ```

4. **전체 테스트** (15분)
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **Git 히스토리** (5분)
   ```bash
   git log --oneline -20
   git diff HEAD~15..HEAD --stat
   ```

### 최종 결과 확인
- ✅ 0개 type errors
- ✅ 0개 lint errors
- ✅ 100% 테스트 통과
- ✅ 빌드 성공
- ✅ 8개 phase commit 생성

---

## 🎯 **병렬 처리 전략**

### 파일별 독립 처리 가능
Phase 2-8의 많은 파일들은 서로 의존성이 적어서 병렬 처리 가능:

```
Phase 2: data-testid 추가
  ├─ 페이지별 병렬 처리 (4개 스레드)
  └─ 컴포넌트별 병렬 처리 (4개 스레드)

Phase 7: Pages & Components  
  ├─ 페이지 파일들 (병렬 가능)
  └─ 컴포넌트 폴더별 (병렬 가능)

Phase 8: 테스트
  ├─ 유닛 테스트 (병렬 가능)
  ├─ 통합 테스트 (병렬 가능)
  └─ E2E 테스트 (순차 필수)
```

### 효율적 진행
- 각 Task별로 commit 생성
- Phase별로 검증
- 병렬 처리로 시간 단축

---

## 📊 **최종 타임라인**

### 일렬 진행 (시간순서)
```
14:00 - 14:30  Phase 1: Import 마이그레이션
14:30 - 16:30  Phase 2: data-testid 추가
16:30 - 17:00  Phase 3: CI/CD 설정
17:00 - 17:30  Phase 4-5: 정리
17:30 - 18:45  Phase 6: API & Backend
18:45 - 21:15  Phase 7: Pages & Components
21:15 - 22:45  Phase 8: 테스트
22:45 - 23:45  검증 & 최종 테스트
─────────────────────────────
총: 11-12시간
```

### 병렬 진행 (추천)
```
14:00 - 14:30  Phase 1: Import 마이그레이션
14:30 - 16:30  Phase 2: data-testid (병렬)
16:30 - 17:30  Phase 3-5 (병렬 + 검증)
17:30 - 19:00  Phase 6-7 (병렬 진행)
19:00 - 20:00  Phase 8: 테스트
20:00 - 21:00  최종 검증
─────────────────────────────
총: 7-8시간 (병렬 처리)
```

---

## 🛠️ **자동화 도구**

### 준비될 스크립트
1. **scripts/add-data-testid.js**
   - 자동 data-testid 추가
   - 70% 자동화

2. **scripts/verify-migration.js**
   - 모든 import 경로 검증
   - 누락된 마이그레이션 감지

3. **scripts/run-phase-validation.sh**
   - Phase별 검증 자동화
   - 타입 체크 + 린트 + 테스트

---

## 📋 **시작하기 전 확인사항**

- [x] Phase 1 준비 완료
- [ ] 충분한 시간 확보 (7-12시간)
- [ ] 모든 문서 읽음
- [ ] GitHub에 푸시 가능한 상태
- [ ] 테스트 환경 준비

---

## 🚀 **시작 명령어**

```bash
# 1. Phase 1 실행 (사전 필수)
node scripts/migrate-imports.js

# 2. Phase 2-8 시작
npm run type-check
npm run build
npm run test

# 3. 전체 진행 (자동화 준비 후)
npm run phase:all  # (준비되면 사용 가능)
```

---

## 💡 **추천 진행 방식**

### 옵션 A: 한 번에 완료 (추천)
```bash
# 총 11-12시간 소요
# 장점: 빠른 완료
# 단점: 장시간 집중 필요
```

### 옵션 B: 분할 진행 (권장)
```
Day 1: Phase 1-3 (3시간)
  → Import 마이그레이션
  → data-testid 추가
  → CI/CD 설정

Day 2: Phase 4-8 (4-5시간)
  → API 레이어
  → Pages & Components
  → 테스트
  → 최종 검증
```

### 옵션 C: 병렬 처리 (효율적)
```
Main Thread: Phase 순차 진행
Worker 1: data-testid 자동 생성
Worker 2: API 파일 마이그레이션
Worker 3: 컴포넌트 마이그레이션
→ 총 7-8시간 소요
```

---

## 📞 **진행 중 문제 해결**

### 타입 에러 발생 시
```bash
npm run type-check  # 상세 에러 확인
git reset --hard HEAD~1  # 이전 단계로 롤백
```

### 테스트 실패 시
```bash
npm run test -- --verbose  # 상세 로그
npm run test:e2e:ui  # 디버깅 모드
```

### Git conflict 시
```bash
git status  # 충돌 파일 확인
git diff  # 상세 보기
# 수동으로 해결 후
git add .
git commit
```

---

**준비 완료! 시작하시겠습니까?** 🚀

옵션을 선택해주세요:
1. **A: 한 번에 완료** (11-12시간, 지금 시작)
2. **B: 분할 진행** (Day 1: 3시간, Day 2: 4-5시간)
3. **C: 병렬 처리** (7-8시간, 최효율)
