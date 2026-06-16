'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, ExternalLink, Heart, MapPin, Mic2, Phone, RefreshCw, Share2, Star, Tags, X } from 'lucide-react';
import { buildPlaceImageGallery } from '@/lib/place-images';
import { buildPlaceDetailShareUrl } from '@/lib/place-detail-share';
import type { NormalizedPlaceDetail, TourApiLocale } from '@/lib/tourapi';

export interface Place {
  id: string;
  contentId?: string;
  contentTypeId?: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  images?: string[];
  overview?: string;
  phone?: string;
  openHours?: string;
  restDate?: string;
  parking?: string;
  rating?: number;
  reviewCount?: number;
  crowdLevel?: 'low' | 'mid' | 'high';
  tags?: string[];
  tourApiUrl?: string;
}

interface PlaceDetailModalProps {
  place: Place | null;
  locale?: TourApiLocale;
  labels?: {
    addToRoute: string;
    save: string;
    saved: string;
    docent: string;
    details: string;
    parking: string;
    loadingDetail: string;
    detailFallback: string;
    closeDetail: string;
    imagePreview: string;
    share: string;
    shared: string;
    copied: string;
    shareUnavailable: string;
    crowd: {
      low: string;
      mid: string;
      high: string;
    };
  };
  categoryLabels?: Readonly<Partial<Record<string, string>>>;
  isSaved?: boolean;
  onClose: () => void;
  onAddToRoute?: (place: Place) => void;
  onOpenDocent?: (place: Place) => void;
  onToggleSave?: (place: Place) => void;
}

const CROWD_CONFIG = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  mid: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  high: { color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
};

const CATEGORY_LABEL: Record<string, string> = {
  all: 'Spot',
  cafe: 'Cafe',
  photo: 'Photo',
  fun: 'Fun',
  culture: 'Culture',
  food: 'Food',
  stay: 'Stay',
};

const DEFAULT_LABELS = {
  addToRoute: 'Add to Route',
  save: 'Save place',
  saved: 'Saved place',
  docent: 'Docent',
  details: 'Details',
  parking: 'Parking',
  loadingDetail: 'Loading TourAPI detail',
  detailFallback: 'Detail fallback active',
  closeDetail: 'Close place detail',
  imagePreview: 'Preview image {index}',
  share: 'Share',
  shared: 'Shared',
  copied: 'Copied link',
  shareUnavailable: 'Share unavailable',
  crowd: {
    low: 'Quiet',
    mid: 'Normal',
    high: 'Busy',
  },
};

export function PlaceDetailModal({
  place,
  locale = 'ko',
  labels,
  categoryLabels,
  isSaved = false,
  onClose,
  onAddToRoute,
  onOpenDocent,
  onToggleSave,
}: PlaceDetailModalProps) {
  const [detail, setDetail] = useState<NormalizedPlaceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (place) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [place]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setDetail(null);
    setDetailError('');
    setSelectedImageIndex(0);
    setShareStatus('');

    if (!place?.contentId || place.contentId.startsWith('mock_')) return;

    const contentId = place.contentId;
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set('locale', locale);
    if (place.contentTypeId) params.set('contentTypeId', String(place.contentTypeId));

    async function loadDetail() {
      setDetailLoading(true);

      try {
        const res = await fetch(`/api/places/${encodeURIComponent(contentId)}?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          detail?: NormalizedPlaceDetail;
          error?: string;
        };

        if (!res.ok || !data.detail) {
          throw new Error(data.error ?? 'PLACE_DETAIL_FAILED');
        }

        setDetail(data.detail);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setDetailError(error instanceof Error ? error.message : 'PLACE_DETAIL_FAILED');
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    loadDetail();
    return () => controller.abort();
  }, [locale, place?.contentId, place?.contentTypeId]);

  const displayPlace = useMemo<Place | null>(() => {
    if (!place) return null;
    if (!detail) return place;

    const images = detail.images.length > 0 ? detail.images : place.images;

    return {
      ...place,
      contentId: detail.content_id,
      contentTypeId: detail.content_type ?? place.contentTypeId,
      name: detail.name ?? place.name,
      address: detail.address ?? place.address,
      lat: detail.lat ?? place.lat,
      lng: detail.lng ?? place.lng,
      imageUrl: detail.image_url ?? place.imageUrl,
      images,
      overview: detail.overview ?? place.overview,
      phone: detail.tel ?? place.phone,
      openHours: detail.open_hours ?? detail.use_time ?? place.openHours,
      restDate: detail.rest_date ?? place.restDate,
      parking: detail.parking ?? place.parking,
      tourApiUrl: detail.homepage ?? place.tourApiUrl,
    };
  }, [detail, place]);

  const imageGallery = useMemo(() => {
    const source = displayPlace ?? place;
    return buildPlaceImageGallery(source, 4);
  }, [displayPlace, place]);

  useEffect(() => {
    if (selectedImageIndex >= imageGallery.length) setSelectedImageIndex(0);
  }, [imageGallery.length, selectedImageIndex]);

  if (!place) return null;

  const mergedPlace = displayPlace ?? place;
  const crowd = mergedPlace.crowdLevel ? CROWD_CONFIG[mergedPlace.crowdLevel] : null;
  const categoryLabel = categoryLabels?.[mergedPlace.category] ?? CATEGORY_LABEL[mergedPlace.category] ?? mergedPlace.category;
  const imageUrl = imageGallery[selectedImageIndex] ?? mergedPlace.imageUrl;
  const externalUrl = mergedPlace.tourApiUrl?.startsWith('http') ? mergedPlace.tourApiUrl : null;
  const text = { ...DEFAULT_LABELS, ...labels };

  async function sharePlace() {
    const shareUrl = buildPlaceDetailShareUrl(mergedPlace, locale, window.location.href);

    try {
      if (navigator.share) {
        await navigator.share({
          title: mergedPlace.name,
          text: mergedPlace.address,
          url: shareUrl,
        });
        setShareStatus(text.shared);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus(text.copied);
    } catch {
      setShareStatus(text.shareUnavailable);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md">
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#1A1A2E] pb-[env(safe-area-inset-bottom)] shadow-2xl">
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {imageUrl ? (
            <div className="relative mx-4 mt-2 h-44 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={mergedPlace.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {imageGallery.length > 1 && (
                <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/80 backdrop-blur">
                  {selectedImageIndex + 1}/{imageGallery.length}
                </div>
              )}
            </div>
          ) : (
            <div className="mx-4 mt-2 flex h-36 items-center justify-center rounded-xl bg-white/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF3A5C]/15 text-[#FF3A5C]">
                <Tags size={34} />
              </div>
            </div>
          )}

          <div className="space-y-3 p-4">
            {imageGallery.length > 1 && (
              <div className="-mt-1 grid grid-cols-4 gap-2">
                {imageGallery.map((url, index) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={text.imagePreview.replace('{index}', String(index + 1))}
                    className={`relative aspect-square overflow-hidden rounded-lg border transition-colors ${
                      selectedImageIndex === index
                        ? 'border-[#FF3A5C] ring-2 ring-[#FF3A5C]/30'
                        : 'border-white/10 opacity-75 hover:border-white/30 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF3A5C]/20 px-2 py-0.5 text-xs font-semibold text-[#FF3A5C]">
                    {categoryLabel}
                  </span>
                  {crowd && (
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${crowd.bg} ${crowd.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${crowd.dot}`} />
                      {text.crowd[mergedPlace.crowdLevel ?? 'mid']}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{mergedPlace.name}</h2>
                {mergedPlace.rating && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">{mergedPlace.rating}</span>
                    {mergedPlace.reviewCount && (
                      <span className="text-xs text-white/40">({mergedPlace.reviewCount.toLocaleString()})</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleSave?.(mergedPlace)}
                  aria-label={isSaved ? text.saved : text.save}
                  title={isSaved ? text.saved : text.save}
                  className={`rounded-lg p-1.5 transition-colors hover:bg-white/10 ${
                    isSaved ? 'text-[#FF3A5C]' : 'text-white/60'
                  }`}
                >
                  <Heart size={18} className={isSaved ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={onClose}
                  aria-label={text.closeDetail}
                  className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {mergedPlace.tags && mergedPlace.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {mergedPlace.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#FF3A5C]" />
                <span>{mergedPlace.address}</span>
              </div>
              {mergedPlace.openHours && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Clock size={14} className="shrink-0 text-[#FF3A5C]" />
                  <span>{mergedPlace.openHours}</span>
                </div>
              )}
              {mergedPlace.restDate && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Clock size={14} className="shrink-0 text-[#FF3A5C]" />
                  <span>{mergedPlace.restDate}</span>
                </div>
              )}
              {mergedPlace.phone && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Phone size={14} className="shrink-0 text-[#FF3A5C]" />
                  <span>{mergedPlace.phone}</span>
                </div>
              )}
            </div>

            {detailLoading && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/45">
                <RefreshCw size={14} className="animate-spin text-[#FF3A5C]" />
                {text.loadingDetail}
              </div>
            )}

            {detailError && (
              <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs text-yellow-100/75">
                {text.detailFallback}: {detailError}
              </div>
            )}

            {mergedPlace.overview && (
              <p className="rounded-xl bg-white/5 p-3 text-sm leading-6 text-white/65">
                {mergedPlace.overview}
              </p>
            )}

            {mergedPlace.parking && (
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/35">{text.parking}</p>
                <p className="mt-1 text-sm leading-6 text-white/65">{mergedPlace.parking}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onAddToRoute?.(mergedPlace)}
                className="min-w-[150px] flex-[2_1_150px] rounded-xl bg-[#FF3A5C] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                {text.addToRoute}
              </button>
              <button
                type="button"
                onClick={() => onOpenDocent?.(mergedPlace)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
              >
                <Mic2 size={14} />
                {text.docent}
              </button>
              <button
                type="button"
                onClick={sharePlace}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
              >
                <Share2 size={14} />
                {text.share}
              </button>
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
                >
                  <ExternalLink size={14} />
                  {text.details}
                </a>
              )}
            </div>
            {shareStatus && (
              <p role="status" className="text-center text-xs text-white/40">
                {shareStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
