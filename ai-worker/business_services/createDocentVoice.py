from dependency import docent_repository, google_search_client, naver_search_client, tts_client


def create_docent_voice(place_id: str, place_name: str, languages: list[str]) -> dict:
    summary = google_search_client.summarize_place(place_name)
    if len(summary.strip()) < 10:
        summary = naver_search_client.summarize_place(place_name)

    voices: dict[str, str] = {}
    for language in languages:
        voices[language] = tts_client.synthesize(summary, language)

    payload = {
        "place_id": place_id,
        "place_name": place_name,
        "summary": summary,
        "voices": voices,
    }
    docent_repository.update(place_id, payload)
    return payload
