/**
 * Domain logic utilities - Business domain logic for features
 */

// Analysis
export { analyzeVideoContent, buildAnalysisLocalCacheKey, buildMockAnalysis, shouldCallAiWorker, isAnalysisLocale, type AnalysisLocale, type AnalysisPlace, type AnalysisResult } from './analysis';

// Crowd
export { toCrowdLevel, isCrowdLevel, CROWD_DOT_CLASS, CROWD_TEXT_CLASS, type CrowdLevel } from './crowd';

// Docent
export { generateDocentCaption } from './docent';

// Facilities
export { FACILITY_ICONS, FACILITY_NAMES, type FacilityCategory } from './facilities';

// Routes
export { 
  ROUTE_THEMES, 
  CURRENT_ROUTE_STORAGE_KEY,
  ROUTE_PROGRESS_STORAGE_KEY,
  ROUTE_THEME_OPTIONS,
  type RouteTheme,
  type RouteDetailOption,
  type RouteThemeOption,
  type RouteStop,
  type RoutePlan,
  type RouteLeg,
  type RouteProgressState,
  type LocalizedRouteOptionCopy,
  type LocalizedRoutePlanCopy,
  isRouteTheme,
  getRouteDetails,
  isRouteDetailForTheme,
  generateMockRoutePlan,
  calculateWalkingMinutes,
  calculateRouteLegs,
  createLocalRoutePlan,
  encodeRoutePlanForShare,
  decodeRoutePlanFromShare,
  buildLocalRouteShareUrl,
  createRouteProgressState,
  parseRouteProgressState,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  buildRouteMapUrl,
  buildRouteStopDetailUrl,
  formatDuration,
  parseStartTime,
  generateRouteDirections
} from './routes';

// YouTube
export { extractVideoId, detectSnsPlatform, getThumbnailUrl, isValidYoutubeUrl, isInstagramUrl, type SnsPlatform } from './youtube';

// Tour API
export { fetchTourApiData } from './tourapi';
