/**
 * K-Content one-day route data layer.
 *
 * Models the provided DB table schema (USER / PERSONA_IMAGE / PERSONA /
 * LOCATION / DOCENT / USERROUTE) as the app's local route catalog so the
 * "K-콘텐츠 하루 루트 만들기" feature works before the live database is connected.
 * When Supabase is wired later, these shapes map 1:1 to the tables
 * (oracle→supabase types noted below):
 *
 *   varchar2 → text | number → int2 | number(2,1) → float4 | boolean → bool
 *
 * - USER      : 서비스 회원 정보 (PK: username)
 * - PERSONA_IMAGE : 페르소나 프로필 이미지 (PK: name)
 * - PERSONA   : K-콘텐츠 페르소나 → 정렬된 장소 목록 (PK: id, FK: locationName)
 *               isUse(Y/N) 사용 여부, routeCnt 장소 수, order 노출 순서
 * - LOCATION  : 장소 상세 정보 (PK: name) town/rating/workingDay/openingHour/url
 * - DOCENT    : 장소별 다국어 도슨트 음성 파일 (PK: name)
 * - USERROUTE : 사용자가 저장한 루트 (PK: id) — 이 앱에서는 localStorage로 저장
 */
import { haversineKm, walkingMinutes } from '@/lib/features';
import {
  createLocalRoutePlan,
  parseStartTime,
  type CrowdLevel,
  type RoutePlan,
  type RouteStop,
  type RouteTheme,
} from './routes';

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

/** PERSONA_IMAGE 테이블 — 페르소나 프로필 이미지 */
export interface KPersonaImage {
  name: string;
  profileImg: string;
}

/** PERSONA 테이블 (집계) — 하나의 K-콘텐츠 페르소나가 정렬된 장소 목록을 가짐 */
export interface KPersona {
  /** PK: 페르소나 ID (예: BTS) */
  id: string;
  label: LocalizedText;
  profileImg?: string;
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
// LOCATION catalog — 실제 서울 K-콘텐츠 명소 (지도 표시용 좌표 포함)
// ---------------------------------------------------------------------------
export const K_LOCATIONS: KLocation[] = [
  {
    name: '남산타워',
    label: { ko: '남산타워', en: 'N Seoul Tower' },
    town: '서울 용산구',
    rating: 4.4,
    workingDay: 'ALL',
    openingHour: '10:00~23:00',
    locationUrl: 'https://map.naver.com/p/search/%EB%82%A8%EC%82%B0%ED%83%80%EC%9B%8C',
    lat: 37.5512,
    lng: 126.9882,
    category: 'View',
    crowdLevel: 'high',
    stayMinutes: 70,
    description: {
      ko: '서울 전경과 야경을 한눈에 담을 수 있는 대표 전망 명소예요.',
      en: 'An iconic Seoul viewpoint for skyline photos and night views.',
    },
    tags: ['전망', '야경', '포토'],
  },
  {
    name: '경복궁',
    label: { ko: '경복궁', en: 'Gyeongbokgung Palace' },
    town: '서울 종로구',
    rating: 4.3,
    workingDay: 'TUE',
    openingHour: '09:00~18:00',
    locationUrl: 'https://map.naver.com/p/search/%EA%B2%BD%EB%B3%B5%EA%B6%81',
    lat: 37.5796,
    lng: 126.977,
    category: 'Culture',
    crowdLevel: 'high',
    stayMinutes: 80,
    description: {
      ko: '한복 사진과 전통 궁궐 동선이 잘 어울리는 서울 대표 문화 명소예요.',
      en: 'A signature palace stop for hanbok photos and classic Seoul heritage.',
    },
    tags: ['궁궐', '한복', '전통'],
  },
  {
    name: '익선동 온천집',
    label: { ko: '익선동 온천집', en: 'Oncheonjip Ikseon' },
    town: '서울 종로구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '11:30~21:30',
    locationUrl: 'https://map.naver.com/p/search/%EC%9D%B5%EC%84%A0%EB%8F%99%20%EC%98%A8%EC%B2%9C%EC%A7%91',
    lat: 37.573,
    lng: 126.9892,
    category: 'Food',
    crowdLevel: 'mid',
    stayMinutes: 65,
    description: {
      ko: '익선동 한옥 골목의 분위기와 식사 동선을 함께 잡기 좋은 맛집 스팟이에요.',
      en: 'A dining stop tucked into Ikseon-dong hanok alleys.',
    },
    tags: ['맛집', '한옥', '익선동'],
  },
  {
    name: '성수동 대림창고',
    label: { ko: '성수동 대림창고', en: 'Daelim Changgo Seongsu' },
    town: '서울 성동구',
    rating: 4.0,
    workingDay: 'ALL',
    openingHour: '10:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%84%B1%EC%88%98%EB%8F%99%20%EB%8C%80%EB%A6%BC%EC%B0%BD%EA%B3%A0',
    lat: 37.5419,
    lng: 127.0545,
    category: 'Cafe',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '성수의 산업 감성과 카페 문화가 만나는 대표 포토 스팟이에요.',
      en: 'A signature Seongsu cafe and photo stop with warehouse charm.',
    },
    tags: ['카페', '성수', '포토'],
  },
  {
    name: '뚝섬한강공원',
    label: { ko: '뚝섬한강공원', en: 'Ttukseom Hangang Park' },
    town: '서울 광진구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '00:00~24:00',
    locationUrl: 'https://map.naver.com/p/search/%EB%9A%9D%EC%84%AC%ED%95%9C%EA%B0%95%EA%B3%B5%EC%9B%90',
    lat: 37.5297,
    lng: 127.069,
    category: 'River',
    crowdLevel: 'mid',
    stayMinutes: 65,
    description: {
      ko: '한강 피크닉과 노을 사진을 곁들이기 좋은 여유로운 마무리 코스예요.',
      en: 'A relaxed riverside stop for picnic pacing and sunset photos.',
    },
    tags: ['한강', '피크닉', '노을'],
  },
  {
    name: '체부동잔치집',
    label: { ko: '체부동잔치집', en: 'Chebudong Janchi-jip' },
    town: '서울 종로구',
    rating: 4.5,
    workingDay: 'ALL',
    openingHour: '11:00~22:30',
    locationUrl: 'https://map.naver.com/p/search/%EC%B2%B4%EB%B6%80%EB%8F%99%EC%9E%94%EC%B9%98%EC%A7%91',
    lat: 37.5787,
    lng: 126.9708,
    category: 'Food',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '서촌 산책 전후로 들르기 좋은 든든한 한식 맛집이에요.',
      en: 'A hearty Korean food stop near Seochon and Gyeongbokgung.',
    },
    tags: ['한식', '서촌', '식사'],
  },
  {
    name: '도산공원',
    label: { ko: '도산공원', en: 'Dosan Park' },
    town: '서울 강남구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '06:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/%EB%8F%84%EC%82%B0%EA%B3%B5%EC%9B%90',
    lat: 37.5247,
    lng: 127.0355,
    category: 'Park',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '압구정·청담 동선 사이에서 쉬어가기 좋은 세련된 공원 스팟이에요.',
      en: 'A polished park stop between Apgujeong and Cheongdam routes.',
    },
    tags: ['공원', '강남', '산책'],
  },
  {
    name: '이화동 벽화마을',
    label: { ko: '이화동 벽화마을', en: 'Ihwa Mural Village' },
    town: '서울 종로구',
    rating: 3.9,
    workingDay: 'ALL',
    openingHour: '00:00~24:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%9D%B4%ED%99%94%EB%8F%99%20%EB%B2%BD%ED%99%94%EB%A7%88%EC%9D%84',
    lat: 37.5804,
    lng: 127.0074,
    category: 'Photo',
    crowdLevel: 'mid',
    stayMinutes: 55,
    description: {
      ko: '언덕 골목과 벽화가 이어지는 감성 산책·사진 코스예요.',
      en: 'A hillside mural village for photo walks and neighborhood views.',
    },
    tags: ['벽화', '산책', '포토'],
  },
  {
    name: '청수당',
    label: { ko: '청수당', en: 'Cheongsudang' },
    town: '서울 종로구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '10:30~21:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%B2%AD%EC%88%98%EB%8B%B9',
    lat: 37.5737,
    lng: 126.9894,
    category: 'Cafe',
    crowdLevel: 'high',
    stayMinutes: 55,
    description: {
      ko: '익선동의 정원 감성과 디저트를 함께 즐길 수 있는 인기 카페예요.',
      en: 'A popular Ikseon-dong cafe with garden mood and desserts.',
    },
    tags: ['카페', '디저트', '익선동'],
  },
  {
    name: '삼청동수제비',
    label: { ko: '삼청동수제비', en: 'Samcheongdong Sujebi' },
    town: '서울 종로구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '11:00~20:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%82%BC%EC%B2%AD%EB%8F%99%EC%88%98%EC%A0%9C%EB%B9%84',
    lat: 37.584,
    lng: 126.9819,
    category: 'Food',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '삼청동 골목 산책과 함께 묶기 좋은 대표 한식 식사 코스예요.',
      en: 'A classic Korean comfort-food stop near Samcheong-dong alleys.',
    },
    tags: ['수제비', '한식', '삼청동'],
  },
  {
    name: '10 꼬르소꼬모 서울',
    label: { ko: '10 꼬르소꼬모 서울', en: '10 Corso Como Seoul' },
    town: '서울 강남구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '12:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/10%20%EA%BC%AC%EB%A5%B4%EC%86%8C%EA%BC%AC%EB%AA%A8%20%EC%84%9C%EC%9A%B8',
    lat: 37.5249,
    lng: 127.0411,
    category: 'Shopping',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '패션·라이프스타일 감성을 한 번에 담기 좋은 청담 쇼핑 스팟이에요.',
      en: 'A Cheongdam fashion and lifestyle stop for style-led routes.',
    },
    tags: ['패션', '청담', '쇼핑'],
  },
  {
    name: '나이키 압구정',
    label: { ko: '나이키 압구정', en: 'Nike Apgujeong' },
    town: '서울 강남구',
    rating: 4.5,
    workingDay: 'ALL',
    openingHour: '10:30~21:30',
    locationUrl: 'https://map.naver.com/p/search/%EB%82%98%EC%9D%B4%ED%82%A4%20%EC%95%95%EA%B5%AC%EC%A0%95',
    lat: 37.5272,
    lng: 127.0389,
    category: 'Shopping',
    crowdLevel: 'mid',
    stayMinutes: 45,
    description: {
      ko: '압구정 패션 동선에 넣기 좋은 스포츠·스트리트 무드의 쇼핑 스팟이에요.',
      en: 'A sport and street-style shopping stop in Apgujeong.',
    },
    tags: ['스포츠', '패션', '압구정'],
  },
  {
    name: '패션5 한남점',
    label: { ko: '패션5 한남점', en: 'Passion 5 Hannam' },
    town: '서울 용산구',
    rating: 4.3,
    workingDay: 'ALL',
    openingHour: '07:30~22:00',
    locationUrl: 'https://map.naver.com/p/search/%ED%8C%A8%EC%85%985%20%ED%95%9C%EB%82%A8%EC%A0%90',
    lat: 37.5346,
    lng: 127.0002,
    category: 'Dessert',
    crowdLevel: 'high',
    stayMinutes: 55,
    description: {
      ko: '디저트와 베이커리를 중심으로 한남동 감성을 쉬어가기 좋은 곳이에요.',
      en: 'A Hannam dessert and bakery stop with polished cafe energy.',
    },
    tags: ['디저트', '한남', '베이커리'],
  },
  {
    name: '장진우식당',
    label: { ko: '장진우식당', en: 'Jang Jinwoo Restaurant' },
    town: '서울 용산구',
    rating: 4.1,
    workingDay: '화,수 휴무',
    openingHour: '평일 17:00~22:00 / 주말 12:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%9E%A5%EC%A7%84%EC%9A%B0%EC%8B%9D%EB%8B%B9',
    lat: 37.5402,
    lng: 126.9918,
    category: 'Food',
    crowdLevel: 'mid',
    stayMinutes: 70,
    description: {
      ko: '한남·이태원 저녁 동선에 어울리는 분위기 있는 식사 스팟이에요.',
      en: 'A dinner-friendly stop around Hannam and Itaewon.',
    },
    tags: ['식사', '한남', '이태원'],
  },
  {
    name: '서울스카이',
    label: { ko: '서울스카이', en: 'Seoul Sky' },
    town: '서울 송파구',
    rating: 4.5,
    workingDay: 'ALL',
    openingHour: '10:30~22:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EC%8A%A4%EC%B9%B4%EC%9D%B4',
    lat: 37.5125,
    lng: 127.1025,
    category: 'View',
    crowdLevel: 'high',
    stayMinutes: 80,
    description: {
      ko: '잠실의 높은 전망과 도시 스케일을 한 번에 느낄 수 있는 코스예요.',
      en: 'A high-rise viewpoint that anchors the Jamsil skyline route.',
    },
    tags: ['전망', '잠실', '스카이'],
  },
  {
    name: '석촌호수',
    label: { ko: '석촌호수', en: 'Seokchon Lake' },
    town: '서울 송파구',
    rating: 4.4,
    workingDay: 'ALL',
    openingHour: '00:00~24:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%84%9D%EC%B4%8C%ED%98%B8%EC%88%98',
    lat: 37.5083,
    lng: 127.1041,
    category: 'Lake',
    crowdLevel: 'mid',
    stayMinutes: 55,
    description: {
      ko: '잠실 일정 사이에 산책과 사진을 넣기 좋은 호수 둘레길이에요.',
      en: 'A lakeside walking stop that pairs naturally with Jamsil landmarks.',
    },
    tags: ['호수', '산책', '잠실'],
  },
  {
    name: '성수연방',
    label: { ko: '성수연방', en: 'Seongsu Yeonbang' },
    town: '서울 성동구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '10:00~22:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%84%B1%EC%88%98%EC%97%B0%EB%B0%A9',
    lat: 37.543,
    lng: 127.0547,
    category: 'Lifestyle',
    crowdLevel: 'mid',
    stayMinutes: 60,
    description: {
      ko: '성수의 라이프스타일 매장과 카페를 한 번에 둘러보기 좋은 복합 공간이에요.',
      en: 'A Seongsu lifestyle complex for cafes, shops, and design browsing.',
    },
    tags: ['성수', '라이프스타일', '카페'],
  },
  {
    name: '반포 세빛섬',
    label: { ko: '반포 세빛섬', en: 'Sebitseom Banpo' },
    town: '서울 서초구',
    rating: 4.2,
    workingDay: 'ALL',
    openingHour: '10:00~23:00',
    locationUrl: 'https://map.naver.com/p/search/%EB%B0%98%ED%8F%AC%20%EC%84%B8%EB%B9%9B%EC%84%AC',
    lat: 37.5126,
    lng: 126.9957,
    category: 'River',
    crowdLevel: 'mid',
    stayMinutes: 65,
    description: {
      ko: '한강 야경과 반포 동선을 함께 잡기 좋은 수변 랜드마크예요.',
      en: 'A riverside landmark for Banpo night views and bridge routes.',
    },
    tags: ['한강', '야경', '반포'],
  },
  {
    name: '잠원한강공원',
    label: { ko: '잠원한강공원', en: 'Jamwon Hangang Park' },
    town: '서울 서초구',
    rating: 4.0,
    workingDay: 'ALL',
    openingHour: '00:00~24:00',
    locationUrl: 'https://map.naver.com/p/search/%EC%9E%A0%EC%9B%90%ED%95%9C%EA%B0%95%EA%B3%B5%EC%9B%90',
    lat: 37.5205,
    lng: 127.012,
    category: 'River',
    crowdLevel: 'low',
    stayMinutes: 55,
    description: {
      ko: '강남권 한강 산책과 휴식 동선에 맞는 여유로운 공원 스팟이에요.',
      en: 'A quieter riverside park for Gangnam-area walking and recovery time.',
    },
    tags: ['한강', '공원', '산책'],
  },
];

const LOCATION_BY_NAME = new Map(K_LOCATIONS.map((location) => [location.name, location]));

// ---------------------------------------------------------------------------
// DOCENT catalog
// ---------------------------------------------------------------------------
export const K_DOCENTS: KDocent[] = [
  {
    name: '경복궁',
    korean: 'docent/gyeongbokgung/ko.mp3',
    english: 'docent/gyeongbokgung/en.mp3',
  },
  {
    name: '남산타워',
    korean: 'docent/namsan-tower/ko.mp3',
    english: 'docent/namsan-tower/en.mp3',
  },
];

const DOCENT_BY_NAME = new Map(K_DOCENTS.map((docent) => [docent.name, docent]));

// ---------------------------------------------------------------------------
// PERSONA_IMAGE catalog
// ---------------------------------------------------------------------------
export const K_PERSONA_IMAGES: KPersonaImage[] = [
  {
    name: 'BTS뷔',
    profileImg:
      'https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcSVGz6JfFl0_D1sD_25wk6lOy1prLYqWgs4FAAwMI3ku4UQeioKWq8ncDWmFf3mkHevabw3qu7GWtnA8uU',
  },
  {
    name: '아이유',
    profileImg:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFBRYXIQjeINFYnz5HUcwDGXcthsJQGrZuSzEgZ3NyJaX-4aCiiWz1HZwRUz0EP68jOn4xQXoxhUFBhAmrHlsMx8cGHYJnZMSdARrH0GM&s=10',
  },
  {
    name: '제니',
    profileImg:
      'https://i.namu.wiki/i/enCUBDXgjFR3bLBFx9M3hpGtEq1AYjNPU75fDxYtkEHPoZG1MTORb7haPMG0lZKHMQpHF7CFm3K8krWZTTA5zw.webp',
  },
  {
    name: '장원영',
    profileImg:
      'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQd_jr6bqPrC7F-u59fAzuyur7EOtQjIS2TQE4uQwDZi9TK1g5NVocxR8FeOl1bAHHWBSAsxYmdF2FmNUY',
  },
];

const PERSONA_IMAGE_BY_NAME = new Map(
  K_PERSONA_IMAGES.map((personaImage) => [personaImage.name, personaImage.profileImg]),
);

// ---------------------------------------------------------------------------
// PERSONA catalog (aggregated) — 정렬된 장소 목록
// ---------------------------------------------------------------------------
export const K_PERSONAS: KPersona[] = [
  {
    id: 'BTS뷔',
    label: { ko: 'BTS뷔', en: 'BTS V' },
    profileImg: PERSONA_IMAGE_BY_NAME.get('BTS뷔')!,
    isUse: true,
    routeCnt: 5,
    order: 1,
    badge: 'V',
    theme: 'kpop',
    description: {
      ko: '전망, 궁궐, 익선동·성수 감성을 잇는 서울 하루 성지순례 코스.',
      en: 'A Seoul day route linking views, palace scenery, Ikseon-dong, and Seongsu.',
    },
    locationNames: ['남산타워', '경복궁', '익선동 온천집', '성수동 대림창고', '뚝섬한강공원'],
  },
  {
    id: '아이유',
    label: { ko: '아이유', en: 'IU' },
    profileImg: PERSONA_IMAGE_BY_NAME.get('아이유')!,
    isUse: true,
    routeCnt: 5,
    order: 2,
    badge: 'IU',
    theme: 'mood',
    description: {
      ko: '서촌 한식, 감성 카페, 벽화마을과 삼청동을 연결한 차분한 감성 코스.',
      en: 'A mellow Seoul route through Seochon food, cafes, murals, and Samcheong-dong.',
    },
    locationNames: ['체부동잔치집', '도산공원', '이화동 벽화마을', '청수당', '삼청동수제비'],
  },
  {
    id: '제니',
    label: { ko: '제니', en: 'Jennie' },
    profileImg: PERSONA_IMAGE_BY_NAME.get('제니')!,
    isUse: true,
    routeCnt: 5,
    order: 3,
    badge: 'JEN',
    theme: 'creator',
    description: {
      ko: '청담·압구정 쇼핑, 도산공원, 한남 디저트와 식사를 잇는 스타일 코스.',
      en: 'A style-led route through Cheongdam, Apgujeong, Dosan Park, Hannam dessert, and dinner.',
    },
    locationNames: ['10 꼬르소꼬모 서울', '나이키 압구정', '도산공원', '패션5 한남점', '장진우식당'],
  },
  {
    id: '장원영',
    label: { ko: '장원영', en: 'Jang Wonyoung' },
    profileImg: PERSONA_IMAGE_BY_NAME.get('장원영')!,
    isUse: true,
    routeCnt: 4,
    order: 4,
    badge: 'WY',
    theme: 'kpop',
    description: {
      ko: '잠실 전망과 호수, 성수 라이프스타일, 반포 야경을 잇는 화사한 도시 코스.',
      en: 'A bright city route through Jamsil views, Seongsu lifestyle spots, and Banpo night scenery.',
    },
    locationNames: ['서울스카이', '석촌호수', '성수연방', '반포 세빛섬'],
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
 * 페르소나 ID로 하루 루트(RoutePlan)를 생성한다.
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
