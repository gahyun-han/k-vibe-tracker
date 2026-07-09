# K-Vibe Tracker - 작업 공유

> 팀/외부 공유용 요약 문서입니다. 2026-07-09 기준으로 확인 가능한 기능, 테스트 주소, GitHub에서 볼 내용을 정리했습니다.

## 1. 프로젝트 소개

한국 YouTube/SNS 영상 URL을 붙여넣으면 AI가 영상 속 한국 명소를 추출하고, 그 장소들을 잇는 도보 여행 루트와 카카오 지도를 만들어주는 Next.js 앱입니다.

현재는 SNS 분석 흐름 외에도 K-콘텐츠 페르소나를 선택해서 하루 루트를 바로 만들어보고, 생성된 루트를 지도/루트 편집 화면에서 이어서 확인할 수 있습니다.

## 2. 바로 테스트해볼 수 있는 주소

프로덕션: https://k-vibe-tracker-lemon.vercel.app

| 기능 | 링크 | 해볼 것 |
|------|------|---------|
| 홈 피드 | https://k-vibe-tracker-lemon.vercel.app/ko | K-콘텐츠 장소 둘러보기 |
| SNS 분석 | https://k-vibe-tracker-lemon.vercel.app/ko/analyze | 한국 여행 YouTube URL 붙여넣기 -> 후보 스팟 추출 |
| K-콘텐츠 루트 만들기 | https://k-vibe-tracker-lemon.vercel.app/ko/persona | BTS뷔, 아이유, 제니, 장원영 중 선택 -> 하루 루트 미리보기 |
| 루트 편집 | https://k-vibe-tracker-lemon.vercel.app/ko/route | 생성/저장된 루트 확인, 순서 조정, 지도 열기 |
| 지도 탐색 | https://k-vibe-tracker-lemon.vercel.app/ko/map | 전체 지도에서 장소 탐색 / 루트 전체 보기 |
| 편의시설 레이더 | https://k-vibe-tracker-lemon.vercel.app/ko/radar | 주변 편의시설 반경 검색 |

테스트 팁:

1. K-콘텐츠 루트는 `/ko/persona`에서 페르소나를 고르면 바로 미리보기가 뜹니다.
2. 미리보기에서 `루트 편집`을 누르면 `/ko/route`에서 같은 루트를 이어서 확인할 수 있습니다.
3. SNS 분석은 한국 여행 영상 URL에서 가장 자연스럽습니다. 해외/코미디 영상은 한국 장소가 없어 결과가 비어 있을 수 있습니다.

## 3. 이번 작업에서 한 것

1. AI 스팟 추출 정확도 개선
   Groq(llama-3.3-70b)가 장소의 위경도 좌표를 직접 반환하도록 개선해 루트 거리가 `0m/0min`으로 뜨던 문제를 해결했습니다.

2. 루트 지도 미리보기와 지도 열기 개선
   실제 카카오 지도 위에 번호 마커와 경로선이 표시되고, 앞 페이지에서 만든 루트의 전체 스팟이 지도와 리스트에 함께 표시됩니다.

3. K-콘텐츠 페르소나 루트 완성
   BTS뷔, 아이유, 제니, 장원영 페르소나 선택 화면을 정리했고, 각 페르소나별 서울 하루 코스가 바로 생성되도록 연결했습니다.

4. 루트 생성 UI 단순화
   현재 사용하지 않는 테마 직접 만들기 흐름을 제거하고, `K-콘텐츠 페르소나 선택` 중심으로 화면을 정리했습니다.

5. API / service 레이어 구조 정리
   `app/api/*/route.ts`는 얇은 위임 핸들러로 유지하고, `backend/presentation_api`는 요청/응답 담당, 실제 처리 로직은 `backend/business_services`로 분리했습니다.

6. 문서화와 검증 상태 정리
   인수인계 문서, 테스트 안내, 공유 문서를 업데이트했고 로컬 검증 기준을 맞췄습니다.

## 4. GitHub에서 봐야 할 것

- 저장소: https://github.com/hslee1026/k-vibe-tracker
- 작업 브랜치: `hslee`
- 공유 문서: https://github.com/hslee1026/k-vibe-tracker/blob/hslee/SHARE.md

먼저 읽을 문서:

| 파일 | 내용 |
|------|------|
| `README.md` | 프로젝트 개요, 실행 방법, 주요 기능 |
| `HANDOFF.md` | 인수인계 핵심 문서: 아키텍처, 레이어 규칙, 환경변수, 배포 흐름 |
| `docs/architecture-verification.md` | 프론트/백엔드 분리 검증 가이드 |
| `scripts/verify.txt` | 타입체크, 테스트, 배포, 스모크 테스트 명령 모음 |
| `AGENT-COLLABORATION-GUIDE.md` | 에이전트 협업 가이드 |

최근 주요 커밋 (`hslee` 브랜치):

- `87f1a1e` Move facilities lookup logic into service
- `1ed7fc5` Move places lookup logic into service
- `6d2dc96` Move place detail logic into service
- `3e523b9` Refactor persona UI and route services
- `b4ccf63` Simplify persona route selection
- `178f303` Fix Japanese analyze cache copy
- `11794a8` Update persona route catalog

## 5. 아키텍처 한눈에

```text
app/[locale]/...          UI 페이지
app/api/*/route.ts        Next API route entrypoint
backend/presentation_api  요청 파싱, 응답 변환
backend/business_services 기능별 서버 처리 로직
backend/ai_services       Groq/Gemini, YouTube metadata, geocoding
frontend/api              클라이언트 데이터 호출 계층
components                React UI 컴포넌트
lib/domain                공용 도메인 로직, 정규화, 로컬 카탈로그
ai-worker                 별도 Python AI worker 구조
```

현재 정리된 service 범위:

- `analysis`
- `route-generation`
- `place-detail`
- `places`
- `facilities`

## 6. 알아둘 점

- 오래 전 저장된 일부 루트는 좌표 개선 이전 데이터라 `0m`로 보일 수 있습니다. 새로 분석하거나 새 루트를 만들면 정상입니다.
- 지도는 카카오 JS SDK를 사용합니다. 브라우저 확인에는 `NEXT_PUBLIC_KAKAO_MAP_KEY`가 필요합니다.
- SNS 분석은 AI 키가 준비되지 않은 환경에서도 로컬 대체 결과로 기본 흐름을 확인할 수 있습니다.
- K-콘텐츠 페르소나 루트는 DB 연결 전에도 팀원이 화면과 루트 흐름을 확인할 수 있도록 현재 카탈로그 기반으로 동작합니다.
- 최근 검증 기준: `type-check` 통과, 전체 테스트 `198 passed`, `next build` 통과.
