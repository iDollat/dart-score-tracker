import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authSession";
import type { LoginFormValues, RegisterFormValues, SkillLevel } from "@/lib/validation/authSchemas";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  defaultGameMode: 301 | 501;
  skillLevel: SkillLevel;
  localPlayersCount: number;
  localPlayerNames: string[];
  saveGameStats: boolean;
  acceptedTermsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type ApiErrorResponse = {
  error?: string;
  fields?: Record<string, string>;
  details?: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | T
    | null;

  if (!response.ok) {
    const error = data as ApiErrorResponse | null;

    const message =
      error?.fields && Object.values(error.fields).length > 0
        ? Object.values(error.fields)[0]
        : error?.error || "Wystąpił błąd.";

    const customError = new Error(message) as Error & {
      fields?: Record<string, string>;
    };

    customError.fields = error?.fields;

    throw customError;
  }

  return data as T;
}

export async function registerUser(payload: RegisterFormValues) {
  const localPlayerNames = payload.localPlayerNames
    .slice(0, payload.localPlayersCount)
    .map((player, index) => {
      const name = player.name.trim();
      return name.length > 0 ? name : `Gracz ${index + 1}`;
    });

  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      localPlayerNames,
    }),
  });

  const data = await handleResponse<AuthResponse>(response);

  setAuthToken(data.token);

  return data;
}

export async function loginUser(payload: LoginFormValues) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<AuthResponse>(response);

  setAuthToken(data.token);

  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    clearAuthToken();
    return null;
  }

  const data = await handleResponse<{ user: AuthUser }>(response);

  return data.user;
}

export async function logoutUser() {
  const token = getAuthToken();

  if (token) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {
      // Logout lokalny i tak czyści token.
    });
  }

  clearAuthToken();
}