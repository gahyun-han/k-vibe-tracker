PROMPT_TEMPLATES = {
    "persona_analysis": "사용자 입력을 여행 페르소나 관점으로 분석하고 장소 후보를 JSON 배열로 반환하세요.",
    "spot_extraction": """당신은 한국 여행 장소 추천 전문가입니다.
아래 YouTube 영상 정보에서 등장하는 한국의 실제 여행 스팟(장소)을 추출하세요.

## 영상 제목
{title}

## 영상 설명
{description}

## 자막/스크립트
{transcript}

## 지시사항
- 영상에서 언급된 실제 한국 여행 장소를 최대 8개 추출하세요
- 추상적인 광역 지명(서울, 부산 등)은 제외하고 구체적인 장소명을 추출하세요
- 각 장소의 카테고리를 지정하세요: cafe, restaurant, landmark, park, shopping, culture, nature, other
- confidence는 영상에서 얼마나 명확하게 언급되었는지 0.0~1.0으로 표시하세요
- 반드시 아래 JSON 형식만 반환하세요 (추가 텍스트 없이)

```json
[
  {{
    "name": "장소명 (한국어)",
    "category": "cafe",
    "confidence": 0.95,
    "reason": "영상에서 언급된 이유 (한 줄 요약)"
  }}
]
```
""",
}
