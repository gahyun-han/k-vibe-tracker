class GeminiClient:
    provider = "gemini"

    def complete(self, prompt: str) -> str:
        return f"[{self.provider}] {prompt[:120]}"
