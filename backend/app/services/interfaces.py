from typing import Protocol, Dict, Any, List, Optional

class IOpenRouterClient(Protocol):
    """Protocolo para o cliente OpenRouter"""
    
    async def make_request(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Faz uma requisição para o OpenRouter"""
        ...

