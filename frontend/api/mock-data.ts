/**
 * Mock data for development and testing
 * Provides fallback data when API is unavailable
 */

export const MOCK_PLACES = [
  {
    id: 'seoul-cityhall-001',
    name: 'Seoul City Hall',
    lat: 37.5665,
    lng: 126.978,
    category: 'landmark',
    description: 'Historic government building and cultural space',
    images: ['https://via.placeholder.com/300x200?text=Seoul+City+Hall'],
    rating: 4.5,
    reviewCount: 1200,
  },
  {
    id: 'gyeongbokgung-001',
    name: 'Gyeongbokgung Palace',
    lat: 37.5796,
    lng: 126.977,
    category: 'historical',
    description: 'Grand palace of the Joseon Dynasty',
    images: ['https://via.placeholder.com/300x200?text=Gyeongbokgung'],
    rating: 4.7,
    reviewCount: 3500,
  },
  {
    id: 'bukchon-hanok-001',
    name: 'Bukchon Hanok Village',
    lat: 37.586,
    lng: 126.986,
    category: 'cultural',
    description: 'Traditional Korean houses and cultural district',
    images: ['https://via.placeholder.com/300x200?text=Bukchon'],
    rating: 4.6,
    reviewCount: 2800,
  },
];

export const MOCK_PLACE_DETAIL = {
  id: 'seoul-cityhall-001',
  name: 'Seoul City Hall',
  lat: 37.5665,
  lng: 126.978,
  category: 'landmark',
  description: 'Historic government building and cultural space',
  longDescription:
    'Seoul City Hall serves as the administrative center for the Seoul Metropolitan Government. The building features a blend of modern and traditional Korean architecture.',
  images: [
    'https://via.placeholder.com/400x300?text=Seoul+City+Hall+1',
    'https://via.placeholder.com/400x300?text=Seoul+City+Hall+2',
  ],
  rating: 4.5,
  reviewCount: 1200,
  operatingHours: {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '10:00-16:00',
    sunday: 'Closed',
  },
  phone: '02-1234-5678',
  website: 'https://example.com',
  address: '110 Taepyeongno, Jung-gu, Seoul',
  facilities: ['parking', 'restroom', 'wheelchair', 'cafe'],
};

export const MOCK_FACILITIES = [
  {
    id: 'restroom-001',
    name: 'Restroom',
    lat: 37.5665,
    lng: 126.978,
    category: 'restroom',
    distance: 50,
  },
  {
    id: 'atm-001',
    name: 'ATM',
    lat: 37.567,
    lng: 126.979,
    category: 'atm',
    distance: 100,
  },
  {
    id: 'cafe-001',
    name: 'Coffee Shop',
    lat: 37.568,
    lng: 126.977,
    category: 'cafe',
    distance: 150,
  },
];

export const MOCK_ANALYSIS_RESULT = {
  videoId: 'dQw4w9WgXcQ',
  title: 'K-Culture Travel Guide',
  places: [
    {
      id: 'seoul-cityhall-001',
      name: 'Seoul City Hall',
      lat: 37.5665,
      lng: 126.978,
      timestamp: 120,
      confidence: 0.95,
    },
    {
      id: 'gyeongbokgung-001',
      name: 'Gyeongbokgung Palace',
      lat: 37.5796,
      lng: 126.977,
      timestamp: 320,
      confidence: 0.88,
    },
  ],
};

export const MOCK_ROUTES = [
  {
    id: 'route-001',
    name: 'Seoul City Tour',
    description: 'A comprehensive tour of Seoul landmarks',
    theme: 'cultural',
    stops: [
      {
        id: 'stop-001',
        placeId: 'seoul-cityhall-001',
        placeName: 'Seoul City Hall',
        order: 1,
        lat: 37.5665,
        lng: 126.978,
        durationMinutes: 60,
      },
      {
        id: 'stop-002',
        placeId: 'gyeongbokgung-001',
        placeName: 'Gyeongbokgung Palace',
        order: 2,
        lat: 37.5796,
        lng: 126.977,
        durationMinutes: 90,
      },
    ],
    totalDistance: 2.5,
    totalDuration: 180,
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_PERSONA_THEMES = [
  {
    id: 'k-drama',
    name: 'K-Drama Lover',
    icon: '🎬',
    details: ['Iconic locations', 'Filming sites', 'Production studios'],
  },
  {
    id: 'food',
    name: 'Food Enthusiast',
    icon: '🍜',
    details: ['Street food', 'Fine dining', 'Local markets'],
  },
  {
    id: 'history',
    name: 'History Buff',
    icon: '🏛️',
    details: ['Palaces', 'Museums', 'Ancient sites'],
  },
];
