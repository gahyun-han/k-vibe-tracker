import { describe, expect, it } from 'vitest';
import {
  getDataSourceCopy,
  getDocentProximityCopy,
  getLocationStatusCopy,
  getNetworkStatusCopy,
  getProfileSettingsCopy,
  getPwaInstallCopy,
  getUiCopy,
  LANGUAGE_NAMES,
  SUPPORTED_LOCALES,
} from '@/lib/ui-copy';
import { ROUTE_THEME_OPTIONS } from '@/lib/routes';
import { FACILITY_TYPES } from '@/lib/facilities';

describe('ui copy', () => {
  it('provides feature copy for every supported locale', () => {
    const expectedSeenInTitle = {
      en: 'Seen in',
      ko: '콘텐츠 노출',
      ja: '登場コンテンツ',
      zh: '出现于',
    };

    const expectedLanguageNames = {
      en: 'English',
      ko: '한국어',
      ja: '日本語',
      zh: '简体中文',
    };
    const expectedTutorialTitles = {
      en: 'Feature Guide',
      ko: '기능 안내',
      ja: '機能ガイド',
      zh: '功能指南',
    };
    const expectedTutorialStepTitles = {
      en: ['Map', 'Analyze', 'Route', 'Docent', 'Radar', 'Profile'],
      ko: ['지도', '분석', '루트', '도슨트', '레이더', '프로필'],
      ja: ['マップ', '分析', 'ルート', 'ドーセント', 'レーダー', 'プロフィール'],
      zh: ['地图', '分析', '路线', '导览', '雷达', '个人资料'],
    };
    const expectedLocationStatus = {
      en: 'Last known location',
      ko: '마지막 위치',
      ja: '最後に確認した位置',
      zh: '上次已知位置',
    };
    const expectedDataSource = {
      en: { cache: 'Cache', mock: 'Mock' },
      ko: { cache: '캐시', mock: '모의 데이터' },
      ja: { cache: 'キャッシュ', mock: 'モック' },
      zh: { cache: '缓存', mock: '模拟数据' },
    };
    const expectedNetworkStatus = {
      en: 'Offline mode',
      ko: '오프라인 모드',
      ja: 'オフラインモード',
      zh: '离线模式',
    };
    const expectedPwaInstall = {
      en: { title: 'Install K-Vibe', install: 'Install', dismiss: 'Not now' },
      ko: { title: 'K-Vibe 설치', install: '설치', dismiss: '나중에' },
      ja: { title: 'K-Vibeをインストール', install: 'インストール', dismiss: '後で' },
      zh: { title: '安装 K-Vibe', install: '安装', dismiss: '稍后' },
    };

    for (const locale of SUPPORTED_LOCALES) {
      const copy = getUiCopy(locale);

      expect(LANGUAGE_NAMES[locale]).toBe(expectedLanguageNames[locale]);
      expect(LANGUAGE_NAMES[locale]).not.toMatch(/[?]/);
      expect(LANGUAGE_NAMES[locale].length).toBeGreaterThan(1);

      expect(copy.analyze.title.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingEstimate.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingColdStart.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingSteps).toHaveLength(4);
      expect(copy.analyze.emptyTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.emptyBody.length).toBeGreaterThan(0);
      expect(copy.analyze.tryExample.length).toBeGreaterThan(0);
      expect(copy.analyze.sourceCache.length).toBeGreaterThan(0);
      expect(copy.analyze.cachedResultLoaded.length).toBeGreaterThan(0);
      expect(copy.analyze.unsupportedUrl.length).toBeGreaterThan(0);
      expect(copy.analyze.youtubeSupported.length).toBeGreaterThan(0);
      expect(copy.analyze.instagramPendingTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.instagramPendingBody.length).toBeGreaterThan(0);
      expect(copy.analyze.openPost.length).toBeGreaterThan(0);
      expect(copy.analyze.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.analyze.buildRoute.length).toBeGreaterThan(0);
      expect(copy.analyze.routeSaved.length).toBeGreaterThan(0);
      expect(copy.analyze.routeSaveFailed.length).toBeGreaterThan(0);
      expect(copy.analyze.estimatedLocation.length).toBeGreaterThan(0);

      expect(copy.radar.title.length).toBeGreaterThan(0);
      expect(copy.radar.filters.all.length).toBeGreaterThan(0);
      for (const facilityType of FACILITY_TYPES) {
        expect(copy.radar.filters[facilityType].length).toBeGreaterThan(0);
        expect(copy.radar.facilityTypes[facilityType].length).toBeGreaterThan(0);
      }
      expect(copy.radar.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.radar.expandRadius.length).toBeGreaterThan(0);

      expect(copy.route.title.length).toBeGreaterThan(0);
      expect(copy.route.startGuidance.length).toBeGreaterThan(0);
      expect(copy.route.miniMapTitle.length).toBeGreaterThan(0);
      expect(copy.route.travelSegment).toContain('{duration}');
      expect(copy.route.travelSegment).toContain('{distance}');
      expect(copy.route.transitSegment).toContain('{duration}');
      expect(copy.route.transitSegment).toContain('{distance}');
      expect(copy.route.travelSegmentBetween).toContain('{from}');
      expect(copy.route.travelSegmentBetween).toContain('{to}');
      expect(copy.route.openRouteMap.length).toBeGreaterThan(0);
      expect(copy.route.openRouteMapTitle.length).toBeGreaterThan(0);
      expect(copy.route.openDirections.length).toBeGreaterThan(0);
      expect(copy.route.sharedRouteInvalid.length).toBeGreaterThan(0);
      expect(copy.route.openStopDetail).toContain('{name}');
      expect(copy.route.openStopDetailTitle.length).toBeGreaterThan(0);
      expect(copy.route.openStopMap).toContain('{name}');
      expect(copy.route.moveStopUp).toContain('{name}');
      expect(copy.route.moveStopDown).toContain('{name}');
      expect(copy.route.moveStopUpTitle.length).toBeGreaterThan(0);
      expect(copy.route.moveStopDownTitle.length).toBeGreaterThan(0);
      expect(copy.route.extraStop.name.length).toBeGreaterThan(0);

      expect(copy.common.goBack.length).toBeGreaterThan(0);
      expect(copy.common.changeLanguage.length).toBeGreaterThan(0);
      expect(copy.common.openProfile.length).toBeGreaterThan(0);
      expect(copy.common.unexpectedErrorTitle.length).toBeGreaterThan(0);
      expect(copy.common.dismissNotification.length).toBeGreaterThan(0);

      expect(copy.login.title.length).toBeGreaterThan(0);
      expect(copy.login.continueGuest.length).toBeGreaterThan(0);
      expect(copy.login.guestFeatures).toHaveLength(4);
      expect(copy.profile.openSavedDetail).toContain('{name}');
      expect(copy.profile.openSavedDetailCta.length).toBeGreaterThan(0);
      expect(copy.profile.openMap.length).toBeGreaterThan(0);
      expect(copy.profile.personaLabel.length).toBeGreaterThan(0);
      expect(copy.profile.personaUnset.length).toBeGreaterThan(0);
      expect(copy.profile.signInTitle.length).toBeGreaterThan(0);
      expect(copy.profile.signInDescription.length).toBeGreaterThan(0);
      expect(copy.profile.seeAll.length).toBeGreaterThan(0);
      expect(copy.profile.showLess.length).toBeGreaterThan(0);

      expect(copy.map.refreshLocation.length).toBeGreaterThan(0);
      expect(copy.map.openAnalyzer.length).toBeGreaterThan(0);
      expect(copy.map.locationUnavailable.length).toBeGreaterThan(0);
      expect(copy.map.cachedFallback.length).toBeGreaterThan(0);
      expect(copy.landing.languageTitle.length).toBeGreaterThan(0);
      expect(copy.map.nearbySpots.length).toBeGreaterThan(0);
      expect(copy.map.resultCount).toContain('{count}');
      expect(copy.map.noPlacesHint.length).toBeGreaterThan(0);
      expect(copy.map.searchSuggestionsLabel.length).toBeGreaterThan(0);
      expect(copy.map.searchSuggestions.length).toBeGreaterThan(0);
      for (const suggestion of copy.map.searchSuggestions) {
        expect(suggestion.length).toBeGreaterThan(0);
      }
      expect(copy.map.resetFilters.length).toBeGreaterThan(0);
      expect(Object.values(copy.homeFeed.stories)).toHaveLength(5);
      expect(copy.homeFeed.openPlaceDetail).toContain('{name}');
      expect(copy.homeFeed.personalizedFor).toContain('{persona}');
      expect(copy.homeFeed.retry.length).toBeGreaterThan(0);
      expect(copy.homeFeed.cachedFallback.length).toBeGreaterThan(0);
      expect(copy.homeFeed.emptyHint.length).toBeGreaterThan(0);
      expect(copy.homeFeed.showAll.length).toBeGreaterThan(0);
      expect(copy.homeFeed.exploreMap.length).toBeGreaterThan(0);
      for (const storyLabel of Object.values(copy.homeFeed.stories)) {
        expect(storyLabel.length).toBeGreaterThan(0);
      }
      expect(copy.map.savedRouteTitle.length).toBeGreaterThan(0);
      expect(copy.map.crowd.low.length).toBeGreaterThan(0);
      expect(copy.radar.mapTitle.length).toBeGreaterThan(0);
      expect(copy.radar.openFacilityMap).toContain('{name}');
      expect(copy.radar.locationUnavailable.length).toBeGreaterThan(0);
      expect(copy.radar.cachedFallback.length).toBeGreaterThan(0);
      expect(copy.analyze.confidence.length).toBeGreaterThan(0);

      expect(copy.placeDetail.closeDetail.length).toBeGreaterThan(0);
      expect(copy.placeDetail.addedToRoute.length).toBeGreaterThan(0);
      expect(copy.placeDetail.removed.length).toBeGreaterThan(0);
      expect(copy.placeDetail.imagePreview).toContain('{index}');
      expect(copy.placeDetail.seenInTitle).toBe(expectedSeenInTitle[locale]);
      expect(copy.placeDetail.seenInTitle.length).toBeGreaterThan(0);
      expect(copy.placeDetail.seenInYoutube).toContain('{count}');
      expect(copy.placeDetail.seenInInstagram).toContain('{count}');
      expect(copy.placeDetail.share.length).toBeGreaterThan(0);
      expect(copy.placeDetail.shared.length).toBeGreaterThan(0);
      expect(copy.placeDetail.copied.length).toBeGreaterThan(0);
      expect(copy.placeDetail.shareUnavailable.length).toBeGreaterThan(0);
      expect(copy.placeDetail.crowd.high.length).toBeGreaterThan(0);

      expect(copy.persona.title.length).toBeGreaterThan(0);
      expect(copy.persona.themes.kpop.details.bts.label.length).toBeGreaterThan(0);
      expect(copy.persona.reviewSelection.length).toBeGreaterThan(0);
      expect(copy.persona.confirmTitle.length).toBeGreaterThan(0);
      expect(copy.persona.selectedTheme.length).toBeGreaterThan(0);
      expect(copy.persona.personalizeFeed.length).toBeGreaterThan(0);
      expect(copy.persona.personaSaved.length).toBeGreaterThan(0);
      expect(copy.persona.personaSaveUnavailable.length).toBeGreaterThan(0);
      expect(copy.persona.routeGenerated.length).toBeGreaterThan(0);
      expect(copy.persona.routeSaved.length).toBeGreaterThan(0);
      expect(copy.persona.routeSaveUnavailable.length).toBeGreaterThan(0);
      expect(copy.persona.routeTitle).toContain('{detail}');
      for (const theme of ROUTE_THEME_OPTIONS) {
        const themeCopy = copy.persona.themes[theme.id];
        const detailCopy = themeCopy.details as Record<string, { label: string }>;
        expect(themeCopy.label.length).toBeGreaterThan(0);
        for (const detail of theme.details) {
          expect(detailCopy[detail.id].label.length).toBeGreaterThan(0);
        }
      }

      expect(copy.tutorial.steps).toHaveLength(6);
      expect(copy.tutorial.title).toBe(expectedTutorialTitles[locale]);
      expect(copy.tutorial.steps.map((step) => step.title)).toEqual(expectedTutorialStepTitles[locale]);
      expect(JSON.stringify(copy.tutorial)).not.toContain('?');
      for (const step of copy.tutorial.steps) {
        expect(step.action.length).toBeGreaterThan(0);
      }

      expect(copy.docent.progressLabel.length).toBeGreaterThan(0);
      expect(copy.docent.progressValue).toContain('{current}');
      expect(copy.docent.progressValue).toContain('{total}');
      expect(copy.docent.captionTitle.length).toBeGreaterThan(0);

      expect(copy.profile.openRouteDetail).toContain('{name}');
      expect(copy.profile.openRouteDetailCta.length).toBeGreaterThan(0);
      expect(copy.route.locationCardBody).toContain('{name}');
      expect(copy.route.nextStopNear).toContain('{distance}');
      expect(copy.route.nextStopFar).toContain('{name}');
      expect(copy.route.locationPermissionDenied.length).toBeGreaterThan(0);

      const profileSettings = getProfileSettingsCopy(locale);
      expect(profileSettings.title.length).toBeGreaterThan(0);
      expect(Object.values(profileSettings.items)).toHaveLength(4);
      for (const item of Object.values(profileSettings.items)) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.value.length).toBeGreaterThan(0);
      }

      const proximity = getDocentProximityCopy(locale);
      expect(proximity.radiusLabel).toContain('100');
      expect(proximity.distanceLabel).toContain('{distance}');
      expect(proximity.checkButton.length).toBeGreaterThan(0);
      expect(proximity.ready.length).toBeGreaterThan(0);

      const locationStatus = getLocationStatusCopy(locale);
      expect(locationStatus.lastKnownLocation).toBe(expectedLocationStatus[locale]);
      expect(locationStatus.lastKnownLocation.length).toBeGreaterThan(0);

      const dataSource = getDataSourceCopy(locale);
      expect(dataSource.cache).toBe(expectedDataSource[locale].cache);
      expect(dataSource.mock).toBe(expectedDataSource[locale].mock);
      expect(dataSource.cache.length).toBeGreaterThan(0);
      expect(dataSource.mock.length).toBeGreaterThan(0);
      expect(dataSource.tourApi).toBe('TourAPI');

      const networkStatus = getNetworkStatusCopy(locale);
      expect(networkStatus.offlineTitle).toBe(expectedNetworkStatus[locale]);
      expect(JSON.stringify(networkStatus)).not.toContain('?');
      expect(networkStatus.offlineTitle.length).toBeGreaterThan(0);
      expect(networkStatus.offlineBody.length).toBeGreaterThan(0);

      const pwaInstall = getPwaInstallCopy(locale);
      expect(pwaInstall.title).toBe(expectedPwaInstall[locale].title);
      expect(pwaInstall.install).toBe(expectedPwaInstall[locale].install);
      expect(pwaInstall.dismiss).toBe(expectedPwaInstall[locale].dismiss);
      expect(JSON.stringify(pwaInstall)).not.toContain('?');
      expect(pwaInstall.title.length).toBeGreaterThan(0);
      expect(pwaInstall.body.length).toBeGreaterThan(0);
      expect(pwaInstall.install.length).toBeGreaterThan(0);
      expect(pwaInstall.dismiss.length).toBeGreaterThan(0);
      expect(pwaInstall.close.length).toBeGreaterThan(0);
    }
  });
});
