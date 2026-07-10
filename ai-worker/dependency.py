from ai_services.gemini_client import GeminiClient
from ai_services.spot_extractor import SpotExtractorService
from config.configure import get_settings
from data_repositories.docentinfo import DocentInfoRepository
from data_repositories.locationinfo import LocationInfoRepository
from data_repositories.personainfo import PersonaInfoRepository
from data_repositories.routeinfo import RouteInfoRepository
from data_repositories.userinfo import UserInfoRepository
from externelAPI_services.kakaomap import KakaoMapClient
from externelAPI_services.searchGoogle import GoogleSearchClient
from externelAPI_services.searchNaver import NaverSearchClient
from externelAPI_services.tourAPI import TourApiClient
from externelAPI_services.tts import TextToSpeechClient
from externelAPI_services.youtube import YoutubeClient

EXTERNAL_API_DEPENDENCIES = {
    "tour_api": "한국관광공사 TourAPI",
    "kakaomap": "카카오맵 경로 API",
    "google_search": "Google 검색 API",
    "naver_search": "Naver 검색 API",
    "tts": "Text-to-Speech API",
    "youtube": "YouTube API",
    "gemini": "Google Gemini 1.5 Flash",
}

settings = get_settings()

tour_api_client = TourApiClient(settings.tour_api_key)
kakao_map_client = KakaoMapClient(settings.kakao_map_rest_key)
google_search_client = GoogleSearchClient(settings.google_search_api_key)
naver_search_client = NaverSearchClient(settings.naver_search_api_key)
tts_client = TextToSpeechClient(settings.tts_api_key)
youtube_client = YoutubeClient(settings.youtube_data_api_key)
gemini_client = GeminiClient(settings.google_ai_api_key)
spot_extractor = SpotExtractorService(gemini_client, youtube_client, kakao_map_client)

user_repository = UserInfoRepository()
route_repository = RouteInfoRepository()
persona_repository = PersonaInfoRepository()
location_repository = LocationInfoRepository()
docent_repository = DocentInfoRepository()
