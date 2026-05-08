import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
} from "@/api/authApi";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/lib/validation/authSchemas";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  register: (payload: RegisterFormValues) => Promise<void>;
  login: (payload: LoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshUser]);

  const register = useCallback(async (payload: RegisterFormValues) => {
    const response = await registerUser(payload);
    setUser(response.user);
  }, []);

  const login = useCallback(async (payload: LoginFormValues) => {
    const response = await loginUser(payload);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      refreshUser,
    }),
    [user, loading, register, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}