const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface PydanticError {
  type: string;
  loc: string[];
  msg: string;
}

interface ErrorResponse {
  detail?: string | PydanticError[];
  error?: string;
  message?: string;
}

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  string_too_short: {
    text: 'O texto precisa ter pelo menos 10 caracteres para ser resumido.',
    prompt: 'O tema precisa ter pelo menos 10 caracteres.',
  },
};

const getErrorMessage = (status: number, errorData: ErrorResponse): string => {
  if (status === 429) {
    return 'Muitas requisições. Por favor, aguarde um momento antes de tentar novamente.';
  }

  if (status === 401) {
    return 'Não autorizado. Verifique suas credenciais.';
  }

  if (status === 404) {
    return 'Recurso não encontrado.';
  }

  if (Array.isArray(errorData.detail)) {
    const firstError = errorData.detail[0];
    if (!firstError?.msg) return errorData.detail as unknown as string;

    const fieldMessages = ERROR_MESSAGES[firstError.type];
    if (fieldMessages) {
      const field = firstError.loc?.find(loc => fieldMessages[loc]);
      if (field) return fieldMessages[field];
    }

    return firstError.msg;
  }

  return errorData.detail || errorData.error || errorData.message || `Erro HTTP ${status}`;
};

export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({}));
        const errorMessage = getErrorMessage(response.status, errorData);
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao fazer requisição');
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const httpClient = new HttpClient(API_BASE_URL);


