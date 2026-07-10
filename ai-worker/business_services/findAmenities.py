from dependency import tour_api_client


def find_amenities(keyword: str) -> list[dict]:
    return tour_api_client.search_keyword(keyword)
