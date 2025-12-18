# AI Challenge - Personal AI Assistant

Assistente pessoal com IA que oferece três funcionalidades principais: Resumidor de Texto, Tradutor e Criador de Quiz.

## Funcionalidades

- **Resumidor de Texto**: Resuma textos longos de forma concisa e objetiva
- **Tradutor**: Traduza textos entre diferentes idiomas com suporte a 10+ idiomas
- **Criador de Quiz**: Gere perguntas de múltipla escolha baseadas em qualquer tema

## Pré-requisitos

- **Python 3.11+** (para o backend)
- **Node.js 18+** (para o frontend)
- **OpenRouter API Key**

## Instalação

### 1. Backend

```bash
cd backend

# Primeiro, crie o ambiente virtual
python -m venv venv

------

# Segundo, ative o ambiente virtual

## Windows
venv\Scripts\activate

## Linux/Mac
source venv/bin/activate

------

# Terceiro, instale as dependências
pip install -r requirements.txt

```

### 2. Frontend

```bash
cd frontend
npm install
```

## Configuração

### 1. Backend - Configurar API Key

Crie um arquivo `.env` na pasta `backend`:

```env
OPENROUTER_API_KEY=sua_api_key_aqui
```

### 2. Frontend - Configurar URL da API (Opcional)

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:8000/api
```

Caso não tenha um .env definindo a URL da API, o front por padrão irá usar `http://localhost:8000/api`

## Como Executar

### Passo 1: Iniciar o Backend

Abra um terminal e execute:

```bash
cd backend

# Ative o ambiente virtual
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# Execute o backend
python -m app.main
```

O backend estará rodando em `http://localhost:8000`

### Passo 2: Iniciar o Frontend

Abra **outro terminal** e execute:

```bash
cd frontend
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## Estrutura do Projeto

```
AI-Challenge-Personal-AI-Assistant/
├── backend/              # API Python (FastAPI)
│   ├── app/
│   │   ├── config.py    # Configurações
│   │   ├── main.py      # Entry point
│   │   ├── models/      # Schemas Pydantic
│   │   ├── routers/     # Endpoints da API
│   │   └── services/    # Serviços de IA
│   ├── requirements.txt
│   └── .env            # Variáveis de ambiente
│
├── frontend/            # Interface React + TypeScript
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── services/   # Serviços de API
│   │   └── shared/     # Componentes compartilhados
│   ├── package.json
│   └── .env           # Variáveis de ambiente (opcional)
│
└── README.md          # Este arquivo
```

## Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **Uvicorn** - Servidor ASGI
- **httpx** - Cliente HTTP assíncrono
- **Pydantic** - Validação de dados e schemas
- **python-dotenv** - Gerenciamento de variáveis de ambiente
- **slowapi** - Rate limiting

### Frontend
- **React** + **TypeScript** - Interface moderna
- **Vite** - Build tool rápida
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Framer Motion** - Animações

## Notas

- Todas as funcionalidades são stateless (sem persistência de dados)
- A API não armazena histórico de conversas

## Possiveis Problemas

### Backend não inicia
- Verifique se o `.env` está configurado com `OPENROUTER_API_KEY`
- Certifique-se de que o ambiente virtual está ativado
- Verifique se a porta 8000 está livre

### Frontend não conecta ao backend
- Verifique se o backend está rodando em `http://localhost:8000`
- Confirme a variável `VITE_API_URL` no `.env` do frontend (se configurada)
