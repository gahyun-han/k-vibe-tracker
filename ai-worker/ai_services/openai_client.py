class OpenAIClient:
    provider = "openai"

    def complete(self, prompt: str) -> str:
        return f"[{self.provider}] {prompt[:120]}"
