"""Routes for domain components."""

from fastapi import APIRouter, HTTPException
from app.data.components import DOMAIN_COMPONENTS

router = APIRouter(prefix="/api/domains", tags=["domains"])


@router.get("/")
async def get_domains():
    """
    Get all available domain components.
    
    Returns all cloud architecture domains with their available components.
    """
    try:
        return DOMAIN_COMPONENTS
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve domains")
