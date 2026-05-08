from fastapi import FastAPI

from app.api.simulation import router as simulation_router

app = FastAPI(
    title="CASE Backend"
)

app.include_router(simulation_router)


@app.get("/")
def root():
    return {
        "message": "CASE Backend Running 🚀"
    }