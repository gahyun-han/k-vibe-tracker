class TextToSpeechClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def synthesize(self, text: str, language: str) -> str:
        safe_language = language.replace("/", "_")
        return f"/audio/{safe_language}/{abs(hash(text))}.mp3"
