'use client';

export type KakaoLatLng = new (lat: number, lng: number) => unknown;

export type KakaoLatLngBounds = {
  extend: (latLng: unknown) => void;
};

export type KakaoMap = {
  setCenter: (latLng: unknown) => void;
  setLevel?: (level: number) => void;
  setBounds?: (bounds: unknown) => void;
  relayout?: () => void;
};

export type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
};

export type KakaoPolyline = {
  setMap: (map: KakaoMap | null) => void;
};

export interface KakaoMapsApi {
  load: (callback: () => void) => void;
  LatLng: KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMap;
  CustomOverlay?: new (options: {
    position: unknown;
    content: HTMLElement;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
    clickable?: boolean;
  }) => KakaoCustomOverlay;
  Polyline?: new (options: {
    path: unknown[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
  }) => KakaoPolyline;
}

declare global {
  interface Window {
    kakao?: {
      maps?: KakaoMapsApi;
    };
  }
}

const KAKAO_SCRIPT_ID = 'kakao-map-sdk';

export const KAKAO_MAP_KEY = process.env['NEXT_PUBLIC_KAKAO_MAP_KEY'];

export function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao!.maps!));
      return;
    }

    const existing = document.getElementById(KAKAO_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener(
        'load',
        () => {
          if (window.kakao?.maps) window.kakao.maps.load(() => resolve(window.kakao!.maps!));
          else reject(new Error('KAKAO_MAPS_MISSING'));
        },
        { once: true },
      );
      existing.addEventListener('error', () => reject(new Error('KAKAO_MAPS_LOAD_FAILED')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.onload = () => {
      if (window.kakao?.maps) window.kakao.maps.load(() => resolve(window.kakao!.maps!));
      else reject(new Error('KAKAO_MAPS_MISSING'));
    };
    script.onerror = () => reject(new Error('KAKAO_MAPS_LOAD_FAILED'));
    document.head.appendChild(script);
  });
}
