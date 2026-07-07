# K-Vibe Tracker

외국인 관광객을 위한 **K-콘텐츠 기반 한국 여행 큐레이션 서비스**입니다.

K-콘텐츠 속 장소 탐색, 주변 관광지 검색, SNS 장소 분석, 로컬 루트 생성, 도슨트, 편의시설 레이더를 하나의 앱 흐름으로 연결합니다.

## 바로가기

| 항목 | 주소 |
|------|------|
| 프로덕션 | https://k-vibe-tracker-lemon.vercel.app |
| 로컬 개발 | http://localhost:3000/ko |
| 작업 브랜치 | `hslee` |
| GitHub 원격 | `hslee-origin: https://github.com/hslee1026/k-vibe-tracker.git` |

프로덕션은 Vercel에 배포되어 있으며 HTTPS가 기본 적용됩니다. 외부 기기에서 브라우저 위치 권한을 사용하려면 HTTPS가 필요합니다.

## 현재 상태

현재 앱은 **로컬 우선(local-first) MVP**입니다.

완료된 핵심 범위:

- Kakao Maps JavaScript SDK 연동
- 한국관광공사 TourAPI 장소/상세/행사 일부 연동
- Vercel HTTPS 프로덕션 배포
- 모바일/PC 보기 모드
- 다국어 UI: 한국어, 영어, 일본어, 중국어
- 지도, 홈 피드, SNS 분석, 루트 생성, 도슨트, 레이더, 프로필 게스트 플로우
- PWA 기본 셸, 오프라인 안내, 로컬 캐시, 위치 fallback

아직 보류된 범위:

- Supabase 실계정 OAuth 및 계정 동기화
- Apple 로그인
- Upstash/Redis L2 캐싱
- YouTube/Instagram 실시간 외부 분석
- OpenAI/Claude 기반 AI 분석 및 루트 생성
- 외부 AI TTS
- Kakao Mobility/유료 길찾기 API
- 오프라인 지도 타일

비용이 발생할 수 있는 기능은 명시 승인 전까지 켜지 않습니다. 무료 일일 허용량 안의 Kakao/TourAPI 로컬 QA는 사용할 수 있습니다.

## 빠른 실행

로컬 PC에서 `npm`이 불안정하면 Docker 사용을 권장합니다.

```bash
git switch hslee
git pull --ff-only hslee-origin hslee
docker compose up -d app
```

브라우저에서 엽니다.

```text
http://localhost:3000/ko
```

컨테이너 로그 확인:

```bash
docker compose logs -f app
```

컨테이너 중지:

```bash
docker compose stop app
```

## 검증 명령

Docker 개발 환경 기준:

```bash
docker compose exec app npm run type-check
docker compose exec app npm test
docker compose exec app npm run build
```

로컬 `npm`을 사용할 수 있다면:

```bash
npm run type-check
npm test
npm run build
```

## 환경 변수

로컬 개발용 `.env.local`은 git에 포함하지 않습니다.

지도와 관광지 데이터를 실제 API로 확인하려면 우선 아래 값이 필요합니다.

```env
TOUR_API_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

선택 환경 변수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

YOUTUBE_API_KEY=
OPENAI_API_KEY=
KAKAO_MAP_REST_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

ENABLE_AI_WORKER_ANALYSIS=false
AI_WORKER_URL=
```

주의:

- `TOUR_API_KEY`, `OPENAI_API_KEY`, `YOUTUBE_API_KEY`, Redis 토큰은 서버 전용입니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출됩니다.
- `NEXT_PUBLIC_KAKAO_MAP_KEY`는 Kakao Maps JavaScript 키라 공개 클라이언트 키로 사용됩니다.

## 배포

현재 Vercel 프로덕션:

```text
https://k-vibe-tracker-lemon.vercel.app
```

Vercel 프로젝트:

```text
k-vibe-tracker/k-vibe-tracker
```

프로덕션 환경 변수:

```env
TOUR_API_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_APP_URL=https://k-vibe-tracker-lemon.vercel.app
```

배포 명령:

```bash
docker compose exec app npx vercel deploy --prod --yes
```

프로덕션 URL이 바뀌면 함께 바꿔야 할 것:

- Vercel `NEXT_PUBLIC_APP_URL`
- Kakao Developers Web 플랫폼 사이트 도메인
- Supabase OAuth redirect URL, 나중에 OAuth를 켤 경우

## 외부 접속과 위치 권한

브라우저 위치 API는 보안 컨텍스트에서만 동작합니다.

| 접속 방식 | 위치 권한 |
|----------|-----------|
| `http://localhost:3000` | 대체로 허용 |
| `http://192.168.x.x:3000` | 차단될 수 있음 |
| `http://공인IP:3000` | 차단될 수 있음 |
| `https://k-vibe-tracker-lemon.vercel.app` | 허용 가능 |

외부 기기에서 지도/레이더/도슨트의 현재 위치 기능을 보려면 Vercel HTTPS 주소를 사용하세요.

Kakao Developers Web 플랫폼 도메인에는 현재 아래 도메인이 등록되어 있습니다.

```text
http://localhost:3000
https://k-vibe-tracker-lemon.vercel.app
```

`http://127.0.0.1:3000`으로 테스트하려면 Kakao Developers에 별도 등록이 필요합니다.

## 주요 기능

### 홈

- 언어 선택
- K-콘텐츠 주제 필터
- TourAPI 기반 장소 피드
- 저장, 지도 상세 이동, 빈 상태 복구
- 모바일/PC 보기 모드 전환

### 지도

- Kakao Maps 렌더링
- TourAPI 장소 검색
- 현재 위치 또는 서울 fallback
- 장소 핀, 카테고리 필터, 검색
- 장소 상세, 이미지, 저장, 공유, 루트 추가

### SNS 분석

- YouTube/Instagram URL 감지
- YouTube 로컬/mock 분석
- 분석 결과에서 지도 상세/루트 생성으로 이동
- Instagram 실시간 추출은 승인 전까지 보류

### 루트

- 로컬 루트 생성
- 정류지 재정렬/삭제/완료 처리
- 거리와 이동 힌트 계산
- 지도 상세 연결
- 같은 출처 URL 공유

### 도슨트

- 브라우저 `speechSynthesis` 기반 로컬 음성 안내
- 캡션 섹션과 진행 상태
- 사용자 클릭 기반 100m 도착 확인
- 외부 AI TTS는 보류

### 레이더

- 화장실, ATM, 의료, 교통, 편의점, 약국, 팝업/행사 등 편의시설
- 현재 위치 또는 fallback
- TourAPI 행사 팝업 보강
- Google Maps 검색 handoff는 사용자 클릭 후 실행

### 프로필

- 로그인 없이 게스트 대시보드 사용 가능
- 로컬 저장 장소
- 로컬 저장 루트
- Supabase 계정 동기화 UI 준비
- 실제 OAuth/동기화는 보류

## Sprint 상태

`main` README의 원래 Sprint 0~5 기준으로 정리하면 다음과 같습니다.

| Sprint | 목표 | 현재 상태 |
|--------|------|-----------|
| Sprint 0 | 프로젝트 셋업, 인증, UI 골격 | 완료 |
| Sprint 1 | Kakao Maps + TourAPI | MVP 기준 완료 |
| Sprint 2 | 인증 강화 + Apple 로그인 | 일부 구현, 실 OAuth/Apple 로그인 보류 |
| Sprint 3 | Redis 캐싱 + 성능 최적화 | 로컬 캐시/캐시 키 구현, Redis 연결 보류 |
| Sprint 4 | SNS AI 분석 | 로컬/mock 분석 구현, 실 AI/SNS 추출 보류 |
| Sprint 5 | AI 도슨트 TTS | 브라우저 음성 구현, 외부 AI TTS 보류 |

루트 HTML/와이어프레임의 S1~S12 화면 방향은 대부분 local-first MVP 형태로 반영되어 있습니다. 자세한 구현 내역은 `docs/frontend-flow.md`와 `docs/improvement-log.md`를 참고하세요.

## API 요약

| API | 설명 |
|-----|------|
| `GET /api/places` | TourAPI 기반 주변 장소 목록, 실패 시 mock fallback |
| `GET /api/places/[contentId]` | TourAPI 장소 상세/이미지/운영 정보 |
| `GET /api/facilities` | 편의시설 레이더 데이터, 행사 팝업 일부 TourAPI 보강 |
| `POST /api/routes/generate` | 로컬/mock 루트 생성 |
| `POST /api/analyze` | YouTube URL 로컬/mock 분석, AI worker는 opt-in |

## 프로젝트 구조

```text
k-vibe-tracker/
├── frontend/
│   └── api/                       # 프론트 API 호출 계층 (analyze/places/facilities/routes)
├── backend/
│   ├── config/                    # Next API 백엔드 공통 설정
│   ├── dependency.ts              # Next API 의존성 접근
│   ├── business_services/         # 공통 검증/비즈니스 유틸
│   └── presentation_api/          # Next API 엔드포인트 핸들러
├── app/
│   ├── [locale]/                  # i18n 라우팅 (ko/en/ja/zh)
│   │   ├── page.tsx               # 홈 / K-콘텐츠 장소 피드
│   │   ├── map/                   # 메인 지도 / 장소 탐색
│   │   ├── analyze/               # SNS URL 분석
│   │   ├── persona/               # 취향 기반 루트 생성
│   │   ├── route/                 # 루트 편집 / 이동 힌트
│   │   ├── docent/                # 로컬 음성 도슨트
│   │   ├── radar/                 # 편의시설 레이더
│   │   └── profile/               # 프로필 / 게스트 대시보드
│   └── api/
│       ├── auth/callback/         # backend/presentation_api 위임
│       ├── places/                # backend/presentation_api 위임
│       ├── places/[contentId]/    # backend/presentation_api 위임
│       ├── facilities/            # backend/presentation_api 위임
│       ├── routes/generate/       # backend/presentation_api 위임
│       └── analyze/               # backend/presentation_api 위임
├── components/
│   ├── layout/                    # TopBar, BottomNav, AppLayout
│   ├── auth/                      # LoginModal
│   ├── common/                    # Toast, ErrorBoundary, PWA, Tutorial
│   ├── map/                       # KakaoMapView, CategoryFilter, PlaceDetailModal
│   ├── radar/                     # FacilityCard, RadarMapPreview, RadiusSlider
│   └── route/                     # CrowdBadge, RouteMiniMap
├── lib/
│   ├── supabase/                  # Supabase client/server helpers
│   ├── tourapi.ts                 # 한국관광공사 TourAPI 연동
│   ├── routes.ts                  # 로컬 루트 템플릿/공유/진행 상태
│   ├── facilities.ts              # 편의시설 타입과 mock 데이터
│   ├── local-api-cache.ts         # 1시간 로컬 API 캐시
│   ├── location-cache.ts          # 30분 마지막 위치 캐시
│   └── ui-copy.ts                 # 다국어 UI copy
├── messages/                      # next-intl 메시지 (ko/en/ja/zh)
├── public/                        # PWA manifest, icons, service worker
├── supabase/migrations/           # SQL 마이그레이션
├── ai-worker/
│   ├── main.py                    # FastAPI 엔트리포인트
│   ├── render.yaml                # Render web/cron(7일) 설정
│   ├── config/                    # configure.py, 로컬 키 오버라이드
│   ├── dependency.py              # 외부 API/저장소 의존성 정의
│   ├── presentation_api/route.py  # API 라우터
│   ├── business_services/         # route/findAmenities/location/queue 등
│   ├── ai_services/               # prompt/openai/gemini 전략 확장 포인트
│   ├── externelAPI_services/      # TourAPI/Kakao/Google/Naver/TTS/YouTube 인터페이스
│   └── data_repositories/         # user/route/persona/location/docent 저장소
├── docs/                          # 개발/QA/승인/개선 문서
├── compose.yaml                   # Docker 개발 환경
└── README.md
```

## 참고 문서

- Docker 개발: `docs/docker-development.md`
- 프론트 기능 흐름: `docs/frontend-flow.md`
- 개선 이력: `docs/improvement-log.md`
- QA/런칭 체크리스트: `docs/qa-and-launch-checklist.md`
- 비용/승인 보류 로그: `docs/approval-log.md`

## 협업 규칙

1. `hslee` 브랜치에서 작업합니다.
2. 기능 변경 후 필요한 범위의 타입 체크, 테스트, 빌드를 실행합니다.
3. 비용이 발생할 수 있는 API, AI 모델, OAuth, 외부 권한은 명시 승인 전까지 켜지 않습니다.
4. 배포/환경/사용 방법이 바뀌면 README와 관련 `docs/` 문서를 함께 갱신합니다.
5. 변경 사항은 `hslee-origin/hslee`로 push합니다.
