# Frontend Structure Alignment Note

작성일: 2026-07-09
대상 브랜치: `hslee`
참고 레포: https://github.com/boram72/k-vibe
결론: 현재 Next.js 앱 UI와 라우팅은 유지하고, 좋은 구조만 선별 반영한다.

## 1. 참고 레포를 어떻게 해석할지

`boram72/k-vibe`는 현재 프로젝트를 그대로 이어받는 브랜치가 아니라, 프론트엔드만 분리해서 다시 구성한 Vite 기반 참고 구현이다.

따라서 해야 할 일은 전체 교체가 아니다.

- 하지 않는다: 현재 Next.js App Router를 Vite + React Router로 통째로 이전
- 하지 않는다: 현재 UI를 참고 레포 화면으로 일괄 교체
- 한다: 기능별 block/component 분리 방식, API 계층 분리 원칙, localStorage/helper 경계 같은 설계 아이디어만 선별 반영

## 2. 구조 매핑

| 참고 레포 구조 | 현재 프로젝트 대응 | 판단 |
|----------------|-------------------|------|
| `src/pages` | `app/[locale]/*/page.tsx` | Next App Router를 유지한다. 필요하면 페이지 내부 JSX만 feature component로 분리한다. |
| `src/blocks` | `components/{feature}` | 같은 방향으로 점진 반영한다. `components/persona`는 이미 분리 완료. |
| `src/api` | `frontend/api` | 이미 존재한다. Next 내부 API route 호출은 fetch 기반 유지. axios 전환은 필수 아님. |
| `src/lib` | `lib/domain`, `lib/features`, `lib/ui-state`, `lib/cache` | 이미 분류되어 있다. 추가로 localStorage key 목록 정리는 검토 가능. |
| `src/store` | 현재는 일부 localStorage helper + React state | 필요한 상태만 도입한다. Zustand를 미리 늘리지는 않는다. |
| `src/messages` | `messages`, `lib/i18n/ui-copy.ts` | 현재 i18n 구조 유지. |
| Vite env (`VITE_*`) | Next env (`NEXT_PUBLIC_*`, server env) | Next 규칙 유지. |

## 3. 이미 반영된 것

### Frontend

- `/ko/persona`는 현재 UI를 유지하면서 선택 UI와 결과 UI를 분리했다.
  - `components/persona/KContentPersonaSelector.tsx`
  - `components/persona/PersonaRoutePreview.tsx`
- 사용하지 않는 테마 직접 만들기 흐름은 화면에서 제거했고, K-콘텐츠 페르소나 선택 흐름만 남겼다.
- BTS뷔, 아이유, 제니, 장원영 페르소나 루트가 카탈로그 기반으로 동작한다.

### Backend / API

`app/api/*/route.ts`는 기존처럼 얇은 entrypoint로 두고, 서버 처리 로직을 service 계층으로 옮겼다.

현재 분리된 service:

- `backend/business_services/analysis.ts`
- `backend/business_services/route-generation.ts`
- `backend/business_services/place-detail.ts`
- `backend/business_services/places.ts`
- `backend/business_services/facilities.ts`

즉 현재 흐름은 아래처럼 정리되어 있다.

```text
app/api/*/route.ts
  -> backend/presentation_api/*
  -> backend/business_services/*
  -> backend/ai_services or lib/domain
```

## 4. 앞으로 할 일

### P0: 팀 확인 전 필수

- `SHARE.md` 링크를 팀에 전달한다.
- Vercel 최신 배포가 `hslee` 브랜치 최신 커밋을 반영했는지 확인한다.
- 팀원들이 아래 화면을 직접 열어본다.
  - `/ko/persona`
  - `/ko/route`
  - `/ko/map`
  - `/ko/analyze`
  - `/ko/radar`
- K-콘텐츠 루트 생성 후 `루트 편집`으로 넘어가는 흐름을 확인한다.

### P1: 다음 개발 작업

- Map, Route, Radar처럼 큰 페이지는 신규 기능을 붙이기 전에 `components/{feature}` 단위로 조금씩 분리한다.
- `lib/ui-state`, `lib/features`, `lib/domain`에 흩어진 localStorage key를 한 문서나 상수 파일로 정리할지 결정한다.
- `frontend/api` 요청/응답 타입을 `types/api.ts`로 모을지 검토한다.
- `docs/architecture-verification.md`의 최신 service 구조 설명을 필요 시 보강한다.

### P2: 보류

- Vite + React Router로 전체 이전
- Tailwind v4 / shadcn 테마 일괄 교체
- axios / React Query 전면 도입
- 참고 레포의 테마 위저드 UI 복원

위 항목들은 현재 제품 방향과 맞지 않거나, 지금 안정화된 Next 구조를 흔들 가능성이 있어 보류한다.

## 5. 팀에게 확인받을 질문

1. K-콘텐츠 페르소나 루트가 현재 요구사항에 맞는가?
   - 선택지는 BTS뷔, 아이유, 제니, 장원영 4명으로 충분한가?
   - 장원영은 사용 중인 장소 4곳만 노출되는 현재 동작이 맞는가?

2. `/ko/persona`의 단순화된 화면이 맞는가?
   - 테마 직접 만들기 흐름은 계속 제외해도 되는가?
   - 시작 시간 입력 없이 오전 10시 기준으로 루트가 만들어지는 현재 흐름이 괜찮은가?

3. 생성된 루트를 어디까지 편집 가능하게 할 것인가?
   - 지금은 `/ko/route`에서 저장된 루트를 이어서 확인/편집하는 흐름이다.
   - 드래그 재정렬, 장소 삭제, 진행 체크 같은 편집 범위를 유지할지 정해야 한다.

4. 외부 프론트 repo의 어떤 요소를 다음에 가져올 것인가?
   - 추천: block/component 분리 원칙
   - 보류: Vite 전환, 테마 위저드 복원, 전체 UI 교체

5. 실제 데이터 연결 우선순위는 무엇인가?
   - Supabase PERSONA/LOCATION 테이블 연결
   - TourAPI 장소 상세 강화
   - SNS 분석 실제 AI 경로 강화
   - 저장 루트 계정 동기화

## 6. 검증 상태

최근 확인 기준:

```text
docker compose exec -T app npm run type-check
docker compose exec -T app npm run test
docker compose exec -T app npm run build
```

결과:

- TypeScript 통과
- 전체 테스트 198개 통과
- Next production build 통과

## 7. 최종 판단

`boram72/k-vibe`는 좋은 프론트 설계 참고자료다. 다만 현재 프로젝트는 Next.js API, Vercel 배포, server/client 경계가 이미 잡혀 있으므로 전체 이전보다 점진 반영이 맞다.

현재까지는 핵심 방향이 반영되어 있다.

- 페이지는 얇게, 렌더링 덩어리는 컴포넌트로 분리
- API entrypoint는 얇게, 실제 처리는 service로 분리
- 외부 API나 AI가 없어도 기본 흐름은 확인 가능
- 팀 공유 문서에서 테스트 경로와 확인할 내용을 바로 볼 수 있음
