const TOKEN_KEY = "tata-auth-token";
const USER_KEY = "tata-user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendedor" | "comprador";
  phone?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isMultipart = false
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = "Bea" + "rer " + token;
  }

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = isMultipart ? (body as BodyInit) : JSON.stringify(body);
  }

  const response = await fetch(path, options);

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignorar si no es JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Si no hay contenido (por ejemplo, 204 No Content), devolver undefined
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown, isMultipart = false) =>
    request<T>("POST", path, body, isMultipart),
  patch: <T>(path: string, body?: unknown, isMultipart = false) =>
    request<T>("PATCH", path, body, isMultipart),
  delete: <T>(path: string) => request<T>("DELETE", path),

  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  clearUser: () => localStorage.removeItem(USER_KEY),
};
