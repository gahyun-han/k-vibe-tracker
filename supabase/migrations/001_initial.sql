-- =============================================
-- K-Vibe Tracker — Initial DB Schema
-- Sprint 0 Migration
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── 1. 장소 정보 (TourAPI 캐시 + 혼잡도) ───────────────────
CREATE TABLE IF NOT EXISTS places (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id      TEXT UNIQUE NOT NULL,
  content_type    INTEGER NOT NULL,
  name_ko         TEXT NOT NULL,
  name_en         TEXT,
  name_ja         TEXT,
  name_zh         TEXT,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  address         TEXT,
  category        TEXT,
  image_url       TEXT,
  crowd_level     INTEGER CHECK (crowd_level BETWEEN 0 AND 100),
  crowd_updated_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. SNS 분석 결과 캐시 ──────────────────────────────────
CREATE TABLE IF NOT EXISTS sns_analysis (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_hash          TEXT UNIQUE NOT NULL,
  source_url        TEXT NOT NULL,
  detected_place_id UUID REFERENCES places(id),
  vibe_tags         TEXT[] DEFAULT '{}',
  raw_result        JSONB DEFAULT '{}',
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. 사용자 페르소나 ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_personas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  star_name   TEXT,
  mood_tags   TEXT[] DEFAULT '{}',
  style_tags  TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. 생성된 루트 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id       UUID REFERENCES user_personas(id),
  place_ids        UUID[] DEFAULT '{}',
  estimated_time   INTEGER,  -- minutes
  total_distance   INTEGER,  -- meters
  share_token      UUID DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. 편의시설 (화장실·약국) ─────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type      TEXT NOT NULL CHECK (type IN ('restroom','cafe_toilet','pharmacy')),
  name      TEXT NOT NULL,
  address   TEXT,
  lat       DOUBLE PRECISION NOT NULL,
  lng       DOUBLE PRECISION NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_24h    BOOLEAN DEFAULT FALSE,
  languages TEXT[] DEFAULT '{}',
  source    TEXT DEFAULT 'molit'
);

-- ─── 인덱스 ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS places_content_id_idx ON places(content_id);
CREATE INDEX IF NOT EXISTS places_lat_lng_idx ON places(lat, lng);
CREATE INDEX IF NOT EXISTS sns_analysis_url_hash_idx ON sns_analysis(url_hash);
CREATE INDEX IF NOT EXISTS sns_analysis_expires_idx ON sns_analysis(expires_at);
CREATE INDEX IF NOT EXISTS routes_user_id_idx ON routes(user_id);
CREATE INDEX IF NOT EXISTS routes_share_token_idx ON routes(share_token);
CREATE INDEX IF NOT EXISTS facilities_lat_lng_idx ON facilities(lat, lng);

-- ─── RLS 활성화 ────────────────────────────────────────────
ALTER TABLE places         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_analysis   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities     ENABLE ROW LEVEL SECURITY;

-- places: 모든 사용자 읽기 허용, 서버만 쓰기
CREATE POLICY "places_public_read" ON places FOR SELECT USING (true);

-- sns_analysis: 모든 사용자 읽기 허용 (결과 공유)
CREATE POLICY "sns_analysis_public_read" ON sns_analysis FOR SELECT USING (true);

-- user_personas: 본인만 접근
CREATE POLICY "user_personas_owner" ON user_personas
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- routes: 본인만 CRUD, 공유 토큰으로 읽기 허용
CREATE POLICY "routes_owner" ON routes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "routes_shared_read" ON routes
  FOR SELECT USING (share_token IS NOT NULL);

-- facilities: 모든 사용자 읽기 허용
CREATE POLICY "facilities_public_read" ON facilities FOR SELECT USING (true);

-- ─── updated_at 자동 갱신 트리거 ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
