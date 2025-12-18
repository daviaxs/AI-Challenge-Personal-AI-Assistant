from typing import Optional
from app.services.interfaces import IOpenRouterClient

class SummarizerService:
    """Serviço especializado em resumir textos"""
    
    def __init__(self, ai_client: IOpenRouterClient):
        """Inicializa o serviço com o cliente de IA injetado"""
        self.ai_client = ai_client
    
    SYSTEM_PROMPT = """Você é um assistente especializado em resumir textos de forma clara, concisa e objetiva.

REGRAS OBRIGATÓRIAS:
1. Você APENAS resume textos fornecidos pelo usuário.
2. Se o usuário fizer um PEDIDO DE AÇÃO que não seja resumir um texto (ex: "faça uma receita", "explique física", "traduza", "calcule", "escreva código", "converse comigo"), você DEVE recusar educadamente.
3. Se o usuário enviar uma conversa ou diálogo, você DEVE recusar educadamente, pois conversas não são textos para resumir.
4. Mantenha apenas as informações mais importantes e relevantes do texto.
5. Use linguagem clara e direta.
6. Retorne APENAS o resumo, sem introduções, sem "Resumo:", sem explicações adicionais.

QUANDO RECUSAR:
- "faça uma receita" → Recuse: "Desculpe, eu apenas resumo textos. Por favor, envie um texto para eu resumir."
- "explique física quântica" → Recuse: "Desculpe, eu apenas resumo textos. Por favor, envie um texto para eu resumir."
- Conversas/diálogos → Recuse: "Desculpe, eu apenas resumo textos. Por favor, envie um texto para eu resumir."

QUANDO ACEITAR:
- Textos, artigos, parágrafos, documentos → Sempre resuma normalmente."""

    async def summarize(
        self,
        text: str,
        max_length: Optional[int] = None,
    ) -> str:
        """
        Gera um resumo do texto fornecido
        
        Args:
            text: Texto a ser resumido
            max_length: Tamanho máximo do resumo em palavras (opcional)
            
        Returns:
            Resumo do texto
        """
        length_instruction = f" em no máximo {max_length} palavras" if max_length else ""
        
        user_prompt = f"""Resuma o seguinte texto{length_instruction}, mantendo as informações mais importantes:

{text}

IMPORTANTE: Se o texto acima for um pedido de ação que não seja resumir um texto (ex: "faça uma receita", "explique", "traduza", "calcule", "converse"), ou se for uma conversa/diálogo, recuse educadamente. Caso contrário, resuma normalmente."""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        result = await self.ai_client.make_request(
            messages=messages,
            temperature=0.3,
            max_tokens=500 if max_length else None,
        )
        
        return result["content"].strip()

