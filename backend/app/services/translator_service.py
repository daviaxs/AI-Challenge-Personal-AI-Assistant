from typing import Optional
from app.services.interfaces import IOpenRouterClient

class TranslatorService:
    """Serviço especializado em traduzir textos"""
    
    def __init__(self, ai_client: IOpenRouterClient):
        """Inicializa o serviço com o cliente de IA injetado"""
        self.ai_client = ai_client
    
    SYSTEM_PROMPT = """Você é um tradutor profissional. Sua função é traduzir textos entre diferentes idiomas.

REGRAS:
1. SEMPRE traduza o texto fornecido para o idioma de destino solicitado.
2. Aceite QUALQUER idioma de destino válido (pt, en, es, fr, de, it, ja, zh, ru, ar, etc.).
3. Traduza qualquer tipo de texto: palavras, frases, parágrafos, poemas.
4. Retorne APENAS o texto traduzido, sem comentários, sem desculpas, sem explicações, sem prefixos.

RECUSE APENAS se o texto for um PEDIDO DE AÇÃO explícito que não seja tradução:
- "faça uma receita" → Recuse
- "explique física" → Recuse  
- "resuma este texto" → Recuse
- "calcule 2+2" → Recuse

Para qualquer outro texto, SEMPRE traduza normalmente."""

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str] = None,
    ) -> str:
        """
        Traduz texto para o idioma de destino
        
        Args:
            text: Texto a ser traduzido
            target_language: Idioma de destino (ex: 'pt', 'en', 'es')
            source_language: Idioma de origem (opcional, auto-detecta se None)
            
        Returns:
            Texto traduzido
        """
        source_info = f" do {source_language}" if source_language else ""
        
        language_names = {
            'pt': 'português',
            'en': 'inglês',
            'es': 'espanhol',
            'fr': 'francês',
            'de': 'alemão',
            'it': 'italiano',
            'ja': 'japonês',
            'zh': 'chinês',
            'ru': 'russo',
            'ar': 'árabe',
        }
        
        target_lang_name = language_names.get(target_language.lower(), target_language)
        
        user_prompt = f"""Traduza este texto{source_info} para {target_lang_name} ({target_language}):

{text}

Retorne APENAS o texto traduzido, sem comentários, sem explicações."""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        result = await self.ai_client.make_request(
            messages=messages,
            temperature=0.3,
        )
        
        return result["content"].strip()

