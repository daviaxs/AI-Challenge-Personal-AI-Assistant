import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Configurações da aplicação"""
    
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_API_URL: str = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
    
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "openai/gpt-4o-mini")
    
    API_TITLE: str = "AI Challenge - Personal AI Assistant"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "API para assistente pessoal com IA usando OpenRouter"
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    @classmethod
    def validate(cls) -> None:
        """Valida se as configurações necessárias estão presentes"""
        if not cls.OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY não encontrada. Configure a variável de ambiente.")

settings = Settings()

