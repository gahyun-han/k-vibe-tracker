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
} from '@/lib/i18n';
import { ROUTE_THEME_OPTIONS } from '@/lib/domain';
import { FACILITY_TYPES } from '@/lib/domain';

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
      en: {
        signIn: 'Sign in',
        goBack: 'Go back',
        goHome: 'Go home',
        close: 'Close',
        changeViewMode: 'Change view mode',
        mobileView: 'Mobile',
        desktopView: 'PC',
      },
      ko: {
        signIn: '로그인',
        goBack: '뒤로 가기',
        goHome: '홈으로 이동',
        close: '닫기',
        changeViewMode: '보기 모드 변경',
        mobileView: '모바일',
        desktopView: 'PC',
      },
      ja: {
        signIn: 'ログイン',
        goBack: '戻る',
        goHome: 'ホームへ移動',
        close: '閉じる',
        changeViewMode: '表示モードを変更',
        mobileView: 'モバイル',
        desktopView: 'PC',
      },
      zh: {
        signIn: '登录',
        goBack: '返回',
        goHome: '返回首页',
        close: '关闭',
        changeViewMode: '切换显示模式',
        mobileView: '手机',
        desktopView: 'PC',
      },
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
    const expectedRouteCopy = {
      en: {
        title: 'Route',
        travelSegment: 'Walk {duration} · {distance}',
        transitSegment: 'Transit {duration} · {distance}',
        locationCardTitle: 'Current distance',
        checkCurrentLocation: 'Check location',
        openRouteMap: 'Open in Map',
        startGuidance: 'Start Guidance',
        routeCompleted: 'All stops are complete',
        extraStopName: 'Cheonggyecheon Stream',
      },
      ko: {
        title: '루트',
        travelSegment: '도보 {duration} · {distance}',
        transitSegment: '대중교통 {duration} · {distance}',
        locationCardTitle: '현재 거리',
        checkCurrentLocation: '위치 확인',
        openRouteMap: '지도에서 열기',
        startGuidance: '가이드 시작',
        routeCompleted: '모든 방문지를 완료했습니다',
        extraStopName: '청계천',
      },
      ja: {
        title: 'ルート',
        travelSegment: '徒歩 {duration} · {distance}',
        transitSegment: '公共交通 {duration} · {distance}',
        locationCardTitle: '現在の距離',
        checkCurrentLocation: '位置を確認',
        openRouteMap: '地図で開く',
        startGuidance: 'ガイド開始',
        routeCompleted: 'すべての立ち寄り先が完了しました',
        extraStopName: '清渓川',
      },
      zh: {
        title: '路线',
        travelSegment: '步行 {duration} · {distance}',
        transitSegment: '公共交通 {duration} · {distance}',
        locationCardTitle: '当前位置距离',
        checkCurrentLocation: '检查位置',
        openRouteMap: '在地图中打开',
        startGuidance: '开始导览',
        routeCompleted: '所有地点均已完成',
        extraStopName: '清溪川',
      },
    };
    const expectedDocentCopy = {
      en: {
        title: 'AI Docent',
        eyebrow: 'Local voice guide',
        progressLabel: 'Script progress',
        play: 'Play',
        backToRoute: 'Back to route',
        fallbackName: 'Selected stop',
      },
      ko: {
        title: 'AI 도슨트',
        eyebrow: '로컬 음성 가이드',
        progressLabel: '스크립트 진행',
        play: '재생',
        backToRoute: '루트로 돌아가기',
        fallbackName: '선택한 방문지',
      },
      ja: {
        title: 'AIドーセント',
        eyebrow: 'ローカル音声ガイド',
        progressLabel: 'スクリプト進行',
        play: '再生',
        backToRoute: 'ルートへ戻る',
        fallbackName: '選択した立ち寄り先',
      },
      zh: {
        title: 'AI导览',
        eyebrow: '本地语音导览',
        progressLabel: '脚本进度',
        play: '播放',
        backToRoute: '返回路线',
        fallbackName: '已选地点',
      },
    };
    const expectedPlaceDetailCopy = {
      en: {
        addToRoute: 'Add to Route',
        addedToRoute: 'Added to route',
        save: 'Save place',
        saved: 'Saved place',
        removed: 'Removed from saved places',
        docent: 'Docent',
        details: 'Details',
        parking: 'Parking',
        loadingDetail: 'Loading TourAPI detail',
        detailFallback: 'Detail fallback active',
        closeDetail: 'Close place detail',
        imagePreview: 'Preview image {index}',
        seenInTitle: 'Seen in',
        share: 'Share',
        shared: 'Shared',
        copied: 'Copied link',
        shareUnavailable: 'Share unavailable',
        crowdHigh: 'Busy',
      },
      ko: {
        addToRoute: '루트에 추가',
        addedToRoute: '루트에 추가했어요',
        save: '장소 저장',
        saved: '저장된 장소',
        removed: '저장 장소에서 제거했어요',
        docent: '도슨트',
        details: '상세',
        parking: '주차',
        loadingDetail: 'TourAPI 상세 불러오는 중',
        detailFallback: '상세 대체 모드',
        closeDetail: '장소 상세 닫기',
        imagePreview: '{index}번째 이미지 보기',
        seenInTitle: '콘텐츠 노출',
        share: '공유',
        shared: '공유했어요',
        copied: '링크를 복사했어요',
        shareUnavailable: '공유할 수 없어요',
        crowdHigh: '혼잡',
      },
      ja: {
        addToRoute: 'ルートに追加',
        addedToRoute: 'ルートに追加しました',
        save: '保存する',
        saved: '保存済み',
        removed: '保存スポットから削除しました',
        docent: 'ドーセント',
        details: '詳細',
        parking: '駐車',
        loadingDetail: 'TourAPI詳細を読み込み中',
        detailFallback: '詳細フォールバック',
        closeDetail: 'スポット詳細を閉じる',
        imagePreview: '{index}枚目の画像を表示',
        seenInTitle: '登場コンテンツ',
        share: '共有',
        shared: '共有しました',
        copied: 'リンクをコピーしました',
        shareUnavailable: '共有できません',
        crowdHigh: '混雑',
      },
      zh: {
        addToRoute: '加入路线',
        addedToRoute: '已加入路线',
        save: '保存地点',
        saved: '已保存',
        removed: '已从保存地点移除',
        docent: '导览',
        details: '详情',
        parking: '停车',
        loadingDetail: '正在加载TourAPI详情',
        detailFallback: '详情兜底模式',
        closeDetail: '关闭地点详情',
        imagePreview: '查看第{index}张图片',
        seenInTitle: '出现于',
        share: '分享',
        shared: '已分享',
        copied: '已复制链接',
        shareUnavailable: '无法分享',
        crowdHigh: '拥挤',
      },
    };
    const expectedAnalyzeCopy = {
      en: {
        title: 'SNS Spot Analyzer',
        inputPlaceholder: 'Paste a YouTube or Instagram URL',
        youtubeSupported: 'YouTube ready',
        instagramPending: 'Instagram queued',
        analyzeButton: 'Analyze Spots',
        loadingTitle: 'Analysis in progress',
        loadingSteps: ['Validating URL', 'Reading video context', 'Matching candidate places', 'Preparing map-ready results'],
        foundSpots: 'Found {count} candidate spots',
        sourceCache: 'Previous result',
        confidence: 'confidence',
        estimatedLocation: 'Estimated location',
        viewOnMap: 'View on Map',
        buildRoute: 'Build Route',
        localModeTitle: 'Local-first analysis',
        openVideo: 'Open video',
        routeTitle: 'SNS Analysis Route',
        routeSaved: 'Route saved',
      },
      ko: {
        title: 'SNS 스팟 분석기',
        inputPlaceholder: 'YouTube 또는 Instagram URL 붙여넣기',
        youtubeSupported: 'YouTube 준비됨',
        instagramPending: 'Instagram 대기 중',
        analyzeButton: '스팟 분석',
        loadingTitle: '분석 진행 중',
        loadingSteps: ['URL 확인', '영상 맥락 읽기', '후보 장소 매칭', '지도 결과 준비'],
        foundSpots: '후보 스팟 {count}개 발견',
        sourceCache: '이전 결과',
        confidence: '신뢰도',
        estimatedLocation: '추정 위치',
        viewOnMap: '지도에서 보기',
        buildRoute: '루트 만들기',
        localModeTitle: '로컬 우선 분석',
        openVideo: '영상 열기',
        routeTitle: 'SNS 분석 루트',
        routeSaved: '루트를 저장했습니다',
      },
      ja: {
        title: 'SNSスポット分析',
        inputPlaceholder: 'YouTubeまたはInstagramのURLを貼り付け',
        youtubeSupported: 'YouTube対応',
        instagramPending: 'Instagram待機中',
        analyzeButton: 'スポットを分析',
        loadingTitle: '分析中',
        loadingSteps: ['URLを確認', '動画の文脈を読む', '候補スポットを照合', '地図用の結果を準備'],
        foundSpots: '候補スポット {count}件',
        sourceCache: '前回の結果',
        confidence: '信頼度',
        estimatedLocation: '推定位置',
        viewOnMap: '地図で見る',
        buildRoute: 'ルート作成',
        localModeTitle: 'ローカル優先分析',
        openVideo: '動画を開く',
        routeTitle: 'SNS分析ルート',
        routeSaved: 'ルートを保存しました',
      },
      zh: {
        title: 'SNS地点分析',
        inputPlaceholder: '粘贴 YouTube 或 Instagram URL',
        youtubeSupported: 'YouTube 可用',
        instagramPending: 'Instagram 待处理',
        analyzeButton: '分析地点',
        loadingTitle: '分析进行中',
        loadingSteps: ['验证 URL', '读取视频语境', '匹配候选地点', '准备地图结果'],
        foundSpots: '找到 {count} 个候选地点',
        sourceCache: '上次结果',
        confidence: '可信度',
        estimatedLocation: '推测位置',
        viewOnMap: '在地图中查看',
        buildRoute: '生成路线',
        localModeTitle: '本地优先分析',
        openVideo: '打开视频',
        routeTitle: 'SNS分析路线',
        routeSaved: '路线已保存',
      },
    };

    const expectedPersonaCopy = {
      en: {
        title: 'Build a K-content day plan',
        generatorEyebrow: 'K-content route',
        chooseMood: 'Choose the route mood',
        reviewSelection: 'Review Selection',
        personalizeFeed: 'Personalize Feed',
        routeGenerated: 'Route preview ready',
        routeSaved: 'Route saved for editing',
        generate: 'Generate Route',
        routeTitle: '{detail} Seoul Route',
        kpopLabel: 'K-pop Pilgrimage',
        btsLabel: 'BTS',
        moodCafeLabel: 'Cafe day',
        historyPalaceDayLabel: 'Palace day',
      },
      ko: {
        title: 'K-콘텐츠 하루 루트 만들기',
        generatorEyebrow: 'K-콘텐츠 루트',
        chooseMood: '루트 무드 선택',
        reviewSelection: '선택 확인',
        personalizeFeed: '피드 개인화',
        routeGenerated: '루트 미리보기가 준비됐어요',
        routeSaved: '편집할 루트를 저장했어요',
        generate: '루트 생성',
        routeTitle: '{detail} 서울 루트',
        kpopLabel: 'K-pop 성지순례',
        btsLabel: 'BTS',
        moodCafeLabel: '카페 데이',
        historyPalaceDayLabel: '궁궐 데이',
      },
      ja: {
        title: 'Kコンテンツの1日プランを作る',
        generatorEyebrow: 'Kコンテンツルート',
        chooseMood: 'ルートのムードを選択',
        reviewSelection: '選択を確認',
        personalizeFeed: 'フィードを個人化',
        routeGenerated: 'ルートプレビューができました',
        routeSaved: '編集用ルートを保存しました',
        generate: 'ルート生成',
        routeTitle: '{detail} ソウルルート',
        kpopLabel: 'K-pop聖地巡り',
        btsLabel: 'BTS',
        moodCafeLabel: 'カフェデー',
        historyPalaceDayLabel: '宮殿デー',
      },
      zh: {
        title: '创建K-content一日路线',
        generatorEyebrow: 'K-content路线',
        chooseMood: '选择路线氛围',
        reviewSelection: '确认选择',
        personalizeFeed: '个性化首页',
        routeGenerated: '路线预览已准备好',
        routeSaved: '已保存可编辑路线',
        generate: '生成路线',
        routeTitle: '{detail}首尔路线',
        kpopLabel: 'K-pop朝圣',
        btsLabel: 'BTS',
        moodCafeLabel: '咖啡馆日',
        historyPalaceDayLabel: '宫殿日',
      },
    };
    const expectedProfileCopy = {
      en: {
        title: 'Profile',
        guestTitle: 'Guest traveler',
        statsPlaces: 'Places',
        statsRoutes: 'Routes',
        signInTitle: 'Sign in to sync trips',
        savedPlaces: 'Saved Places',
        noSavedPlaces: 'No saved places yet',
        noSavedPlacesHint: 'Open the map, choose a place, and tap the heart.',
        openMap: 'Open in Map',
        savedRoutes: 'Saved routes',
        noSavedRoutes: 'No saved route yet',
        noSavedRoutesHint: 'Generate or assemble a route to keep it in local storage.',
        createFirstRoute: 'Create your first route',
        openSavedDetail: 'Open {name} details',
        openSavedDetailCta: 'View details',
        openRouteDetail: 'Open {name} route',
        openRouteDetailCta: 'Open route detail',
        continueRoute: 'Continue',
        editRoute: 'Edit route',
        routeStops: '{count} stops',
        routeProgress: '{done}/{total} complete',
        routeComplete: 'Route complete',
        nextStop: 'Next stop',
        seeAll: 'See all',
        showLess: 'Show less',
        personaLabel: 'Persona',
        personaUnset: 'Not selected',
      },
      ko: {
        title: '프로필',
        guestTitle: '게스트 여행자',
        statsPlaces: '장소',
        statsRoutes: '루트',
        signInTitle: '로그인하면 여행을 동기화할 수 있어요',
        savedPlaces: '저장 장소',
        noSavedPlaces: '아직 저장한 장소가 없어요',
        noSavedPlacesHint: '지도를 열고 장소를 선택한 뒤 하트를 눌러 저장하세요.',
        openMap: '지도에서 보기',
        savedRoutes: '저장 루트',
        noSavedRoutes: '아직 저장된 루트가 없어요',
        noSavedRoutesHint: '루트를 생성하거나 지도에서 장소를 추가하면 로컬에 보관됩니다.',
        createFirstRoute: '첫 루트 만들기',
        openSavedDetail: '{name} 상세 보기',
        openSavedDetailCta: '상세 보기',
        openRouteDetail: '{name} 루트 열기',
        openRouteDetailCta: '루트 상세 열기',
        continueRoute: '이어가기',
        editRoute: '루트 편집',
        routeStops: '{count}개 장소',
        routeProgress: '{done}/{total} 완료',
        routeComplete: '루트 완료',
        nextStop: '다음 방문지',
        seeAll: '전체 보기',
        showLess: '접기',
        personaLabel: '페르소나',
        personaUnset: '미선택',
      },
      ja: {
        title: 'プロフィール',
        guestTitle: 'ゲスト旅行者',
        statsPlaces: 'スポット',
        statsRoutes: 'ルート',
        signInTitle: 'ログインすると旅を同期できます',
        savedPlaces: '保存スポット',
        noSavedPlaces: '保存したスポットはまだありません',
        noSavedPlacesHint: '地図でスポットを選び、ハートを押して保存できます。',
        openMap: '地図で開く',
        savedRoutes: '保存ルート',
        noSavedRoutes: '保存済みルートはまだありません',
        noSavedRoutesHint: 'ルート生成または地図から追加するとローカルに保存されます。',
        createFirstRoute: '最初のルートを作成',
        openSavedDetail: '{name}の詳細を開く',
        openSavedDetailCta: '詳細を見る',
        openRouteDetail: '{name}ルートを開く',
        openRouteDetailCta: 'ルート詳細を開く',
        continueRoute: '続ける',
        editRoute: 'ルート編集',
        routeStops: '{count}件',
        routeProgress: '{done}/{total}完了',
        routeComplete: 'ルート完了',
        nextStop: '次のスポット',
        seeAll: 'すべて見る',
        showLess: '折りたたむ',
        personaLabel: 'ペルソナ',
        personaUnset: '未選択',
      },
      zh: {
        title: '我的',
        guestTitle: '访客旅行者',
        statsPlaces: '地点',
        statsRoutes: '路线',
        signInTitle: '登录后同步旅行',
        savedPlaces: '保存地点',
        noSavedPlaces: '还没有保存地点',
        noSavedPlacesHint: '打开地图，选择地点，然后点击爱心保存。',
        openMap: '在地图中打开',
        savedRoutes: '保存路线',
        noSavedRoutes: '还没有保存路线',
        noSavedRoutesHint: '生成路线或从地图添加地点后会保存在本地。',
        createFirstRoute: '创建第一条路线',
        openSavedDetail: '打开{name}详情',
        openSavedDetailCta: '查看详情',
        openRouteDetail: '打开{name}路线',
        openRouteDetailCta: '打开路线详情',
        continueRoute: '继续',
        editRoute: '编辑路线',
        routeStops: '{count}站',
        routeProgress: '已完成{done}/{total}',
        routeComplete: '路线已完成',
        nextStop: '下一站',
        seeAll: '查看全部',
        showLess: '收起',
        personaLabel: '画像',
        personaUnset: '未选择',
      },
    };

    for (const locale of SUPPORTED_LOCALES) {
      const copy = getUiCopy(locale);

      expect(LANGUAGE_NAMES[locale]).toBe(expectedLanguageNames[locale]);
      expect(LANGUAGE_NAMES[locale]).not.toMatch(/[?]/);
      expect(LANGUAGE_NAMES[locale].length).toBeGreaterThan(1);

      expect(copy.analyze.title.length).toBeGreaterThan(0);
      expect(copy.analyze.title).toBe(expectedAnalyzeCopy[locale].title);
      expect(copy.analyze.inputPlaceholder).toBe(expectedAnalyzeCopy[locale].inputPlaceholder);
      expect(copy.analyze.youtubeSupported).toBe(expectedAnalyzeCopy[locale].youtubeSupported);
      expect(copy.analyze.instagramPending).toBe(expectedAnalyzeCopy[locale].instagramPending);
      expect(copy.analyze.analyzeButton).toBe(expectedAnalyzeCopy[locale].analyzeButton);
      expect(copy.analyze.loadingTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingTitle).toBe(expectedAnalyzeCopy[locale].loadingTitle);
      expect(copy.analyze.loadingEstimate.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingColdStart.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingSteps).toHaveLength(4);
      expect(copy.analyze.loadingSteps).toEqual(expectedAnalyzeCopy[locale].loadingSteps);
      expect(copy.analyze.emptyTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.emptyBody.length).toBeGreaterThan(0);
      expect(copy.analyze.tryExample.length).toBeGreaterThan(0);
      expect(copy.analyze.sourceCache.length).toBeGreaterThan(0);
      expect(copy.analyze.sourceCache).toBe(expectedAnalyzeCopy[locale].sourceCache);
      expect(copy.analyze.cachedResultLoaded.length).toBeGreaterThan(0);
      expect(copy.analyze.unsupportedUrl.length).toBeGreaterThan(0);
      expect(copy.analyze.youtubeSupported.length).toBeGreaterThan(0);
      expect(copy.analyze.instagramPendingTitle.length).toBeGreaterThan(0);
      expect(copy.analyze.instagramPendingBody.length).toBeGreaterThan(0);
      expect(copy.analyze.openPost.length).toBeGreaterThan(0);
      expect(copy.analyze.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.analyze.viewOnMap).toBe(expectedAnalyzeCopy[locale].viewOnMap);
      expect(copy.analyze.buildRoute.length).toBeGreaterThan(0);
      expect(copy.analyze.buildRoute).toBe(expectedAnalyzeCopy[locale].buildRoute);
      expect(copy.analyze.routeSaved.length).toBeGreaterThan(0);
      expect(copy.analyze.routeSaved).toBe(expectedAnalyzeCopy[locale].routeSaved);
      expect(copy.analyze.routeSaveFailed.length).toBeGreaterThan(0);
      expect(copy.analyze.estimatedLocation.length).toBeGreaterThan(0);
      expect(copy.analyze.estimatedLocation).toBe(expectedAnalyzeCopy[locale].estimatedLocation);
      expect(copy.analyze.foundSpots).toBe(expectedAnalyzeCopy[locale].foundSpots);
      expect(copy.analyze.confidence).toBe(expectedAnalyzeCopy[locale].confidence);
      expect(copy.analyze.localModeTitle).toBe(expectedAnalyzeCopy[locale].localModeTitle);
      expect(copy.analyze.openVideo).toBe(expectedAnalyzeCopy[locale].openVideo);
      expect(copy.analyze.routeTitle).toBe(expectedAnalyzeCopy[locale].routeTitle);
      expect(JSON.stringify(copy.analyze)).not.toContain('?');

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
      expect(copy.route.title).toBe(expectedRouteCopy[locale].title);
      expect(copy.route.startGuidance.length).toBeGreaterThan(0);
      expect(copy.route.startGuidance).toBe(expectedRouteCopy[locale].startGuidance);
      expect(copy.route.miniMapTitle.length).toBeGreaterThan(0);
      expect(copy.route.travelSegment).toContain('{duration}');
      expect(copy.route.travelSegment).toContain('{distance}');
      expect(copy.route.travelSegment).toBe(expectedRouteCopy[locale].travelSegment);
      expect(copy.route.transitSegment).toContain('{duration}');
      expect(copy.route.transitSegment).toContain('{distance}');
      expect(copy.route.transitSegment).toBe(expectedRouteCopy[locale].transitSegment);
      expect(copy.route.travelSegmentBetween).toContain('{from}');
      expect(copy.route.travelSegmentBetween).toContain('{to}');
      expect(copy.route.locationCardTitle).toBe(expectedRouteCopy[locale].locationCardTitle);
      expect(copy.route.checkCurrentLocation).toBe(expectedRouteCopy[locale].checkCurrentLocation);
      expect(copy.route.openRouteMap.length).toBeGreaterThan(0);
      expect(copy.route.openRouteMap).toBe(expectedRouteCopy[locale].openRouteMap);
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
      expect(copy.route.extraStop.name).toBe(expectedRouteCopy[locale].extraStopName);
      expect(copy.route.routeCompleted).toBe(expectedRouteCopy[locale].routeCompleted);
      expect(JSON.stringify(copy.route)).not.toContain('?');

      expect(copy.common.signIn).toBe(expectedCommonCopy[locale].signIn);
      expect(copy.common.goBack).toBe(expectedCommonCopy[locale].goBack);
      expect(copy.common.goHome).toBe(expectedCommonCopy[locale].goHome);
      expect(copy.common.close).toBe(expectedCommonCopy[locale].close);
      expect(copy.common.changeViewMode).toBe(expectedCommonCopy[locale].changeViewMode);
      expect(copy.common.mobileView).toBe(expectedCommonCopy[locale].mobileView);
      expect(copy.common.desktopView).toBe(expectedCommonCopy[locale].desktopView);
      expect(copy.common.switchToMobileView.length).toBeGreaterThan(0);
      expect(copy.common.switchToDesktopView.length).toBeGreaterThan(0);
      expect(JSON.stringify(copy.common)).not.toContain('?');
      expect(copy.common.goBack.length).toBeGreaterThan(0);
      expect(copy.common.goHome.length).toBeGreaterThan(0);
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
      expect(copy.profile.title).toBe(expectedProfileCopy[locale].title);
      expect(copy.profile.guestTitle).toBe(expectedProfileCopy[locale].guestTitle);
      expect(copy.profile.statsPlaces).toBe(expectedProfileCopy[locale].statsPlaces);
      expect(copy.profile.statsRoutes).toBe(expectedProfileCopy[locale].statsRoutes);
      expect(copy.profile.openSavedDetail).toContain('{name}');
      expect(copy.profile.openSavedDetail).toBe(expectedProfileCopy[locale].openSavedDetail);
      expect(copy.profile.openSavedDetailCta.length).toBeGreaterThan(0);
      expect(copy.profile.openSavedDetailCta).toBe(expectedProfileCopy[locale].openSavedDetailCta);
      expect(copy.profile.openMap.length).toBeGreaterThan(0);
      expect(copy.profile.openMap).toBe(expectedProfileCopy[locale].openMap);
      expect(copy.profile.personaLabel.length).toBeGreaterThan(0);
      expect(copy.profile.personaLabel).toBe(expectedProfileCopy[locale].personaLabel);
      expect(copy.profile.personaUnset.length).toBeGreaterThan(0);
      expect(copy.profile.personaUnset).toBe(expectedProfileCopy[locale].personaUnset);
      expect(copy.profile.signInTitle.length).toBeGreaterThan(0);
      expect(copy.profile.signInTitle).toBe(expectedProfileCopy[locale].signInTitle);
      expect(copy.profile.signInDescription.length).toBeGreaterThan(0);
      expect(copy.profile.savedPlaces).toBe(expectedProfileCopy[locale].savedPlaces);
      expect(copy.profile.noSavedPlaces).toBe(expectedProfileCopy[locale].noSavedPlaces);
      expect(copy.profile.noSavedPlacesHint).toBe(expectedProfileCopy[locale].noSavedPlacesHint);
      expect(copy.profile.seeAll.length).toBeGreaterThan(0);
      expect(copy.profile.seeAll).toBe(expectedProfileCopy[locale].seeAll);
      expect(copy.profile.showLess.length).toBeGreaterThan(0);
      expect(copy.profile.showLess).toBe(expectedProfileCopy[locale].showLess);

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

      expect(copy.placeDetail.addToRoute).toBe(expectedPlaceDetailCopy[locale].addToRoute);
      expect(copy.placeDetail.addedToRoute).toBe(expectedPlaceDetailCopy[locale].addedToRoute);
      expect(copy.placeDetail.save).toBe(expectedPlaceDetailCopy[locale].save);
      expect(copy.placeDetail.saved).toBe(expectedPlaceDetailCopy[locale].saved);
      expect(copy.placeDetail.removed).toBe(expectedPlaceDetailCopy[locale].removed);
      expect(copy.placeDetail.docent).toBe(expectedPlaceDetailCopy[locale].docent);
      expect(copy.placeDetail.details).toBe(expectedPlaceDetailCopy[locale].details);
      expect(copy.placeDetail.parking).toBe(expectedPlaceDetailCopy[locale].parking);
      expect(copy.placeDetail.loadingDetail).toBe(expectedPlaceDetailCopy[locale].loadingDetail);
      expect(copy.placeDetail.detailFallback).toBe(expectedPlaceDetailCopy[locale].detailFallback);
      expect(copy.placeDetail.closeDetail).toBe(expectedPlaceDetailCopy[locale].closeDetail);
      expect(copy.placeDetail.closeDetail.length).toBeGreaterThan(0);
      expect(copy.placeDetail.addedToRoute.length).toBeGreaterThan(0);
      expect(copy.placeDetail.removed.length).toBeGreaterThan(0);
      expect(copy.placeDetail.imagePreview).toContain('{index}');
      expect(copy.placeDetail.imagePreview).toBe(expectedPlaceDetailCopy[locale].imagePreview);
      expect(copy.placeDetail.seenInTitle).toBe(expectedSeenInTitle[locale]);
      expect(copy.placeDetail.seenInTitle).toBe(expectedPlaceDetailCopy[locale].seenInTitle);
      expect(copy.placeDetail.seenInTitle.length).toBeGreaterThan(0);
      expect(copy.placeDetail.seenInYoutube).toContain('{count}');
      expect(copy.placeDetail.seenInInstagram).toContain('{count}');
      expect(copy.placeDetail.share.length).toBeGreaterThan(0);
      expect(copy.placeDetail.share).toBe(expectedPlaceDetailCopy[locale].share);
      expect(copy.placeDetail.shared.length).toBeGreaterThan(0);
      expect(copy.placeDetail.shared).toBe(expectedPlaceDetailCopy[locale].shared);
      expect(copy.placeDetail.copied.length).toBeGreaterThan(0);
      expect(copy.placeDetail.copied).toBe(expectedPlaceDetailCopy[locale].copied);
      expect(copy.placeDetail.shareUnavailable.length).toBeGreaterThan(0);
      expect(copy.placeDetail.shareUnavailable).toBe(expectedPlaceDetailCopy[locale].shareUnavailable);
      expect(copy.placeDetail.crowd.high.length).toBeGreaterThan(0);
      expect(copy.placeDetail.crowd.high).toBe(expectedPlaceDetailCopy[locale].crowdHigh);
      expect(JSON.stringify(copy.placeDetail)).not.toContain('?');

      expect(copy.persona.title.length).toBeGreaterThan(0);
      expect(copy.persona.title).toBe(expectedPersonaCopy[locale].title);
      expect(copy.persona.generatorEyebrow).toBe(expectedPersonaCopy[locale].generatorEyebrow);
      expect(copy.persona.chooseMood).toBe(expectedPersonaCopy[locale].chooseMood);
      expect(copy.persona.themes.kpop.details.bts.label.length).toBeGreaterThan(0);
      expect(copy.persona.themes.kpop.label).toBe(expectedPersonaCopy[locale].kpopLabel);
      expect(copy.persona.themes.kpop.details.bts.label).toBe(expectedPersonaCopy[locale].btsLabel);
      expect(copy.persona.themes.mood.details.cafe.label).toBe(expectedPersonaCopy[locale].moodCafeLabel);
      expect(copy.persona.themes.history.details.palace_day.label).toBe(
        expectedPersonaCopy[locale].historyPalaceDayLabel,
      );
      expect(copy.persona.reviewSelection.length).toBeGreaterThan(0);
      expect(copy.persona.reviewSelection).toBe(expectedPersonaCopy[locale].reviewSelection);
      expect(copy.persona.confirmTitle.length).toBeGreaterThan(0);
      expect(copy.persona.selectedTheme.length).toBeGreaterThan(0);
      expect(copy.persona.personalizeFeed.length).toBeGreaterThan(0);
      expect(copy.persona.personalizeFeed).toBe(expectedPersonaCopy[locale].personalizeFeed);
      expect(copy.persona.personaSaved.length).toBeGreaterThan(0);
      expect(copy.persona.personaSaveUnavailable.length).toBeGreaterThan(0);
      expect(copy.persona.routeGenerated.length).toBeGreaterThan(0);
      expect(copy.persona.routeGenerated).toBe(expectedPersonaCopy[locale].routeGenerated);
      expect(copy.persona.routeSaved.length).toBeGreaterThan(0);
      expect(copy.persona.routeSaved).toBe(expectedPersonaCopy[locale].routeSaved);
      expect(copy.persona.routeSaveUnavailable.length).toBeGreaterThan(0);
      expect(copy.persona.generate).toBe(expectedPersonaCopy[locale].generate);
      expect(copy.persona.routeTitle).toContain('{detail}');
      expect(copy.persona.routeTitle).toBe(expectedPersonaCopy[locale].routeTitle);
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
      expect(copy.docent.title).toBe(expectedDocentCopy[locale].title);
      expect(copy.docent.eyebrow).toBe(expectedDocentCopy[locale].eyebrow);
      expect(copy.docent.progressLabel).toBe(expectedDocentCopy[locale].progressLabel);
      expect(copy.docent.progressValue).toContain('{current}');
      expect(copy.docent.progressValue).toContain('{total}');
      expect(copy.docent.captionTitle.length).toBeGreaterThan(0);
      expect(copy.docent.play).toBe(expectedDocentCopy[locale].play);
      expect(copy.docent.backToRoute).toBe(expectedDocentCopy[locale].backToRoute);
      expect(copy.docent.fallbackName).toBe(expectedDocentCopy[locale].fallbackName);
      expect(copy.docent.scriptIntro).toContain('{name}');
      expect(copy.docent.scriptIntro).toContain('{category}');
      expect(copy.docent.scriptBody).toContain('{stayMinutes}');
      expect(copy.docent.scriptBody).toContain('{address}');
      expect(copy.docent.scriptTags).toContain('{tags}');
      expect(JSON.stringify(copy.docent)).not.toContain('?');

      expect(copy.profile.openRouteDetail).toContain('{name}');
      expect(copy.profile.openRouteDetail).toBe(expectedProfileCopy[locale].openRouteDetail);
      expect(copy.profile.openRouteDetailCta.length).toBeGreaterThan(0);
      expect(copy.profile.openRouteDetailCta).toBe(expectedProfileCopy[locale].openRouteDetailCta);
      expect(copy.profile.savedRoutes).toBe(expectedProfileCopy[locale].savedRoutes);
      expect(copy.profile.noSavedRoutes).toBe(expectedProfileCopy[locale].noSavedRoutes);
      expect(copy.profile.noSavedRoutesHint).toBe(expectedProfileCopy[locale].noSavedRoutesHint);
      expect(copy.profile.createFirstRoute).toBe(expectedProfileCopy[locale].createFirstRoute);
      expect(copy.profile.continueRoute).toBe(expectedProfileCopy[locale].continueRoute);
      expect(copy.profile.editRoute).toBe(expectedProfileCopy[locale].editRoute);
      expect(copy.profile.routeStops).toContain('{count}');
      expect(copy.profile.routeStops).toBe(expectedProfileCopy[locale].routeStops);
      expect(copy.profile.routeProgress).toContain('{done}');
      expect(copy.profile.routeProgress).toContain('{total}');
      expect(copy.profile.routeProgress).toBe(expectedProfileCopy[locale].routeProgress);
      expect(copy.profile.routeComplete).toBe(expectedProfileCopy[locale].routeComplete);
      expect(copy.profile.nextStop).toBe(expectedProfileCopy[locale].nextStop);
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
