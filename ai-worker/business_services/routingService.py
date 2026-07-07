from dependency import kakao_map_client


def estimate_route_duration(waypoints: list[dict]) -> dict:
    minutes = kakao_map_client.estimate_duration_minutes(waypoints)
    return {"estimated_minutes": minutes, "waypoint_count": len(waypoints)}
