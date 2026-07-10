from dependency import persona_repository


def show_persona_route(user_id: str) -> dict:
    return persona_repository.select(user_id) or {"message": "NO_PERSONA_ROUTE"}
