# K-Vibe Tracker 🇰🇷

> 외국인 관광객을 위한 K-콘텐츠 기반 여행 큐레이션 서비스

## 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 열어서 Supabase 키 입력

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000/en](http://localhost:3000/en) 열기

---

## 환경 변수 설정 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase Anon Key
```

> **Supabase 무료 계정 만들기:** [supabase.com](https://supabase.com)
> 프로젝트 생성 후 Settings → API 에서 URL과 anon key 복사

---

## Supabase 설정

### 1. Google OAuth 활성화
- Supabase Dashboard → Authentication → Providers → Google
- Google Cloud Console에서 OAuth 2.0 Client ID 발급
- Redirect URL: `https://[your-project].supabase.co/auth/v1/callback`

### 2. DB 마이그레이션 실행
```bash
# Supabase SQL Editor에서 아래 파일 내용 실행
# supabase/migrations/001_initial.sql
```

---

## 프로젝트 구조

```
k-vibe-tracker/
├── app/
│   ├── [locale]/          # i18n 라우팅 (ko/en/ja/zh)
│   │   ├── page.tsx       # Landing
│   │   ├── map/           # 메인 지도
│   │   ├── analyze/       # SNS 분석기
│   │   ├── persona/       # 페르소나 선택
│   │   ├── route/         # 루트 결과
│   │   ├── radar/         # 편의시설 레이더
│   │   └── profile/       # 프로필 (로그인 필요)
│   └── api/
│       ├── auth/callback/ # OAuth 콜백
│       └── places/        # TourAPI 프록시 (Sprint 1)
├── components/
│   ├── layout/            # TopBar, BottomNav, AppLayout
│   ├── auth/              # LoginModal
│   └── common/            # Toast, ErrorBoundary, Skeleton
├── lib/supabase/          # Supabase 클라이언트/서버
├── messages/              # i18n 번역 파일 (ko/en/ja/zh)
├── types/                 # TypeScript DB 타입
└── supabase/migrations/   # SQL 마이그레이션
```

---

## Sprint 진행 상황

| Sprint | 내용 | 상태 |
|--------|------|------|
| **Sprint 0** | 프로젝트 셋업, 인증, UI 골격 | ✅ **완료** |
| Sprint 1 | Kakao Maps + TourAPI 연동 | 🔜 다음 |
| Sprint 2 | 인증 강화 + Apple 로그인 | ⬜ 예정 |
| Sprint 3 | Redis 캐싱 + 성능 최적화 | ⬜ 예정 |
| Sprint 4 | SNS AI 분석 (YouTube → 장소) | ⬜ 예정 |
| Sprint 5 | AI 도슨트 TTS | ⬜ 예정 |

---

## Sprint 1 개발 전 해야 할 것

1. `.env.local`에 Supabase 키 설정
2. Supabase에서 Google OAuth 활성화
3. SQL 마이그레이션 실행
4. `npm run dev` 로 로컬 확인
5. Kakao Developers 앱 등록 → JS API Key 발급 준비
