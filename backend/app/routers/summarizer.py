from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from app.models.schemas import SummarizeRequest, SummarizeResponse, ErrorResponse
from app.services.summarizer_service import SummarizerService
from app.dependencies import container

router = APIRouter(prefix="/summarize", tags=["Summarizer"])

def get_summarizer_service() -> SummarizerService:
    """Dependency para injetar SummarizerService"""
    return container.summarizer_service

limiter = Limiter(key_func=get_remote_address)

@router.post(
    "",
    response_model=SummarizeResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Resumir texto",
    description="Gera um resumo conciso do texto fornecido usando IA"
)
@limiter.limit("10/minute")
async def summarize_text(
    request: Request, 
    summarize_request: SummarizeRequest,
    summarizer_service: SummarizerService = Depends(get_summarizer_service)
) -> SummarizeResponse:
    """
    Resumir texto
    
    Recebe um texto e retorna um resumo gerado por IA.
    Limite: 10 requisições por minuto por IP.
    """
    try:
        summary = await summarizer_service.summarize(
            text=summarize_request.text,
            max_length=summarize_request.max_length,
        )
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(summarize_request.text.split()),
            summary_length=len(summary.split()),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar resumo: {str(e)}"
        )

