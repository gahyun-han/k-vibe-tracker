export const SUPPORTED_LOCALES = ['en', 'ko', 'ja', 'zh'] as const;

export type UiLocale = (typeof SUPPORTED_LOCALES)[number];

export const LANGUAGE_NAMES: Record<UiLocale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
};

const UI_COPY = {
  en: {
    common: {
      appName: 'K-Vibe Tracker',
      signIn: 'Sign in',
      close: 'Close',
    },
    landing: {
      eyebrow: 'Local-first travel lab',
      description:
        'Discover Korea through K-content inspired places, routes, and nearby travel helpers. TourAPI place data is used when a key is configured, with safe local fallbacks for development.',
      start: 'Explore K-Vibe',
      guestNotice: 'Map, Analyze, Route, and Radar work without login.',
      developmentMode: 'Development mode',
      developmentDescription:
        'External services stay behind explicit keys or approval gates, while core workflows remain testable locally.',
      trendingLabel: 'Trending prompts',
      trendingTags: ['Seongsu cafes', 'Gwangjang food', 'Palace drama', 'Hongdae photo', 'Han River night'],
      features: {
        map: 'TourAPI nearby spots',
        analyze: 'Local-first SNS extraction',
        route: 'Persona route planner',
        radar: 'Facility finder',
      },
    },
    nav: {
      map: 'Map',
      analyze: 'Analyze',
      route: 'Route',
      radar: 'Radar',
      profile: 'Profile',
    },
    categories: {
      all: 'All',
      cafe: 'Cafe',
      photo: 'Photo',
      fun: 'Fun',
      culture: 'Culture',
      food: 'Food',
      stay: 'Stay',
      spot: 'Spot',
    },
    map: {
      seoulFallback: 'Seoul fallback',
      currentLocation: 'Current location',
      searchPlaceholder: 'Search places',
      loadingNearby: 'Loading nearby places',
      placesError: 'Places could not be loaded',
      retry: 'Retry',
      noPlaces: 'No places found',
      addressPending: 'Address pending',
      addedFromMap: 'Added from the map as a {category} stop.',
      radiusLabel: 'km radius',
    },
    tutorial: {
      buttonLabel: 'Feature guide',
      title: 'Feature Guide',
      subtitle: 'A quick tour of what you can use in this MVP.',
      footer: 'Paid or permission-gated integrations stay disabled until credentials are approved.',
      steps: [
        {
          title: 'Map',
          body: 'Find nearby places from TourAPI or mock fallback data, filter categories, inspect details, and add a spot to your route.',
        },
        {
          title: 'Analyze',
          body: 'Paste a YouTube URL to test the SNS extraction flow. Local mock analysis keeps the page usable without AI costs.',
        },
        {
          title: 'Route',
          body: 'Generate a persona-based route, edit stops, reorder the timeline, and share the plan text.',
        },
        {
          title: 'Radar',
          body: 'Search nearby convenience facilities with radius/type filters and clear source hints.',
        },
        {
          title: 'Profile',
          body: 'Use guest mode now; Supabase sync and saved account history activate when credentials are configured.',
        },
      ],
    },
  },
  ko: {
    common: {
      appName: 'K-Vibe Tracker',
      signIn: '로그인',
      close: '닫기',
    },
    landing: {
      eyebrow: '로컬 우선 여행 실험실',
      description:
        'K-콘텐츠에서 영감을 받은 장소, 루트, 주변 편의 정보를 통해 한국 여행을 발견하세요. 키가 있으면 TourAPI 장소 데이터를 사용하고, 개발 중에는 안전한 로컬 대체 데이터를 유지합니다.',
      start: 'K-Vibe 둘러보기',
      guestNotice: '지도, 분석, 루트, 레이더는 로그인 없이 사용할 수 있어요.',
      developmentMode: '개발 모드',
      developmentDescription:
        '외부 서비스는 키나 승인 게이트 뒤에 두고, 핵심 흐름은 로컬에서 계속 테스트할 수 있게 유지합니다.',
      trendingLabel: '추천 탐색어',
      trendingTags: ['성수 카페', '광장시장 먹거리', '궁궐 드라마', '홍대 포토', '한강 야경'],
      features: {
        map: 'TourAPI 주변 장소',
        analyze: '로컬 우선 SNS 분석',
        route: '페르소나 루트 플래너',
        radar: '편의시설 찾기',
      },
    },
    nav: {
      map: '지도',
      analyze: '분석',
      route: '루트',
      radar: '레이더',
      profile: '프로필',
    },
    categories: {
      all: '전체',
      cafe: '카페',
      photo: '사진',
      fun: '즐길거리',
      culture: '문화',
      food: '음식',
      stay: '숙소',
      spot: '장소',
    },
    map: {
      seoulFallback: '서울 기본 위치',
      currentLocation: '현재 위치',
      searchPlaceholder: '장소 검색',
      loadingNearby: '주변 장소 불러오는 중',
      placesError: '장소를 불러오지 못했습니다',
      retry: '다시 시도',
      noPlaces: '장소를 찾지 못했습니다',
      addressPending: '주소 확인 중',
      addedFromMap: '지도에서 {category} 방문지로 추가했습니다.',
      radiusLabel: 'km 반경',
    },
    tutorial: {
      buttonLabel: '기능 안내',
      title: '기능 안내',
      subtitle: '현재 MVP에서 바로 사용할 수 있는 기능을 빠르게 확인하세요.',
      footer: '비용이나 권한이 필요한 연동은 자격 정보와 승인이 있기 전까지 비활성 상태로 둡니다.',
      steps: [
        {
          title: '지도',
          body: 'TourAPI 또는 로컬 대체 데이터로 주변 장소를 찾고, 카테고리 필터와 상세 보기, 루트 추가를 사용할 수 있습니다.',
        },
        {
          title: '분석',
          body: 'YouTube URL을 붙여 SNS 장소 추출 흐름을 테스트합니다. AI 비용 없이 로컬 mock 분석으로 화면이 동작합니다.',
        },
        {
          title: '루트',
          body: '페르소나 기반 루트를 만들고, 방문지를 수정하거나 순서를 바꾸고, 공유 문구를 만들 수 있습니다.',
        },
        {
          title: '레이더',
          body: '반경과 시설 유형을 바꿔 주변 편의시설을 찾고 데이터 출처 상태를 확인할 수 있습니다.',
        },
        {
          title: '프로필',
          body: '지금은 게스트 모드로 사용할 수 있고, Supabase 정보가 설정되면 계정 동기화와 저장 기록이 활성화됩니다.',
        },
      ],
    },
  },
  ja: {
    common: {
      appName: 'K-Vibe Tracker',
      signIn: 'ログイン',
      close: '閉じる',
    },
    landing: {
      eyebrow: 'ローカル優先の旅行ラボ',
      description:
        'Kコンテンツに着想したスポット、ルート、周辺サポート情報で韓国旅行を見つけましょう。キーが設定されている場合はTourAPIを使い、開発中は安全なローカル代替データを使います。',
      start: 'K-Vibeを探索',
      guestNotice: '地図、分析、ルート、レーダーはログインなしで使えます。',
      developmentMode: '開発モード',
      developmentDescription:
        '外部サービスはキーまたは承認ゲートの後ろに置き、主要フローはローカルで検証できる状態を保ちます。',
      trendingLabel: 'おすすめ検索',
      trendingTags: ['聖水カフェ', '広蔵市場グルメ', '宮殿ドラマ', '弘大フォト', '漢江ナイト'],
      features: {
        map: 'TourAPI周辺スポット',
        analyze: 'ローカル優先SNS分析',
        route: 'ペルソナルート',
        radar: '便利施設検索',
      },
    },
    nav: {
      map: '地図',
      analyze: '分析',
      route: 'ルート',
      radar: 'レーダー',
      profile: 'プロフィール',
    },
    categories: {
      all: 'すべて',
      cafe: 'カフェ',
      photo: '写真',
      fun: '遊び',
      culture: '文化',
      food: 'グルメ',
      stay: '宿泊',
      spot: 'スポット',
    },
    map: {
      seoulFallback: 'ソウル基準位置',
      currentLocation: '現在地',
      searchPlaceholder: 'スポット検索',
      loadingNearby: '周辺スポットを読み込み中',
      placesError: 'スポットを読み込めませんでした',
      retry: '再試行',
      noPlaces: 'スポットが見つかりません',
      addressPending: '住所確認中',
      addedFromMap: '地図から{category}スポットとして追加しました。',
      radiusLabel: 'km圏内',
    },
    tutorial: {
      buttonLabel: '機能ガイド',
      title: '機能ガイド',
      subtitle: 'このMVPで使える機能をすばやく確認できます。',
      footer: '費用や権限が必要な連携は、認証情報と承認があるまで無効のままです。',
      steps: [
        {
          title: '地図',
          body: 'TourAPIまたはローカル代替データで周辺スポットを探し、カテゴリ絞り込み、詳細表示、ルート追加ができます。',
        },
        {
          title: '分析',
          body: 'YouTube URLを貼り付けてSNSスポット抽出フローを試せます。AI費用なしでローカルmock分析が動作します。',
        },
        {
          title: 'ルート',
          body: 'ペルソナに基づくルートを作成し、立ち寄り先の編集、並べ替え、共有テキスト作成ができます。',
        },
        {
          title: 'レーダー',
          body: '半径と施設タイプを変えながら周辺の便利施設を検索し、データソースの状態を確認できます。',
        },
        {
          title: 'プロフィール',
          body: '今はゲストモードで利用できます。Supabase情報を設定すると同期と保存履歴が有効になります。',
        },
      ],
    },
  },
  zh: {
    common: {
      appName: 'K-Vibe Tracker',
      signIn: '登录',
      close: '关闭',
    },
    landing: {
      eyebrow: '本地优先旅行实验室',
      description:
        '通过受K内容启发的地点、路线和周边旅行助手发现韩国。配置密钥后使用TourAPI地点数据，开发时保留安全的本地备用数据。',
      start: '探索 K-Vibe',
      guestNotice: '地图、分析、路线和雷达无需登录即可使用。',
      developmentMode: '开发模式',
      developmentDescription:
        '外部服务保留在密钥或审批门槛之后，同时让核心流程可以在本地持续测试。',
      trendingLabel: '推荐搜索',
      trendingTags: ['圣水咖啡', '广藏市场美食', '宫殿韩剧', '弘大拍照', '汉江夜景'],
      features: {
        map: 'TourAPI周边地点',
        analyze: '本地优先SNS分析',
        route: '角色路线规划',
        radar: '便利设施查找',
      },
    },
    nav: {
      map: '地图',
      analyze: '分析',
      route: '路线',
      radar: '雷达',
      profile: '我的',
    },
    categories: {
      all: '全部',
      cafe: '咖啡',
      photo: '拍照',
      fun: '玩乐',
      culture: '文化',
      food: '美食',
      stay: '住宿',
      spot: '地点',
    },
    map: {
      seoulFallback: '首尔默认位置',
      currentLocation: '当前位置',
      searchPlaceholder: '搜索地点',
      loadingNearby: '正在加载附近地点',
      placesError: '无法加载地点',
      retry: '重试',
      noPlaces: '未找到地点',
      addressPending: '地址待确认',
      addedFromMap: '已从地图添加为{category}停靠点。',
      radiusLabel: 'km半径',
    },
    tutorial: {
      buttonLabel: '功能指南',
      title: '功能指南',
      subtitle: '快速了解当前MVP可以使用的功能。',
      footer: '涉及费用或权限的集成会保持关闭，直到提供凭据并获得批准。',
      steps: [
        {
          title: '地图',
          body: '使用TourAPI或本地备用数据查找周边地点，筛选分类，查看详情，并把地点加入路线。',
        },
        {
          title: '分析',
          body: '粘贴YouTube URL测试SNS地点提取流程。本地mock分析可避免AI费用。',
        },
        {
          title: '路线',
          body: '生成基于角色的路线，编辑停靠点，调整顺序，并生成分享文本。',
        },
        {
          title: '雷达',
          body: '按半径和设施类型搜索附近便利设施，并查看数据来源状态。',
        },
        {
          title: '我的',
          body: '当前可使用访客模式；配置Supabase后会启用账号同步和保存历史。',
        },
      ],
    },
  },
} as const;

export function normalizeUiLocale(value: string | string[] | undefined): UiLocale {
  const locale = Array.isArray(value) ? value[0] : value;
  return SUPPORTED_LOCALES.includes(locale as UiLocale) ? (locale as UiLocale) : 'en';
}

export function getUiCopy(locale: string | string[] | undefined) {
  return UI_COPY[normalizeUiLocale(locale)];
}
