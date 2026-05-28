from fastapi import APIRouter

from app.schemas.architecture import ArchitectureSaveInput, ArchitectureSaveResponse
from app.services.architecture_service import save_architecture

router = APIRouter(prefix="/architecture", tags=["Architecture"])


@router.post("/save", response_model=ArchitectureSaveResponse)
def save(payload: ArchitectureSaveInput):
    return save_architecture(payload.name, payload.nodes, payload.edges)

