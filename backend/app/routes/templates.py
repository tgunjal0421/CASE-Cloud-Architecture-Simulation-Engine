"""Routes for architecture templates."""

from fastapi import APIRouter, HTTPException
from app.data.templates import TEMPLATES

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("/")
async def get_templates():
    """
    Get all predefined architecture templates.
    
    Returns all available templates that users can use as starting points.
    """
    try:
        return TEMPLATES
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve templates")


@router.get("/{template_name}")
async def get_template(template_name: str):
    """
    Get a specific template by name.
    
    Args:
        template_name: The name of the template to retrieve
        
    Returns:
        The requested template or 404 if not found
    """
    try:
        template = TEMPLATES.get(template_name)
        if not template:
            raise HTTPException(status_code=404, detail=f"Template '{template_name}' not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve template")
