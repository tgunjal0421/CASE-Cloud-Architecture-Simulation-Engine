from datetime import datetime, timezone
import uuid

ARCHITECTURES: dict[str, dict] = {}


def save_architecture(name: str, nodes: list, edges: list) -> dict:
    arch_id = f"arch_{uuid.uuid4().hex[:12]}"
    saved_at = datetime.now(timezone.utc).isoformat()
    ARCHITECTURES[arch_id] = {
        "id": arch_id,
        "name": name,
        "nodes": nodes,
        "edges": edges,
        "savedAt": saved_at,
    }
    return {"id": arch_id, "savedAt": saved_at}

