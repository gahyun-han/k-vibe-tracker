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
    const expectedProfileSettings = {
      en: { title: 'Settings', language: 'Language', notifications: 'Notifications' },
      ko: { title: '설정', language: '언어', notifications: '알림' },
      ja: { title: '設定', language: '言語', notifications: '通知' },
      zh: { title: '设置', language: '语言', notifications: '通知' },
    };
    const expectedDocentProximity = {
      en: { title: 'Arrival check', checkButton: 'Check location', ready: 'You are within 100m. The local docent is ready.' },
      ko: { title: '도착 확인', checkButton: '위치 확인', ready: '100m 안에 있습니다. 로컬 도슨트를 시작할 수 있습니다.' },
      ja: { title: '到着確認', checkButton: '位置を確認', ready: '100m以内です。ローカルドーセントを開始できます。' },
      zh: { title: '到达检查', checkButton: '检查位置', ready: '你已在100m范围内，可以开始本地导览。' },
    };
    const expectedCommonCopy = {
      en: { signIn: 'Sign in', goBack: 'Go back', close: 'Close' },
      ko: { signIn: '로그인', goBack: '뒤로 가기', close: '닫기' },
      ja: { signIn: 'ログイン', goBack: '戻る', close: '閉じる' },
      zh: { signIn: '登录', goBack: '返回', close: '关闭' },
    };
    const expectedLoginCopy = {
      en: { title: 'Sign in to K-Vibe', continueGuest: 'Continue as Guest', availableWithoutLogin: 'Available without login' },
      ko: { title: 'K-Vibe에 로그인', continueGuest: '게스트로 계속하기', availableWithoutLogin: '로그인 없이 사용 가능' },
      ja: { title: 'K-Vibeにログイン', continueGuest: 'ゲストとして続行', availableWithoutLogin: 'ログインなしで利用可能' },
      zh: { title: '登录 K-Vibe', continueGuest: '以访客身份继续', availableWithoutLogin: '无需登录也可使用' },
    };
    const expectedLandingCopy = {
      en: { languageTitle: 'Choose your language', start: 'Explore K-Vibe', trendingLabel: 'Trending prompts' },
      ko: { languageTitle: '언어 선택', start: 'K-Vibe 둘러보기', trendingLabel: '인기 프롬프트' },
      ja: { languageTitle: '言語を選択', start: 'K-Vibeを探す', trendingLabel: '人気プロンプト' },
      zh: { languageTitle: '选择语言', start: '探索 K-Vibe', trendingLabel: '热门提示' },
    };
    const expectedHomeFeedStories = {
      en: ['K-Pop', 'Street Food', 'Photo Spots', 'Nature', 'Shopping'],
      ko: ['K-Pop', '길거리 음식', '포토 스팟', '자연', '쇼핑'],
      ja: ['K-Pop', '屋台グルメ', 'フォトスポット', '自然', 'ショッピング'],
      zh: ['K-Pop', '街头美食', '拍照地点', '自然', '购物'],
    };
    const expectedNavCopy = {
      en: { map: 'Map', analyze: 'Analyze', route: 'Route' },
      ko: { map: '지도', analyze: '분석', route: '루트' },
      ja: { map: 'マップ', analyze: '分析', route: 'ルート' },
      zh: { map: '地图', analyze: '分析', route: '路线' },
    };
    const expectedCategoryCopy = {
      en: { all: 'All', culture: 'Culture', food: 'Food' },
      ko: { all: '전체', culture: '문화', food: '음식' },
      ja: { all: 'すべて', culture: '文化', food: 'グルメ' },
      zh: { all: '全部', culture: '文化', food: '美食' },
    };

    const expectedMapCopy = {
      en: {
        seoulFallback: 'Seoul fallback',
        currentLocation: 'Current location',
        searchPlaceholder: 'Search places',
        nearbySpots: 'Nearby spots',
        resultCount: '{count} shown',
        searchSuggestions: ['Cafe', 'Palace', 'Market'],
        refreshLocation: 'Refresh current location',
        openAnalyzer: 'Open SNS analyzer',
        savedRouteTitle: 'Map Saved Route',
        crowdHigh: 'Busy',
      },
      ko: {
        seoulFallback: '서울 기본 위치',
        currentLocation: '현재 위치',
        searchPlaceholder: '장소 검색',
        nearbySpots: '주변 스팟',
        resultCount: '{count}개 표시',
        searchSuggestions: ['카페', '궁', '시장'],
        refreshLocation: '현재 위치 새로고침',
        openAnalyzer: 'SNS 분석 열기',
        savedRouteTitle: '지도 저장 루트',
        crowdHigh: '혼잡',
      },
      ja: {
        seoulFallback: 'ソウルの既定位置',
        currentLocation: '現在地',
        searchPlaceholder: 'スポットを検索',
        nearbySpots: '周辺スポット',
        resultCount: '{count}件表示',
        searchSuggestions: ['カフェ', '宮殿', '市場'],
        refreshLocation: '現在地を更新',
        openAnalyzer: 'SNS分析を開く',
        savedRouteTitle: '地図で保存したルート',
        crowdHigh: '混雑',
      },
      zh: {
        seoulFallback: '首尔默认位置',
        currentLocation: '当前位置',
        searchPlaceholder: '搜索地点',
        nearbySpots: '附近地点',
        resultCount: '显示 {count} 个',
        searchSuggestions: ['咖啡馆', '宫殿', '市场'],
        refreshLocation: '刷新当前位置',
        openAnalyzer: '打开SNS分析',
        savedRouteTitle: '地图保存路线',
        crowdHigh: '拥挤',
      },
    };
    const expectedRadarCopy = {
      en: {
        title: 'Facility Radar',
        found: '{count} found',
        refresh: 'Refresh facilities',
        radius: 'Radius',
        mapTitle: 'Radar map',
        all: 'All',
        restroom: 'Restroom',
        cafeToilet: 'Cafe restroom',
        loading: 'Scanning nearby facilities',
        emptyTitle: 'No facilities found in this radius',
        expandRadius: 'Expand radius',
        viewOnMap: 'View on Map',
      },
      ko: {
        title: '시설 레이더',
        found: '{count}개 발견',
        refresh: '시설 새로고침',
        radius: '반경',
        mapTitle: '레이더 지도',
        all: '전체',
        restroom: '화장실',
        cafeToilet: '카페 화장실',
        loading: '주변 시설을 검색하는 중',
        emptyTitle: '이 반경 안에 시설이 없습니다',
        expandRadius: '반경 넓히기',
        viewOnMap: '지도에서 보기',
      },
      ja: {
        title: '施設レーダー',
        found: '{count}件',
        refresh: '施設を更新',
        radius: '半径',
        mapTitle: 'レーダーマップ',
        all: 'すべて',
        restroom: 'トイレ',
        cafeToilet: 'カフェのトイレ',
        loading: '周辺施設をスキャン中',
        emptyTitle: 'この半径内に施設がありません',
        expandRadius: '半径を広げる',
        viewOnMap: '地図で見る',
      },
      zh: {
        title: '设施雷达',
        found: '找到 {count} 个',
        refresh: '刷新设施',
        radius: '半径',
        mapTitle: '雷达地图',
        all: '全部',
        restroom: '洗手间',
        cafeToilet: '咖啡店洗手间',
        loading: '正在扫描附近设施',
        emptyTitle: '此半径内未找到设施',
        expandRadius: '扩大半径',
        viewOnMap: '在地图中查看',
      },
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
      expect(copy.radar.title).toBe(expectedRadarCopy[locale].title);
      expect(copy.radar.found).toBe(expectedRadarCopy[locale].found);
      expect(copy.radar.refresh).toBe(expectedRadarCopy[locale].refresh);
      expect(copy.radar.radius).toBe(expectedRadarCopy[locale].radius);
      expect(copy.radar.mapTitle).toBe(expectedRadarCopy[locale].mapTitle);
      expect(copy.radar.loading).toBe(expectedRadarCopy[locale].loading);
      expect(copy.radar.emptyTitle).toBe(expectedRadarCopy[locale].emptyTitle);
      expect(copy.radar.filters.all.length).toBeGreaterThan(0);
      expect(copy.radar.filters.all).toBe(expectedRadarCopy[locale].all);
      expect(copy.radar.filters.restroom).toBe(expectedRadarCopy[locale].restroom);
      expect(copy.radar.facilityTypes.cafe_toilet).toBe(expectedRadarCopy[locale].cafeToilet);
      for (const facilityType of FACILITY_TYPES) {
        expect(copy.radar.filters[facilityType].length).toBeGreaterThan(0);
        expect(copy.radar.facilityTypes[facilityType].length).toBeGreaterThan(0);
      }
      expect(copy.radar.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.radar.viewOnMap).toBe(expectedRadarCopy[locale].viewOnMap);
      expect(copy.radar.expandRadius.length).toBeGreaterThan(0);
      expect(copy.radar.expandRadius).toBe(expectedRadarCopy[locale].expandRadius);
      expect(JSON.stringify(copy.radar)).not.toContain('?');

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

      expect(copy.common.signIn).toBe(expectedCommonCopy[locale].signIn);
      expect(copy.common.goBack).toBe(expectedCommonCopy[locale].goBack);
      expect(copy.common.close).toBe(expectedCommonCopy[locale].close);
      expect(JSON.stringify(copy.common)).not.toContain('?');
      expect(copy.common.goBack.length).toBeGreaterThan(0);
      expect(copy.common.changeLanguage.length).toBeGreaterThan(0);
      expect(copy.common.openProfile.length).toBeGreaterThan(0);
      expect(copy.common.unexpectedErrorTitle.length).toBeGreaterThan(0);
      expect(copy.common.dismissNotification.length).toBeGreaterThan(0);

      expect(copy.login.title).toBe(expectedLoginCopy[locale].title);
      expect(copy.login.continueGuest).toBe(expectedLoginCopy[locale].continueGuest);
      expect(copy.login.availableWithoutLogin).toBe(expectedLoginCopy[locale].availableWithoutLogin);
      expect(JSON.stringify(copy.login)).not.toContain('?');
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
      expect(copy.map.refreshLocation).toBe(expectedMapCopy[locale].refreshLocation);
      expect(copy.map.openAnalyzer.length).toBeGreaterThan(0);
      expect(copy.map.openAnalyzer).toBe(expectedMapCopy[locale].openAnalyzer);
      expect(copy.map.locationUnavailable.length).toBeGreaterThan(0);
      expect(copy.map.cachedFallback.length).toBeGreaterThan(0);
      expect(copy.map.seoulFallback).toBe(expectedMapCopy[locale].seoulFallback);
      expect(copy.map.currentLocation).toBe(expectedMapCopy[locale].currentLocation);
      expect(copy.map.searchPlaceholder).toBe(expectedMapCopy[locale].searchPlaceholder);
      expect(copy.landing.languageTitle).toBe(expectedLandingCopy[locale].languageTitle);
      expect(copy.landing.start).toBe(expectedLandingCopy[locale].start);
      expect(copy.landing.trendingLabel).toBe(expectedLandingCopy[locale].trendingLabel);
      expect(JSON.stringify(copy.landing)).not.toContain('?');
      expect(copy.landing.languageTitle.length).toBeGreaterThan(0);
      expect(copy.map.nearbySpots.length).toBeGreaterThan(0);
      expect(copy.map.nearbySpots).toBe(expectedMapCopy[locale].nearbySpots);
      expect(copy.map.resultCount).toContain('{count}');
      expect(copy.map.resultCount).toBe(expectedMapCopy[locale].resultCount);
      expect(copy.map.noPlacesHint.length).toBeGreaterThan(0);
      expect(copy.map.searchSuggestionsLabel.length).toBeGreaterThan(0);
      expect(copy.map.searchSuggestions.length).toBeGreaterThan(0);
      expect(copy.map.searchSuggestions).toEqual(expectedMapCopy[locale].searchSuggestions);
      for (const suggestion of copy.map.searchSuggestions) {
        expect(suggestion.length).toBeGreaterThan(0);
      }
      expect(copy.map.resetFilters.length).toBeGreaterThan(0);
      expect(Object.values(copy.homeFeed.stories)).toHaveLength(5);
      expect(Object.values(copy.homeFeed.stories)).toEqual(expectedHomeFeedStories[locale]);
      expect(copy.homeFeed.openPlaceDetail).toContain('{name}');
      expect(copy.homeFeed.personalizedFor).toContain('{persona}');
      expect(copy.nav.map).toBe(expectedNavCopy[locale].map);
      expect(copy.nav.analyze).toBe(expectedNavCopy[locale].analyze);
      expect(copy.nav.route).toBe(expectedNavCopy[locale].route);
      expect(copy.categories.all).toBe(expectedCategoryCopy[locale].all);
      expect(copy.categories.culture).toBe(expectedCategoryCopy[locale].culture);
      expect(copy.categories.food).toBe(expectedCategoryCopy[locale].food);
      expect(JSON.stringify({ homeFeed: copy.homeFeed, nav: copy.nav, categories: copy.categories })).not.toContain('?');
      expect(copy.homeFeed.retry.length).toBeGreaterThan(0);
      expect(copy.homeFeed.cachedFallback.length).toBeGreaterThan(0);
      expect(copy.homeFeed.emptyHint.length).toBeGreaterThan(0);
      expect(copy.homeFeed.showAll.length).toBeGreaterThan(0);
      expect(copy.homeFeed.exploreMap.length).toBeGreaterThan(0);
      for (const storyLabel of Object.values(copy.homeFeed.stories)) {
        expect(storyLabel.length).toBeGreaterThan(0);
      }
      expect(copy.map.savedRouteTitle.length).toBeGreaterThan(0);
      expect(copy.map.savedRouteTitle).toBe(expectedMapCopy[locale].savedRouteTitle);
      expect(copy.map.crowd.low.length).toBeGreaterThan(0);
      expect(copy.map.crowd.high).toBe(expectedMapCopy[locale].crowdHigh);
      expect(JSON.stringify(copy.map)).not.toContain('?');
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
      expect(profileSettings.title).toBe(expectedProfileSettings[locale].title);
      expect(profileSettings.items.language.label).toBe(expectedProfileSettings[locale].language);
      expect(profileSettings.items.notifications.label).toBe(expectedProfileSettings[locale].notifications);
      expect(JSON.stringify(profileSettings)).not.toContain('?');
      expect(profileSettings.title.length).toBeGreaterThan(0);
      expect(Object.values(profileSettings.items)).toHaveLength(4);
      for (const item of Object.values(profileSettings.items)) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.value.length).toBeGreaterThan(0);
      }

      const proximity = getDocentProximityCopy(locale);
      expect(proximity.title).toBe(expectedDocentProximity[locale].title);
      expect(proximity.checkButton).toBe(expectedDocentProximity[locale].checkButton);
      expect(proximity.ready).toBe(expectedDocentProximity[locale].ready);
      expect(JSON.stringify(proximity)).not.toContain('?');
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
