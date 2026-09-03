const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gesdem_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const token = this.getToken();
    const isFormData = customConfig.body instanceof FormData;

    const defaultHeaders: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    };

    const config: RequestInit = {
      ...customConfig,
      headers: defaultHeaders,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else {
            errorMessage = Object.entries(errorData)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join(' | ');
          }
        }
      } catch {
        // Erreur de parsing JSON
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown, isFormData = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown, isFormData = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: unknown, isFormData = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
