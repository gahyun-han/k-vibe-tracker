import hashlib
from urllib.parse import parse_qs, urlparse


def extract_video_id(url: str) -> str | None:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()

    if hostname == "youtu.be":
        return parsed.path.lstrip("/")

    if "youtube.com" not in hostname:
        return None

    query = parse_qs(parsed.query)
    if "v" in query:
        return query["v"][0]

    parts = parsed.path.split("/")
    for keyword in ("shorts", "embed"):
        if keyword in parts:
            idx = parts.index(keyword)
            if idx + 1 < len(parts):
                return parts[idx + 1]
    return None


def cache_key(video_id: str) -> str:
    return f"kvibe:analysis:{hashlib.sha256(video_id.encode()).hexdigest()[:16]}"
