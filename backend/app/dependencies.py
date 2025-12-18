"""Container de dependências - Dependency Injection Container"""
from typing import Optional
from app.services.openrouter_client import OpenRouterClient
from app.services.quiz_service import QuizService
from app.services.summarizer_service import SummarizerService
from app.services.translator_service import TranslatorService

class DIContainer:
    """Container simples para gerenciar dependências"""
    
    def __init__(self):
        self._openrouter_client: Optional[OpenRouterClient] = None
        self._quiz_service: Optional[QuizService] = None
        self._summarizer_service: Optional[SummarizerService] = None
        self._translator_service: Optional[TranslatorService] = None
    
    @property
    def openrouter_client(self) -> OpenRouterClient:
        """Retorna instância singleton do OpenRouterClient"""
        if self._openrouter_client is None:
            self._openrouter_client = OpenRouterClient()
        return self._openrouter_client
    
    @property
    def quiz_service(self) -> QuizService:
        """Retorna instância singleton do QuizService"""
        if self._quiz_service is None:
            self._quiz_service = QuizService(self.openrouter_client)
        return self._quiz_service
    
    @property
    def summarizer_service(self) -> SummarizerService:
        """Retorna instância singleton do SummarizerService"""
        if self._summarizer_service is None:
            self._summarizer_service = SummarizerService(self.openrouter_client)
        return self._summarizer_service
    
    @property
    def translator_service(self) -> TranslatorService:
        """Retorna instância singleton do TranslatorService"""
        if self._translator_service is None:
            self._translator_service = TranslatorService(self.openrouter_client)
        return self._translator_service

container = DIContainer()

