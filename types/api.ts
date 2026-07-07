/**
 * API request and response types
 */

import type { Place, PlaceDetail, Facility, AnalysisResult, Route, PersonaTheme } from './domain';

// Places API
export interface PlacesApiResponse {
  places: Place[];
  cached: boolean;
  source: 'mock' | 'tourapi' | 'cache';
  cache_key: string;
  total?: number;
}

export interface PlaceDetailApiResponse {
  detail: PlaceDetail;
  cached: boolean;
  source: 'mock' | 'tourapi' | 'cache';
  cache_key: string;
}

// Facilities API
export interface FacilitiesApiResponse {
  facilities: Facility[];
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
}

// Analysis API
export interface AnalyzeRequest {
  url: string;
  type: 'youtube' | 'instagram';
}

export interface AnalyzeApiResponse {
  result: AnalysisResult;
  status: 'completed' | 'processing' | 'failed';
  requestId: string;
}

// Routes API
export interface GenerateRouteRequest {
  places: string[]; // place IDs
  theme?: string;
  options?: {
    optimize?: boolean;
    avoidHighways?: boolean;
  };
}

export interface GenerateRouteApiResponse {
  route: Route;
  estimatedDuration: number;
  estimatedDistance: number;
}

export interface UpdateRouteRequest {
  id: string;
  updates: Partial<Route>;
}

export interface RouteShareResponse {
  shareUrl: string;
  shareCode: string;
  expiresAt?: string;
}

// Persona API
export interface PersonaThemesApiResponse {
  themes: PersonaTheme[];
}

// Error Response
export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Search params
export interface PlacesSearchParams extends PaginationParams {
  lat?: number;
  lng?: number;
  radius?: number;
  category?: string;
  keyword?: string;
  rating?: number;
}
