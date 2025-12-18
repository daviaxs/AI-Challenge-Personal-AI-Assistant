from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.routers import summarizer, translator, quiz

settings.validate()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summarizer.router, prefix="/api")
app.include_router(translator.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")

@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "AI Challenge - Personal AI Assistant API",
        "version": settings.API_VERSION,
        "endpoints": {
            "summarize": "/api/summarize",
            "translate": "/api/translate",
            "quiz": "/api/quiz",
        },
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )

