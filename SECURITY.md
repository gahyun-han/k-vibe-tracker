# Security Policy

## Supported Versions

현재 지원 중인 버전:

| Branch | Supported |
|--------|-----------|
| `main` | ✅ |
| `hslee` | ✅ (개발 브랜치) |

## Reporting a Vulnerability

보안 취약점을 발견하셨다면 **GitHub Issues에 공개 등록하지 마시고** 아래 절차를 따라주세요.

### 보고 방법

1. GitHub Security Advisories를 통해 비공개 보고:
   - 이 리포지토리 → **Security** 탭 → **Report a vulnerability**

2. 또는 리포지토리 소유자에게 직접 연락

### 보고 시 포함할 내용

- 취약점 유형 (예: XSS, CSRF, 정보 노출 등)
- 재현 단계
- 예상 영향 범위
- 수정 제안 (있는 경우)

### 대응 절차

| 단계 | 예상 소요 시간 |
|------|---------------|
| 초기 응답 | 48시간 이내 |
| 취약점 확인 | 7일 이내 |
| 패치 적용 | 심각도에 따라 1~14일 |

## 보안 참고사항

- 환경 변수(`.env.local`)는 절대 커밋하지 마세요
- `NEXT_PUBLIC_` 접두사가 없는 변수는 서버 전용이며 클라이언트에 노출되지 않습니다
- Supabase API 키는 anon key만 공개 허용됩니다
- AI/외부 API 키(`OPENAI_API_KEY`, `YOUTUBE_API_KEY`)는 서버 전용입니다
