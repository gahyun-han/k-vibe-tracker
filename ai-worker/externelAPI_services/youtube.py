class YoutubeClient:
    def extract_places(self, video_id: str) -> list[dict]:
        if not video_id:
            return []
        return [
            {"name": "성수동 카페거리", "lat": 37.5447, "lng": 127.0564, "confidence": 0.92},
            {"name": "경복궁", "lat": 37.5796, "lng": 126.9770, "confidence": 0.87},
        ]
