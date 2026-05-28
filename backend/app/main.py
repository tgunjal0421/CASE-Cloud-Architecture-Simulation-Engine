from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.simulation import router as simulation_router
from app.api.architecture import router as architecture_router

app = FastAPI(
    title="CASE Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation_router)
app.include_router(architecture_router)


@app.get("/")
def root():
    return {
        "message": "CASE Backend Running",
        "status": "ok",
    }