import json
import hashlib
import random
from typing import Dict, Any, List, Tuple
from app.services.interfaces import IOpenRouterClient

class QuizService:
    """Serviço especializado em gerar quizzes educacionais"""
    
    def __init__(self, ai_client: IOpenRouterClient):
        """Inicializa o serviço com o cliente de IA injetado"""
        self.ai_client = ai_client
    
    SYSTEM_PROMPT = """Você é um assistente especializado EXCLUSIVAMENTE em criar questões de quiz educacionais.

REGRAS OBRIGATÓRIAS:
- Você APENAS cria quizzes sobre TEMAS VÁLIDOS E EDUCATIVOS.
- Se o tema fornecido for inválido (ex: caracteres repetidos, sem sentido, muito genérico), você DEVE recusar.
- Todas as perguntas devem ser de múltipla escolha com EXATAMENTE 4 opções (A, B, C, D).
- Apenas UMA opção deve ser correta.
- Cada pergunta DEVE ter uma explicação breve e clara da resposta correta.
- As perguntas devem testar conhecimento real sobre o tema, não serem triviais ou óbvias.
- As opções incorretas devem ser plausíveis, não absurdas.

QUANDO RECUSAR:
- Tema com caracteres repetidos (ex: "dddddddddd", "aaaaa", "12345")
- Tema muito genérico ou sem sentido (ex: "coisa", "algo", "teste")
- Tema que não permite criar perguntas educacionais válidas
- Tema muito curto ou sem contexto

QUANDO RECUSAR, retorne este JSON:
{
  "error": "Não é possível criar um quiz sobre este tema. Por favor, forneça um tema válido e educativo (ex: 'Filosofia antiga', 'História do Brasil', 'Física Quântica')."
}

QUANDO ACEITAR, retorne este JSON:
{
  "topic": "tema do quiz",
  "questions": [
    {
      "question": "pergunta aqui",
      "options": [
        {"letter": "A", "text": "opção A"},
        {"letter": "B", "text": "opção B"},
        {"letter": "C", "text": "opção C"},
        {"letter": "D", "text": "opção D"}
      ],
      "correct_answer": "B",
      "explanation": "explicação da resposta correta"
    }
  ]
}

IMPORTANTE SOBRE correct_answer:
- A resposta correta DEVE variar entre A, B, C e D em diferentes perguntas
- NÃO use sempre a mesma letra (ex: não coloque sempre "A")
- Distribua as respostas corretas de forma variada entre as perguntas
- Cada pergunta deve ter uma resposta correta diferente quando possível

IMPORTANTE: Retorne APENAS o JSON puro, sem markdown (sem ```json), sem código, sem explicações antes ou depois do JSON."""

    def _generate_question_id(self, question_text: str, topic: str) -> str:
        """Gera um ID único para a pergunta baseado no conteúdo"""
        content = f"{topic}:{question_text}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _is_valid_prompt(self, prompt: str) -> bool:
        """
        Validação básica prévia - apenas casos óbvios que não precisam da IA
        
        Args:
            prompt: Tema fornecido
            
        Returns:
            True se válido, False caso contrário
        """
        prompt_lower = prompt.lower().strip()
        
        if len(prompt_lower) < 10:
            return False
        
        chars_only = prompt_lower.replace(" ", "")
        if len(set(chars_only)) <= 2 and len(chars_only) > 5:
            return False
        
        if len(chars_only) > 0:
            most_common_char = max(set(chars_only), key=chars_only.count)
            if chars_only.count(most_common_char) / len(chars_only) > 0.7:
                return False
        
        alphanumeric_chars = sum(1 for c in prompt_lower if c.isalnum())
        if alphanumeric_chars < len(prompt_lower) * 0.5:
            return False
        
        return True

    def _build_user_prompt(self, prompt: str, num_questions: int) -> str:
        """Constrói o prompt do usuário para a IA"""
        return f"""Crie {num_questions} perguntas de quiz educacionais sobre: "{prompt}"

INSTRUÇÕES:
1. Analise o tema "{prompt}" - se for um tema educativo válido (mesmo que amplo como "Matemática avançada", "História", "Física"), você DEVE criar o quiz normalmente.
2. RECUSE APENAS se o tema for claramente inválido:
   - Palavras genéricas sem contexto: "teste", "coisa", "algo", "qualquer coisa"
   - Combinações genéricas: "testes teste", "coisa qualquer"
   - Textos sem sentido educativo: "sklmnfksnfk", "aaaaaaaa", "1234567890"
3. ACEITE temas educativos válidos, mesmo que amplos:
   - "Matemática avançada" ✅
   - "Física Quântica" ✅
   - "História do Brasil" ✅
   - "Literatura brasileira" ✅
   - "Biologia" ✅
   - "Química orgânica" ✅

SE O TEMA FOR CLARAMENTE INVÁLIDO (apenas casos óbvios), retorne:
{{"error": "O tema '{prompt}' não é válido para criar um quiz educativo. Por favor, forneça um tema educativo específico."}}

SE O TEMA FOR VÁLIDO (a maioria dos casos):
- Crie perguntas educacionais relevantes sobre "{prompt}".
- As perguntas devem testar conhecimento sobre o tema.
- IMPORTANTE: Varie as respostas corretas entre A, B, C e D. Não use sempre a mesma letra.
- Retorne o JSON com as perguntas no formato especificado."""

    async def _call_ai(self, user_prompt: str) -> str:
        """Faz a chamada à IA e retorna o conteúdo da resposta"""
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        
        result = await self.ai_client.make_request(
            messages=messages,
            temperature=0.7,
            max_tokens=3000,
        )
        
        return result["content"].strip()

    def _clean_ai_response(self, content: str) -> str:
        """Remove markdown do JSON retornado pela IA"""
        if content.startswith("```"):
            lines = content.split("\n")
            return "\n".join(lines[1:-1]) if len(lines) > 2 else content
        return content

    def _parse_quiz_response(self, content: str) -> Dict[str, Any]:
        """Parseia e valida o JSON retornado pela IA"""
        try:
            quiz_data = json.loads(content)
            
            if "error" in quiz_data:
                error_msg = quiz_data.get("error", "Tema inválido para criar quiz")
                raise ValueError(error_msg)
            
            if "questions" not in quiz_data or not isinstance(quiz_data["questions"], list):
                raise ValueError("Resposta da IA não contém perguntas válidas")
            
            if len(quiz_data["questions"]) == 0:
                raise ValueError("Nenhuma pergunta foi gerada")
            
            return quiz_data
        except json.JSONDecodeError as e:
            raise ValueError(f"Erro ao parsear resposta do quiz: {e}. Resposta recebida: {content[:200]}")

    def _shuffle_options(self, options: List[Dict[str, str]], correct_letter: str) -> Tuple[List[Dict[str, str]], str]:
        """Embaralha as opções e retorna as opções embaralhadas e a nova letra correta"""
        option_texts = [opt.get("text", "") for opt in options]
        
        correct_index = None
        for i, opt in enumerate(options):
            if opt.get("letter", "").upper() == correct_letter.upper():
                correct_index = i
                break
        
        if correct_index is None:
            return options, correct_letter
        
        indices = list(range(len(option_texts)))
        random.shuffle(indices)
        
        shuffled_options = []
        new_correct_letter = None
        letters = ["A", "B", "C", "D"]
        
        for new_pos, old_index in enumerate(indices):
            letter = letters[new_pos]
            shuffled_options.append({
                "letter": letter,
                "text": option_texts[old_index]
            })
            
            if old_index == correct_index:
                new_correct_letter = letter
        
        return shuffled_options, new_correct_letter or correct_letter

    def _process_questions(self, quiz_data: Dict[str, Any], prompt: str) -> None:
        """Processa as perguntas: gera IDs e embaralha opções"""
        topic = quiz_data.get("topic", prompt)
        
        for q in quiz_data.get("questions", []):
            question_text = q.get("question", "")
            q["question_id"] = self._generate_question_id(question_text, topic)
            
            original_correct = q.get("correct_answer", "A")
            options = q.get("options", [])
            
            if len(options) >= 4:
                shuffled_options, new_correct = self._shuffle_options(options, original_correct)
                q["options"] = shuffled_options
                q["_correct_answer"] = new_correct
            else:
                q["_correct_answer"] = original_correct
            
            q.pop("correct_answer", None)

    async def generate_quiz(
        self,
        prompt: str,
        num_questions: int = 5,
    ) -> Dict[str, Any]:
        """
        Gera perguntas de quiz baseadas no prompt/tema fornecido
        
        Args:
            prompt: Tema ou material de estudo
            num_questions: Número de perguntas a gerar
            
        Returns:
            Dicionário com topic e lista de questions
            
        Raises:
            ValueError: Se o tema for inválido ou a IA recusar
        """
        if not self._is_valid_prompt(prompt):
            raise ValueError(
                "O tema fornecido não é válido para criar um quiz. "
                "Por favor, forneça um tema educativo e significativo "
                "(ex: 'Filosofia antiga', 'História do Brasil', 'Física Quântica')."
            )
        
        user_prompt = self._build_user_prompt(prompt, num_questions)
        ai_response = await self._call_ai(user_prompt)
        clean_content = self._clean_ai_response(ai_response)
        quiz_data = self._parse_quiz_response(clean_content)
        self._process_questions(quiz_data, prompt)
        
        return quiz_data
    
    def validate_answer(self, questions_data: Dict[str, Any], question_id: str, answer: str) -> Dict[str, Any]:
        """
        Valida uma resposta do quiz
        
        Args:
            questions_data: Dados do quiz gerado (com _correct_answer)
            question_id: ID da pergunta
            answer: Resposta selecionada
            
        Returns:
            Dicionário com is_correct, correct_answer e explanation
        """
        for q in questions_data.get("questions", []):
            if q.get("question_id") == question_id:
                correct_answer = q.get("_correct_answer", "")
                is_correct = answer.upper() == correct_answer.upper()
                return {
                    "is_correct": is_correct,
                    "correct_answer": correct_answer,
                    "explanation": q.get("explanation", ""),
                }
        
        raise ValueError("Pergunta não encontrada")

