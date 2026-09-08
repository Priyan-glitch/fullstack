from fastapi import FastAPI

app = FastAPI(
    title="Stable Roomies Algorithm Engine",
    description="Algorithm and allocation engine for Stable Roomies",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "algorithm-engine",
    }


@app.get("/")
def root():
    return {
        "message": "Stable Roomies Algorithm Engine",
    }