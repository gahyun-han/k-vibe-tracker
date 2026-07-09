/**
 * K-Content one-day route — hardcoded data layer.
 *
 * Models the provided DB table schema (USER / PERSONA / LOCATION / DOCENT /
 * USERROUTE) as hardcoded TypeScript seed data so the "K-콘텐츠 하루 루트
 * 만들기" feature works without a live database. When Supabase is wired later,
 * these shapes map 1:1 to the tables (oracle→supabase types noted below):
 *
 *   varchar2 → text | number → int2 | number(2,1) → float4 | boolean → bool
 *
 * - USER      : 서비스 회원 정보 (PK: username)
 * - PERSONA   : K-콘텐츠 페르소나 → 정렬된 장소 목록 (PK: id, FK: locationName)
 *               isUse(Y/N) 사용 여부, routeCnt 장소 수, order 노출 순서
 * - LOCATION  : 장소 상세 정보 (PK: name) town/rating/workingDay/openingHour/url
 * - DOCENT    : 장소별 다국어 도슨트 음성 파일 (PK: name)
 * - USERROUTE : 사용자가 저장한 루트 (PK: id) — 이 앱에서는 localStorage로 저장
 */
import {
  createLocalRoutePlan,
  parseStartTime,
  type CrowdLevel,
  type RoutePlan,
  type RouteStop,
  type RouteTheme,
} from './routes';
import { haversineKm, walkingMinutes } from '@/lib/features';

/** 지원 로케일별 텍스트 (ja/zh는 en으로 폴백) */
export interface LocalizedText {
  ko: string;
  en: string;
}

/** LOCATION 테이블 — 장소 상세 정보 (+ 앱에 필요한 좌표/카테고리) */
export interface KLocation {
  /** PK: 장소명 (한국어, 다른 테이블에서 FK로 참조) */
  name: string;
  /** 표시용 다국어 이름 */
  label: LocalizedText;
  town: string;
  /** number(2,1) → float4 */
  rating: number;
  /** 영업일 (ALL 또는 "MON,TUE" 형식) */
  workingDay: string;
  openingHour: string;
  locationUrl: string;
  lat: number;
  lng: number;
  category: string;
  crowdLevel: CrowdLevel;
  stayMinutes: number;
  description: LocalizedText;
  tags: string[];
}

/** DOCENT 테이블 — 장소별 다국어 도슨트 음성 파일 경로 */
export interface KDocent {
  /** PK: 장소명 (LOCATION.name 참조) */
  name: string;
  korean?: string;
  english?: string;
  chinese?: string;
  japanese?: string;
  german?: string;
  french?: string;
  russian?: string;
}

/** PERSONA 테이블 (집계) — 하나의 K-콘텐츠 페르소나가 정렬된 장소 목록을 가짐 */
export interface KPersona {
  /** PK: 페르소나 ID (예: BTS) */
  id: string;
  label: LocalizedText;
  /** 사용 여부 (Y/N → bool) */
  isUse: boolean;
  /** 장소 수 (number(2)) */
  routeCnt: number;
  /** 노출 순서 (number(3)) */
  order: number;
  /** 페르소나 설명 */
  description: LocalizedText;
  /** 뱃지에 표시할 짧은 코드 */
  badge: string;
  /** RoutePlan 호환용 테마 매핑 */
  theme: RouteTheme;
  /** 정렬된 LOCATION.name 목록 (PERSONA 행들의 order 순서) */
  locationNames: string[];
}

/** USER 테이블 (참고용 타입) */
export interface KUser {
  username: string;
  nationality: string;
  email: string;
  password: string;
}

/** USERROUTE 테이블 (참고용 타입) — 앱에서는 localStorage로 저장됨 */
export interface KUserRoute {
  id: string;
  username: string;
  order: number;
  location: string;
}

// ---------------------------------------------------------------------------
// LOCATION seed data — 실제 서울 K-콘텐츠 명소 (좌표 포함)
// ---------------------------------------------------------------------------
export const K_LOCATIONS: KLocation[] = [
  {
    name: '경복궁',
    label: { ko: '경복궁', en: 'Gyeongbokgung Palace' },
    town: '서울 종로구',
    rating: 4.6,
    workingDay: 'ALL',
    openingHour: '09:00~18:00',
    locationUrl: 'https://map.naver.com/p/search/경복궁',
    lat: 37.5796,
    lng: 126.977,
    category: 'K-Drama',
    crowdLevel: 'high',
    stayMinutes: 80,
    description: {
      ko: '한복을 입고 즐기는 조선의 정궁. K-드라마·아이돌 화보 단골 촬영지예요.',
      en: 'The main Joseon palace, a favorite hanbok photo and K-drama filming spot.',
    },
    tags: ['궁궐', '한복', '포토'],
  },
  {
    name: '북촌한옥마을',
    label: { ko: '북촌한옥마을', en: 'Bukchon Hanok Village' },
    town: '서울 종로구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '10:00~17:00',
    locationUrl: 'https://map.naver.com/p/search/북촌한옥마을',
    lat: 37.5826,
    lng: 126.983,
    category: 'K-Drama',
    crowdLevel: 'mid',
    stayMinutes: 50,
    description: {
      ko: '전통 한옥 골목이 이어지는 감성 산책 코스. 드라마 배경으로 자주 등장해요.',
      en: 'Traditional hanok alleys perfect for a scenic walk and drama backdrops.',
    },
    tags: ['한옥', '산책', '전통'],
  },
  {
    name: '덕수궁 돌담길',
    label: { ko: '덕수궁 돌담길', en: 'Deoksugung Doldam-gil' },
    town: '서울 중구',
    rating: 4.4,
    workingDay: 'ALL',
    openingHour: '24시간',
    locationUrl: 'https://map.naver.com/p/search/덕수궁 돌담길',
    lat: 37.5658,
    lng: 126.9751,
    category: 'K-Drama',
    crowdLevel: 'low',
    stayMinutes: 40,
    description: {
      ko: '단풍과 조명이 아름다운 로맨스 드라마의 산책길이에요.',
      en: 'A romantic tree-lined stone-wall path loved by K-drama couples.',
    },
    tags: ['산책', '로맨스', '야경'],
  },
  {
    name: '명동',
    label: { ko: '명동', en: 'Myeongdong' },
    town: '서울 중구',
    rating: 4.1,
    workingDay: 'ALL',
    openingHour: '10:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/명동',
    lat: 37.5637,
    lng: 126.985,
    category: 'Shopping',
    crowdLevel: 'high',
    stayMinutes: 60,
    description: {
      ko: '화장품·길거리 음식·쇼핑이 모인 서울 대표 번화가예요.',
      en: "Seoul's iconic shopping street packed with cosmetics and street food.",
    },
    tags: ['쇼핑', '길거리음식', '뷰티'],
  },
  {
    name: '남산서울타워',
    label: { ko: '남산서울타워', en: 'N Seoul Tower' },
    town: '서울 용산구',
    rating: 4.4,
    workingDay: 'ALL',
    openingHour: '10:00~23:00',
    locationUrl: 'https://map.naver.com/p/search/남산서울타워',
    lat: 37.5512,
    lng: 126.9882,
    category: 'Night view',
    crowdLevel: 'high',
    stayMinutes: 70,
    description: {
      ko: '서울 전경과 야경을 한눈에. 사랑의 자물쇠로도 유명해요.',
      en: 'Panoramic city and night views, famous for its love-lock terrace.',
    },
    tags: ['야경', '전망', '데이트'],
  },
  {
    name: '홍대거리',
    label: { ko: '홍대거리', en: 'Hongdae Street' },
    town: '서울 마포구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '24시간',
    locationUrl: 'https://map.naver.com/p/search/홍대거리',
    lat: 37.5563,
    lng: 126.9236,
    category: 'K-pop',
    crowdLevel: 'high',
    stayMinutes: 70,
    description: {
      ko: '버스킹과 인디 문화, 포토부스가 가득한 청춘의 거리예요.',
      en: 'A youthful street full of busking, indie culture, and photo booths.',
    },
    tags: ['버스킹', '포토부스', '청춘'],
  },
  {
    name: '이태원',
    label: { ko: '이태원', en: 'Itaewon' },
    town: '서울 용산구',
    rating: 4.0,
    workingDay: 'ALL',
    openingHour: '12:00~24:00',
    locationUrl: 'https://map.naver.com/p/search/이태원',
    lat: 37.5345,
    lng: 126.9946,
    category: 'Food',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '세계 각국의 음식과 감각적인 바가 모인 다국적 거리예요.',
      en: 'A multicultural district of global cuisine and stylish bars.',
    },
    tags: ['맛집', '바', '이국적'],
  },
  {
    name: '반포한강공원',
    label: { ko: '반포한강공원', en: 'Banpo Hangang Park' },
    town: '서울 서초구',
    rating: 4.5,
    workingDay: 'ALL',
    openingHour: '24시간',
    locationUrl: 'https://map.naver.com/p/search/반포한강공원',
    lat: 37.51,
    lng: 126.9955,
    category: 'Night view',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '달빛무지개분수와 함께 즐기는 한강 피크닉 명소예요.',
      en: 'A riverside picnic spot with the Moonlight Rainbow Fountain show.',
    },
    tags: ['한강', '피크닉', '분수'],
  },
  {
    name: '성수동 카페거리',
    label: { ko: '성수동 카페거리', en: 'Seongsu Cafe Street' },
    town: '서울 성동구',
    rating: 4.4,
    workingDay: 'ALL',
    openingHour: '11:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/성수동 카페거리',
    lat: 37.5445,
    lng: 127.0559,
    category: 'Cafe',
    crowdLevel: 'high',
    stayMinutes: 60,
    description: {
      ko: '공장을 개조한 힙한 카페와 팝업 스토어가 가득한 거리예요.',
      en: 'Trendy warehouse-turned cafes and pop-up stores line this street.',
    },
    tags: ['카페', '팝업', '힙플'],
  },
  {
    name: '동대문디자인플라자',
    label: { ko: '동대문디자인플라자(DDP)', en: 'Dongdaemun Design Plaza (DDP)' },
    town: '서울 중구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '10:00~20:00',
    locationUrl: 'https://map.naver.com/p/search/동대문디자인플라자',
    lat: 37.5665,
    lng: 127.0092,
    category: 'Landmark',
    crowdLevel: 'mid',
    stayMinutes: 50,
    description: {
      ko: '곡선 건축이 인상적인 디자인 랜드마크. 패션쇼·전시가 자주 열려요.',
      en: 'A curved architectural landmark hosting fashion shows and exhibitions.',
    },
    tags: ['건축', '전시', '패션'],
  },
  {
    name: '압구정로데오',
    label: { ko: '압구정로데오', en: 'Apgujeong Rodeo' },
    town: '서울 강남구',
    rating: 4.1,
    workingDay: 'ALL',
    openingHour: '11:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/압구정로데오',
    lat: 37.5273,
    lng: 127.0388,
    category: 'Shopping',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '명품 편집숍과 셀럽 맛집이 모인 강남의 세련된 거리예요.',
      en: "Gangnam's chic street of designer boutiques and celebrity eateries.",
    },
    tags: ['럭셔리', '패션', '셀럽'],
  },
  {
    name: '익선동 한옥거리',
    label: { ko: '익선동 한옥거리', en: 'Ikseon-dong Hanok Street' },
    town: '서울 종로구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '11:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/익선동',
    lat: 37.574,
    lng: 126.991,
    category: 'Cafe',
    crowdLevel: 'mid',
    stayMinutes: 55,
    description: {
      ko: '한옥을 개조한 레트로 감성 카페와 소품샵이 가득한 골목이에요.',
      en: 'Retro hanok cafes and boutique shops fill this charming alley.',
    },
    tags: ['한옥', '레트로', '카페'],
  },
];

const LOCATION_BY_NAME = new Map(K_LOCATIONS.map((location) => [location.name, location]));

// ---------------------------------------------------------------------------
// DOCENT seed data
// ---------------------------------------------------------------------------
export const K_DOCENTS: KDocent[] = [
  {
    name: '경복궁',
    korean: 'docent/gyeongbokgung/ko.mp3',
    english: 'docent/gyeongbokgung/en.mp3',
  },
  {
    name: '남산서울타워',
    korean: 'docent/namsan-tower/ko.mp3',
    english: 'docent/namsan-tower/en.mp3',
  },
  {
    name: '북촌한옥마을',
    korean: 'docent/bukchon/ko.mp3',
  },
];

const DOCENT_BY_NAME = new Map(K_DOCENTS.map((docent) => [docent.name, docent]));

// ---------------------------------------------------------------------------
// PERSONA seed data (aggregated) — 정렬된 장소 목록
// ---------------------------------------------------------------------------
export const K_PERSONAS: KPersona[] = [
  {
    id: 'BTS',
    label: { ko: 'BTS', en: 'BTS' },
    isUse: true,
    routeCnt: 5,
    order: 1,
    badge: 'BTS',
    theme: 'kpop',
    description: {
      ko: '멤버들의 화보·뮤비 촬영지와 서울 대표 명소를 잇는 성지순례 코스.',
      en: 'A pilgrimage linking BTS photo/MV spots with iconic Seoul landmarks.',
    },
    locationNames: ['경복궁', '남산서울타워', '홍대거리', '이태원', '반포한강공원'],
  },
  {
    id: 'BLACKPINK',
    label: { ko: '블랙핑크', en: 'BLACKPINK' },
    isUse: true,
    routeCnt: 4,
    order: 2,
    badge: 'BP',
    theme: 'kpop',
    description: {
      ko: '트렌디한 카페와 럭셔리 쇼핑, 야경까지 즐기는 걸크러시 코스.',
      en: 'A girl-crush route of trendy cafes, luxury shopping, and night views.',
    },
    locationNames: ['성수동 카페거리', '압구정로데오', '동대문디자인플라자', '남산서울타워'],
  },
  {
    id: 'NEWJEANS',
    label: { ko: '뉴진스', en: 'NewJeans' },
    isUse: true,
    routeCnt: 4,
    order: 3,
    badge: 'NJ',
    theme: 'kpop',
    description: {
      ko: '레트로 감성과 청춘 무드가 어우러진 Y2K 스타일 코스.',
      en: 'A Y2K-style route blending retro moods with youthful energy.',
    },
    locationNames: ['익선동 한옥거리', '성수동 카페거리', '홍대거리', '반포한강공원'],
  },
  {
    id: 'KDRAMA',
    label: { ko: 'K-드라마', en: 'K-Drama' },
    isUse: true,
    routeCnt: 4,
    order: 4,
    badge: 'DRA',
    theme: 'drama',
    description: {
      ko: '궁궐과 한옥 골목, 돌담길을 따라 걷는 명장면 로케이션 코스.',
      en: 'Walk famous drama scenes through palaces, hanok alleys, and stone paths.',
    },
    locationNames: ['경복궁', '북촌한옥마을', '덕수궁 돌담길', '명동'],
  },
];

// ---------------------------------------------------------------------------
// Accessors + route builder
// ---------------------------------------------------------------------------

/** 사용 중(isUse)인 페르소나를 노출 순서(order)대로 반환 */
export function getKContentPersonas(): KPersona[] {
  return K_PERSONAS.filter((persona) => persona.isUse).sort((a, b) => a.order - b.order);
}

export function getKPersona(id: string): KPersona | undefined {
  return K_PERSONAS.find((persona) => persona.id === id);
}

export function getKLocation(name: string): KLocation | undefined {
  return LOCATION_BY_NAME.get(name);
}

export function getKDocent(name: string): KDocent | undefined {
  return DOCENT_BY_NAME.get(name);
}

function pickText(text: LocalizedText, locale: string): string {
  return locale === 'ko' ? text.ko : text.en;
}

function formatClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

interface BuildKContentRoutePlanInput {
  personaId: string;
  startTime?: string;
  locale?: string;
}

/**
 * 페르소나 ID로 하드코딩된 하루 루트(RoutePlan)를 생성한다.
 * PERSONA.locationNames → LOCATION 매핑 → 좌표 기반 이동시간으로 방문 시각 계산.
 * (스키마 노트대로 존재하지 않는 LOCATION은 건너뛰어 방어적으로 처리)
 */
export function buildKContentRoutePlan({
  personaId,
  startTime = '10:00',
  locale = 'ko',
}: BuildKContentRoutePlanInput): RoutePlan | null {
  const persona = getKPersona(personaId);
  if (!persona) return null;

  const locations = persona.locationNames
    .map((name) => getKLocation(name))
    .filter((location): location is KLocation => Boolean(location));

  if (locations.length === 0) return null;

  const startMinutes = parseStartTime(startTime) ?? 600;
  let cursor = startMinutes;

  const stops: RouteStop[] = locations.map((location, index) => {
    if (index > 0) {
      const prev = locations[index - 1]!;
      cursor += walkingMinutes(haversineKm(prev.lat, prev.lng, location.lat, location.lng));
    }

    const stop: RouteStop = {
      id: `${persona.id}-${location.name}`,
      name: pickText(location.label, locale),
      category: location.category,
      address: `${location.town} · ⭐${location.rating.toFixed(1)} · ${location.openingHour}`,
      crowdLevel: location.crowdLevel,
      lat: location.lat,
      lng: location.lng,
      stayMinutes: location.stayMinutes,
      startTime: formatClock(cursor),
      description: pickText(location.description, locale),
      tags: location.tags,
    };

    cursor += location.stayMinutes;
    return stop;
  });

  const personaLabel = pickText(persona.label, locale);
  const title = locale === 'ko' ? `${personaLabel} 하루 루트` : `${personaLabel} One-Day Route`;
  const summary = pickText(persona.description, locale);

  return createLocalRoutePlan({
    id: `kcontent-${persona.id}`,
    title,
    theme: persona.theme,
    detail: persona.id,
    summary,
    stops,
  });
}
