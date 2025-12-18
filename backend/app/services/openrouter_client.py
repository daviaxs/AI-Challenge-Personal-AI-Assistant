import httpx
from typing import Optional, Dict, Any, List
from app.config import settings
from app.services.interfaces import IOpenRouterClient

class OpenRouterClient:
    """Cliente base para fazer requisições ao OpenRouter"""
    
    TIMEOUT = 60.0
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.api_url = settings.OPENROUTER_API_URL
        self.default_model = settings.DEFAULT_MODEL
        self._validate_config()
    
    def _validate_config(self) -> None:
        """Valida se as configurações necessárias estão presentes"""
        if not self.api_key or not self.api_key.strip():
            raise ValueError(
                "OPENROUTER_API_KEY não configurada. "
                "Verifique o arquivo .env na pasta backend."
            )
    
    def _build_headers(self) -> Dict[str, str]:
        """Constrói os headers da requisição"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Title": "AI Challenge - Personal AI Assistant",
        }
        
        referer = getattr(settings, "OPENROUTER_REFERER", "")
        if referer:
            headers["HTTP-Referer"] = referer
        
        return headers
    
    def _build_payload(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Constrói o payload da requisição"""
        payload: Dict[str, Any] = {
            "model": model or self.default_model,
            "messages": messages,
        }
        
        if temperature is not None:
            payload["temperature"] = temperature
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        return payload
    
    def _extract_error_message(self, response: httpx.Response) -> str:
        """Extrai mensagem de erro da resposta HTTP"""
        status_code = response.status_code
        error_detail = f"Erro HTTP {status_code}"
        
        try:
            error_data = response.json()
            if not isinstance(error_data, dict):
                return error_detail
            
            if "error" in error_data:
                error_obj = error_data["error"]
                if isinstance(error_obj, dict):
                    error_detail = error_obj.get("message") or error_obj.get("type") or error_detail
                else:
                    error_detail = str(error_obj)
            else:
                error_detail = error_data.get("message", error_detail)
        except (ValueError, KeyError):
            error_text = response.text[:500] if response.text else ""
            if error_text:
                error_detail = f"{error_detail}: {error_text}"
        
        return error_detail
    
    def _handle_http_error(self, error: httpx.HTTPStatusError, model: Optional[str]) -> None:
        """Trata erros HTTP e lança exceções apropriadas"""
        error_detail = self._extract_error_message(error.response)
        status_code = error.response.status_code
        
        if status_code == 404:
            model_name = model or self.default_model
            raise ValueError(
                f"Modelo ou endpoint não encontrado. "
                f"Verifique se o modelo '{model_name}' existe e se a API key está correta. "
                f"Erro: {error_detail}"
            )
        elif status_code == 401:
            raise ValueError(
                f"API key inválida ou não autorizada. "
                f"Verifique sua OPENROUTER_API_KEY. Erro: {error_detail}"
            )
        else:
            raise ValueError(
                f"Erro ao comunicar com OpenRouter ({status_code}): {error_detail}"
            )
    
    def _validate_response(self, data: Dict[str, Any]) -> None:
        """Valida a estrutura da resposta da API"""
        if "choices" not in data or not data["choices"]:
            raise ValueError("Resposta da API não contém 'choices'")
        
        content = data["choices"][0].get("message", {}).get("content", "")
        if not content:
            raise ValueError("Resposta da API não contém conteúdo")
        
    async def make_request(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Faz uma requisição para o OpenRouter
        
        Args:
            messages: Lista de mensagens no formato OpenAI
            model: Modelo a ser usado (usa default se None)
            temperature: Temperatura para geração (0-2)
            max_tokens: Número máximo de tokens na resposta
            
        Returns:
            Resposta da API do OpenRouter com 'content', 'model' e 'usage'
            
        Raises:
            ValueError: Se houver erro na requisição ou resposta inválida
        """
        headers = self._build_headers()
        payload = self._build_payload(messages, model, temperature, max_tokens)
        
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            try:
                response = await client.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
            except httpx.HTTPStatusError as e:
                self._handle_http_error(e, model)
            except httpx.RequestError as e:
                raise ValueError(f"Erro de conexão com OpenRouter: {str(e)}")
            
            self._validate_response(data)
            
            return {
                "content": data["choices"][0]["message"]["content"],
                "model": data.get("model"),
                "usage": data.get("usage", {}),
            }

