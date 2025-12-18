from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Dict, Any
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from app.models.schemas import (
    QuizRequest, QuizResponse, QuizQuestion, QuizOption, ErrorResponse,
    ValidateAnswerRequest, ValidateAnswerResponse
)
from app.services.quiz_service import QuizService
from app.dependencies import container

router = APIRouter(prefix="/quiz", tags=["Quiz"])

def get_quiz_service() -> QuizService:
    """Dependency para injetar QuizService"""
    return container.quiz_service

limiter = Limiter(key_func=get_remote_address)

_quiz_cache: Dict[str, Dict[str, Any]] = {}

@router.post(
    "",
    response_model=QuizResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Gerar quiz",
    description="Gera perguntas de quiz baseadas em um tema ou material de estudo"
)
@limiter.limit("5/minute")
async def generate_quiz(
    request: Request, 
    quiz_request: QuizRequest,
    quiz_service: QuizService = Depends(get_quiz_service)
) -> QuizResponse:
    """
    Gerar quiz
    
    Recebe um tema ou material de estudo e retorna perguntas de múltipla escolha.
    Limite: 5 requisições por minuto por IP (geração de quiz consome mais recursos).
    """
    try:
        quiz_data = await quiz_service.generate_quiz(
            prompt=quiz_request.prompt,
            num_questions=quiz_request.num_questions,
        )
        
        questions = []
        for q in quiz_data.get("questions", []):
            options = [
                QuizOption(letter=opt["letter"], text=opt["text"])
                for opt in q.get("options", [])
            ]
            
            question_id = q.get("question_id", "") 
            
            questions.append(
                QuizQuestion(
                    question=q.get("question", ""),
                    options=options,
                    question_id=question_id,
                    explanation=None,
                )
            )
        
        if not questions:
            raise ValueError("Nenhuma pergunta foi gerada")
        
        for q in quiz_data.get("questions", []):
            question_id = q.get("question_id")
            if question_id:
                _quiz_cache[question_id] = quiz_data
        
        return QuizResponse(
            questions=questions,
            topic=quiz_data.get("topic", quiz_request.prompt),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar quiz: {str(e)}"
        )

@router.post(
    "/validate",
    response_model=ValidateAnswerResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
    },
    summary="Validar resposta do quiz",
    description="Valida uma resposta de uma pergunta do quiz"
)
@limiter.limit("30/minute")
async def validate_answer(
    request: Request, 
    validate_request: ValidateAnswerRequest,
    quiz_service: QuizService = Depends(get_quiz_service)
) -> ValidateAnswerResponse:
    """
    Validar resposta
    
    Valida se a resposta selecionada está correta.
    Limite: 30 requisições por minuto por IP (validação é mais leve).
    """
    try:
        quiz_data = None
        for cached_quiz in _quiz_cache.values():
            for q in cached_quiz.get("questions", []):
                if q.get("question_id") == validate_request.question_id:
                    quiz_data = cached_quiz
                    break
            if quiz_data:
                break
        
        if not quiz_data:
            raise HTTPException(status_code=404, detail="Pergunta não encontrada")
        
        result = quiz_service.validate_answer(quiz_data, validate_request.question_id, validate_request.answer)
        
        return ValidateAnswerResponse(
            is_correct=result["is_correct"],
            correct_answer=result["correct_answer"],
            explanation=result.get("explanation"),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao validar resposta: {str(e)}"
        )

