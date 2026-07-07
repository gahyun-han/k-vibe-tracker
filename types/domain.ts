/**
 * Core domain types for K-Vibe application
 */

// Place/Location types
export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  distance?: number;
}

export interface PlaceDetail extends Place {
  longDescription?: string;
  operatingHours?: {
    [key: string]: string;
  };
  phone?: string;
  website?: string;
  address?: string;
  facilities?: string[];
}

// Facility types
export type FacilityType =
  | 'restroom'
  | 'atm'
  | 'cafe'
  | 'restaurant'
  | 'medical'
  | 'pharmacy'
  | 'transport'
  | 'shopping'
  | 'event';

export interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: FacilityType;
  distance?: number;
  operatingHours?: string;
}

// Route types
export interface RouteStop {
  id: string;
  placeId: string;
  placeName: string;
  lat: number;
  lng: number;
  order: number;
  durationMinutes?: number;
  notes?: string;
  completed?: boolean;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  theme?: string;
  stops: RouteStop[];
  totalDistance?: number;
  totalDuration?: number;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

// Persona/Theme types
export type PersonaThemeId = 'k-drama' | 'food' | 'history' | 'shopping' | 'nature' | 'nightlife';

export interface PersonaTheme {
  id: PersonaThemeId;
  name: string;
  icon: string;
  details: string[];
  description?: string;
}

export interface PersonaDetail {
  id: string;
  name: string;
  description?: string;
}

// Analysis types
export interface VideoSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timestamp?: number;
  confidence?: number;
}

export interface AnalysisResult {
  videoId: string;
  title?: string;
  places: VideoSpot[];
  source: 'youtube' | 'instagram' | 'tiktok';
  analyzedAt: string;
}

// User/Profile types
export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    locale?: 'ko' | 'en' | 'ja' | 'zh';
  };
}

export interface SavedPlace extends Place {
  savedAt: string;
  userId?: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// UI state types
export interface ViewMode {
  type: 'mobile' | 'desktop';
  isSidebarOpen?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Crowd level type
export type CrowdLevel = 'empty' | 'quiet' | 'moderate' | 'busy' | 'very_busy';

export interface CrowdData {
  level: CrowdLevel;
  timestamp: string;
  forecast?: {
    time: string;
    level: CrowdLevel;
  }[];
}
