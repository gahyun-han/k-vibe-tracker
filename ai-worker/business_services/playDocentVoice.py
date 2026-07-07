from dependency import docent_repository


def play_docent_voice(place_id: str, language: str) -> dict:
    data = docent_repository.select(place_id) or {}
    voices = data.get("voices", {})
    file_path = voices.get(language) or voices.get("en")
    return {"place_id": place_id, "language": language, "audio_file_path": file_path}
