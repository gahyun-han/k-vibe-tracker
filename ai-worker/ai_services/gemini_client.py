import json

from config.logger import get_logger

logger = get_logger(__name__)


class GeminiClient:
    provider = "gemini"
    _MODEL_NAME = "gemini-1.5-flash"

    def __init__(self, api_key: str = "") -> None:
        self.api_key = api_key
        self._model = None
        if api_key:
            self._initialize_model()

    def _initialize_model(self) -> None:
        try:
            import google.generativeai as genai

            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(self._MODEL_NAME)
            logger.info(f"Gemini {self._MODEL_NAME} initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")

    def complete(self, prompt: str) -> str:
        """Send a prompt to Gemini and return the text response."""
        if not self._model:
            logger.warning("Gemini model not initialized — returning empty string")
            return ""
        try:
            response = self._model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini completion failed: {e}")
            return ""

    def is_available(self) -> bool:
        return self._model is not None
