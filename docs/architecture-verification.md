# 🏗️ 프론트엔드 / 백엔드 구조 검증 가이드

> **이 문서 하나만 보면** K-Vibe Tracker의 프론트엔드와 백엔드가 어떻게 나뉘어
> 있는지, 그리고 **제대로 분리됐는지 직접 확인**할 수 있습니다.
> 팀원 리뷰용 단일 진입점 문서입니다.
>
> 최종 검증일: 2026-07-09 · 브랜치: `hslee` · 결과: **✅ 4개 규칙 전부 통과**

---

## 1. 레이어 구조 한눈에

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (클라이언트 · 브라우저 번들)                        │
│                                                             │
│  app/[locale]/…      UI 페이지 (React 클라이언트 컴포넌트)    │
│  components/         React UI (map / route / layout …)       │
│  frontend/api/       ⭐ 클라이언트 데이터 호출 계층           │
│                      (client.ts, analyze.ts, places.ts,     │
│                       routes.ts, facilities.ts, mock-data)  │
│  lib/domain/         공용 도메인 로직 (프론트/백 공용)        │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (fetch)  ↓
┌───────────────────────────┴─────────────────────────────────┐
│  BACKEND (서버 전용 · 절대 클라이언트 번들에 포함 안 됨)      │
│                                                             │
│  app/api/*/route.ts   ⭐ 얇은 위임 핸들러 (로직 없음)        │
│  backend/                                                   │
│   ├── config/               환경변수 · 설정                 │
│   ├── dependency.ts         기능 플래그 · 외부 서비스 연결   │
│   ├── business_services/    비즈니스 로직 (guards 등)        │
│   ├── ai_services/          Groq 스팟 추출, YouTube 메타     │
│   └── presentation_api/     요청 핸들러 (analyze, places …)  │
└─────────────────────────────────────────────────────────────┘
```

**요약**: UI → `frontend/api/` → (HTTP) → `app/api/*/route.ts` → `backend/presentation_api/` → `backend/business_services` · `backend/ai_services`

---

## 2. "잘 나눠졌다"의 기준 = 4가지 의존성 규칙

| # | 규칙 | 왜 중요한가 |
|---|------|-------------|
| **R1** | `app/api/*/route.ts` 는 `backend/presentation_api/*` 로 **위임만** 한다 (로직 없음) | 라우팅과 비즈니스 로직 분리 |
| **R2** | UI(`app/`, `components/`)는 `frontend/api/*` 를 통해서만 데이터를 부른다. **직접 `fetch('/api/...')` 금지** | 데이터 접근 계층 일원화 |
| **R3** | `frontend/api/*` 는 `backend/*` 를 **import 하지 않는다** | 서버 코드가 클라이언트 번들에 유출되는 것 방지 |
| **R4** | `backend/*` 는 `frontend/`·`components/` 를 **import 하지 않는다** | 의존성 방향(서버→클라 역참조) 방지 |

---

## 3. 직접 확인하는 방법 (복사해서 실행)

> Windows PowerShell 기준. 아무 것도 출력되지 않으면(또는 "위반 없음") **통과**입니다.

### R1 — 모든 API 라우트가 위임하는가
```powershell
# 각 route.ts 가 backend/presentation_api 를 재export 하는지
Get-ChildItem -Recurse app/api -Filter route.ts | ForEach-Object {
  $c = Get-Content -LiteralPath $_.FullName -Raw
  "{0} => {1}" -f $_.FullName, $(if ($c -match 'backend/presentation_api') {'OK'} else {'CHECK!'})
}
```
✅ 현재 결과: analyze / auth·callback / debug·ai-status / facilities / places / places·[contentId] / routes·generate — **7개 전부 OK**

### R2 — UI가 직접 /api 를 fetch 하는가 (있으면 위반)
```powershell
# app, components 안에서 fetch('/api/...') 직접 호출 검색
Select-String -Path (Get-ChildItem -Recurse app,components -Include *.ts,*.tsx).FullName `
  -Pattern "fetch\(\s*['""``]/api/"
```
✅ 현재 결과: **매치 0건** (모두 `frontend/api/` 경유)

### R3 — frontend/api 가 backend 를 import 하는가 (있으면 위반)
```powershell
Select-String -Path frontend/api/*.ts -Pattern "@/backend" -SimpleMatch
```
✅ 현재 결과: **0건**

### R4 — backend 가 frontend/components 를 import 하는가 (있으면 위반)
```powershell
Select-String -Path (Get-ChildItem -Recurse backend -Filter *.ts).FullName `
  -Pattern "@/frontend|@/components"
```
✅ 현재 결과: **0건**

### (참고) 타입 검증
```powershell
# node/npm 이 있는 환경
npm run type-check   # 이 저장소 전용 대체 명령은 scripts/verify.txt 참고
```

---

## 4. 위임 패턴 예시 (R1이 어떻게 생겼나)

```typescript
// app/api/analyze/route.ts  ← 얇은 위임 (한 줄)
export { postAnalyze as POST } from '@/backend/presentation_api/analyze';

// app/api/places/[contentId]/route.ts
export { getPlaceDetail as GET } from '@/backend/presentation_api/place-detail';

// 실제 로직은 backend/presentation_api/analyze.ts 안에 위치
```

이번 작업에서 `app/api/debug/ai-status/route.ts` 하나가 이 규칙을 어기고 인라인
로직을 갖고 있었는데, `backend/presentation_api/debug-ai-status.ts` 로 옮겨
**7개 라우트 전부 위임 패턴으로 통일**했습니다.

---

## 5. 함께 보면 좋은 문서

| 문서 | 내용 |
|------|------|
| `README.md` | 전체 디렉토리 트리 + 각 폴더 역할 |
| `HANDOFF.md` §2 | 아키텍처 + 의존성 규칙 원문 |
| `docs/frontend-structure-validation.md` | 프론트엔드 구조 상세 평가(85/100)와 개선 로드맵 |
| `scripts/verify.txt` | 타입체크 · 배포 · 스모크 테스트 명령 모음 |

---

## 6. 결론

- ✅ **R1~R4 4개 규칙 모두 통과** (2026-07-09 기준, `hslee` 브랜치)
- 프론트엔드(`frontend/api`, `components`, `app/[locale]`)와 백엔드(`backend/*`,
  `app/api`)가 명확히 분리되어 있으며, 의존성 방향도 올바릅니다.
- 새 기능 추가 시 위 4개 규칙과 §3 명령으로 **회귀 여부를 셀프 체크**할 수 있습니다.
