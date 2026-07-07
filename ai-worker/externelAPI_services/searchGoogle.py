class GoogleSearchClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def summarize_place(self, place_name: str) -> str:
        return f"{place_name} 기본 정보 요약 (Google)"
