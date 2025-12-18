from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# ===========================================================================
# Summarizer Schemas
# ===========================================================================

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Texto a ser resumido")
    max_length: Optional[int] = Field(None, ge=50, le=500, description="Tamanho máximo do resumo em palavras")

class SummarizeResponse(BaseModel):
    summary: str = Field(..., description="Resumo do texto")
    original_length: int = Field(..., description="Tamanho do texto original")
    summary_length: int = Field(..., description="Tamanho do resumo gerado")

# ===========================================================================
# Translator Schemas
# ===========================================================================

class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Texto a ser traduzido")
    target_language: str = Field(..., min_length=2, max_length=10, description="Idioma de destino (ex: 'pt', 'en', 'es')")
    source_language: Optional[str] = Field(None, min_length=2, max_length=10, description="Idioma de origem (opcional, auto-detecta se não informado)")

class TranslateResponse(BaseModel):
    translated_text: str = Field(..., description="Texto traduzido")
    source_language: str = Field(..., description="Idioma de origem detectado")
    target_language: str = Field(..., description="Idioma de destino")

# ===========================================================================
# Quiz Schemas
# ===========================================================================

class QuizOption(BaseModel):
    letter: str = Field(..., description="Letra da opção (A, B, C, D)")
    text: str = Field(..., description="Texto da opção")

class QuizQuestion(BaseModel):
    question: str = Field(..., description="Pergunta do quiz")
    options: List[QuizOption] = Field(..., min_items=2, max_items=6, description="Opções de resposta")
    question_id: str = Field(..., description="ID único da pergunta para validação")
    explanation: Optional[str] = Field(None, description="Explicação da resposta correta (apenas após responder)")

class QuizQuestionWithAnswer(QuizQuestion):
    """Versão interna com a resposta correta"""
    correct_answer: str = Field(..., description="Letra da resposta correta")

class QuizRequest(BaseModel):
    prompt: str = Field(..., min_length=10, description="Tema ou material de estudo para gerar o quiz")
    num_questions: Optional[int] = Field(5, ge=1, le=10, description="Número de perguntas a gerar")

class ValidateAnswerRequest(BaseModel):
    question_id: str = Field(..., description="ID da pergunta")
    answer: str = Field(..., description="Resposta selecionada (A, B, C, D)")

class ValidateAnswerResponse(BaseModel):
    is_correct: bool = Field(..., description="Se a resposta está correta")
    correct_answer: str = Field(..., description="Resposta correta")
    explanation: Optional[str] = Field(None, description="Explicação da resposta")

class QuizResponse(BaseModel):
    questions: List[QuizQuestion] = Field(..., description="Lista de perguntas do quiz")
    topic: str = Field(..., description="Tema do quiz")

# ===========================================================================
# Error Schemas
# ===========================================================================

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Mensagem de erro")
    detail: Optional[str] = Field(None, description="Detalhes adicionais do erro")

