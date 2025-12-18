from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from app.models.schemas import TranslateRequest, TranslateResponse, ErrorResponse
from app.services.translator_service import TranslatorService
from app.dependencies import container

router = APIRouter(prefix="/translate", tags=["Translator"])

def get_translator_service() -> TranslatorService:
    """Dependency para injetar TranslatorService"""
    return container.translator_service

limiter = Limiter(key_func=get_remote_address)

@router.post(
    "",
    response_model=TranslateResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Traduzir texto",
    description="Traduz texto entre diferentes idiomas usando IA"
)
@limiter.limit("10/minute")
async def translate_text(
    request: Request, 
    translate_request: TranslateRequest,
    translator_service: TranslatorService = Depends(get_translator_service)
) -> TranslateResponse:
    """
    Traduzir texto
    
    Recebe um texto e o idioma de destino, retorna o texto traduzido.
    Se o idioma de origem não for informado, será detectado automaticamente.
    Limite: 10 requisições por minuto por IP.
    """
    try:
        translated_text = await translator_service.translate(
            text=translate_request.text,
            target_language=translate_request.target_language,
            source_language=translate_request.source_language,
        )
        
        # Para simplificar, assumimos que o source_language foi detectado ou é o padrão
        # Em uma implementação mais robusta, poderíamos fazer o modelo retornar isso
        detected_source = translate_request.source_language or "auto-detected"
        
        return TranslateResponse(
            translated_text=translated_text,
            source_language=detected_source,
            target_language=translate_request.target_language,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar tradução: {str(e)}"
        )

