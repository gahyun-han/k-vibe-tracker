# 📢 K-Vibe Tracker — 작업 공유

> 팀/외부 공유용 요약 문서. 최근 작업 내용, 테스트 주소, GitHub에서 볼 것을 정리했습니다.

## 1. 프로젝트 소개
한국 YouTube/SNS 영상 URL을 붙여넣으면 **AI가 영상 속 한국 명소를 추출**하고, 그 장소들을 잇는 **도보 여행 루트 + 카카오 지도**를 자동으로 만들어주는 Next.js 앱입니다.

## 2. 🔗 바로 테스트해볼 수 있는 주소
프로덕션: **https://k-vibe-tracker-lemon.vercel.app**

| 기능 | 링크 | 해볼 것 |
|------|------|---------|
| 홈 피드 | https://k-vibe-tracker-lemon.vercel.app/ko | K-콘텐츠 장소 둘러보기 |
| **SNS 분석** | https://k-vibe-tracker-lemon.vercel.app/ko/analyze | 한국 여행 유튜브 URL 붙여넣기 → AI 스팟 추출 |
| **루트 만들기** | https://k-vibe-tracker-lemon.vercel.app/ko/route | 추출된 스팟으로 루트 생성 + 지도 미리보기 |
| 지도 탐색 | https://k-vibe-tracker-lemon.vercel.app/ko/map | 전체 지도에서 장소 탐색 / 루트 전체 보기 |
| 편의시설 레이더 | https://k-vibe-tracker-lemon.vercel.app/ko/radar | 주변 편의시설 반경 검색 |

> 💡 **분석 테스트 팁**: 부산·강릉 같은 **한국 여행 영상** URL을 넣으면 좌표가 포함된 실제 스팟이 추출됩니다. (해외/코미디 영상은 한국 장소가 없어 결과가 비어 있는 게 정상입니다.)

## 3. 📌 이번 작업에서 한 것 (핵심)
1. **AI 스팟 추출 정확도 개선** — Groq(llama-3.3-70b)가 장소의 **위경도 좌표를 직접 반환**하도록 개선. 이전에 루트 거리가 `0m/0min`으로 뜨던 문제 해결.
2. **루트 지도 미리보기 버그 수정** — 지도 대신 격자만 뜨던 문제 해결. 이제 **실제 카카오 지도 위에 번호 마커 + 경로선**이 표시됩니다.
3. **지도에서 열기 개선** — 앞 페이지에서 만든 루트의 전체 스팟이 지도와 좌측 리스트에 모두 표시.
4. **코드 구조 정리** — 모든 API 라우트를 얇은 위임 핸들러로 통일(frontend/backend 레이어 규칙 준수).
5. **문서화** — 다른 개발자/에이전트가 이어받을 수 있는 인수인계 문서 + 검증 스크립트 작성.

## 4. 🐙 GitHub에서 봐야 할 것
- **저장소**: https://github.com/hslee1026/k-vibe-tracker
- **작업 브랜치**: `hslee` (Vercel이 이 브랜치를 자동 배포)
- **먼저 읽을 문서**:

  | 파일 | 내용 |
  |------|------|
  | `README.md` | 프로젝트 개요 + 전체 디렉토리 구조 |
  | `docs/architecture-verification.md` | 🏗️ **프론트/백엔드 분리 검증 가이드** — 4가지 규칙 + 직접 확인 명령 (구조 리뷰용) |
  | `HANDOFF.md` | 🤝 **인수인계 핵심 문서** — 아키텍처, 레이어 규칙, 환경변수, 주의점, 배포 흐름 |
  | `scripts/verify.txt` | 타입체크·배포·스모크 테스트 명령 모음 |
  | `AGENT-COLLABORATION-GUIDE.md` | 에이전트 협업 가이드 |

- **최근 주요 커밋** (`hslee` 브랜치):
  - `222d6c1` fix(route): 루트 미니맵 카카오 지도 렌더링 수정
  - `1016846` refactor(api): debug 엔드포인트 레이어 정리 + 인수인계 문서 추가
  - `35fcc0d` feat(map): 루트 미리보기 실제 지도 + 지도 페이지 전체 루트 표시
  - `ebe6a69` fix(analyze): Groq가 좌표 직접 반환

## 5. 🏗️ 아키텍처 한눈에
```
app/[locale]/…        UI 페이지
app/api/*/route.ts     얇은 위임 핸들러
backend/               서버 전용 (config, ai_services=Groq, presentation_api)
frontend/api/          클라이언트 데이터 호출 계층
components/            React UI (map/route 등)
lib/domain/            공용 도메인 로직
```

## 6. ⚠️ 알아두면 좋은 점
- 오래 전 저장된 일부 루트는 좌표 수정 이전 데이터라 `0m`로 보일 수 있음 → **새로 분석하면 정상**.
- 지도는 카카오 JS SDK 사용 (`NEXT_PUBLIC_KAKAO_MAP_KEY`), 좌표는 Groq가 제공.
- CI는 수동 승인(`action_required`) 방식이라 PR에서 자동 실행되지 않음 → 로컬 타입체크 + 프로덕션 스모크 테스트로 검증.
