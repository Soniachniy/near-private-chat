import { TEMP_API_BASE_URL } from "./constants";

export interface ApiClientOptions {
  baseURL?: string;
  apiPrefix?: string;
  defaultHeaders?: Record<string, string>;
  includeAuth?: boolean;
}

export class ApiClient {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected includeAuth: boolean;

  constructor(options: ApiClientOptions = {}) {
    const { baseURL = TEMP_API_BASE_URL, apiPrefix = "/api", defaultHeaders = {}, includeAuth = true } = options;

    this.baseURL = `${baseURL}${apiPrefix}`;
    this.defaultHeaders = defaultHeaders;
    this.includeAuth = includeAuth;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...((options.headers as Record<string, string>) || {}),
      };

      if (this.includeAuth) {
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          throw new Error("No token found");
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      // biome-ignore lint/suspicious/noExplicitAny: explanation
      throw (err as any)?.detail || err || "An unknown error occurred";
    }
  }

  protected async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  protected async post<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    const requestOptions: RequestInit = {
      ...options,
      method: "POST",
    };

    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  protected async put<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    const requestOptions: RequestInit = {
      ...options,
      method: "PUT",
    };

    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  protected async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  protected async patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    const requestOptions: RequestInit = {
      ...options,
      method: "PATCH",
    };

    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    return this.request<T>(endpoint, requestOptions);
  }
}
