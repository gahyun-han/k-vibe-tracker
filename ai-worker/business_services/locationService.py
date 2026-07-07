from dependency import google_search_client, location_repository, naver_search_client


def run_location_refresh() -> None:
    for location_id, place_name in (("seoul-cityhall", "서울 시청"), ("gyeongbokgung", "경복궁")):
        google_summary = google_search_client.summarize_place(place_name)
        naver_summary = naver_search_client.summarize_place(place_name)
        location_repository.update(
            location_id,
            {
                "location_id": location_id,
                "name": place_name,
                "google_summary": google_summary,
                "naver_summary": naver_summary,
            },
        )


if __name__ == "__main__":
    run_location_refresh()
