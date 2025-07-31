import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { LoginRequest } from "@shared/schema";

interface User {
  id: string;
  username: string;
  name: string;
}

interface LoginResponse {
  token: string;
  client: User;
}

export function useAuth() {
  const hasToken = !!localStorage.getItem("token");
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasToken, // Only run query if we have a token
  });

  return {
    user,
    isLoading: hasToken ? isLoading : false, // Not loading if no token
    isAuthenticated: !!user && hasToken,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/user"], data.client);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return {
    logout: () => {
      localStorage.removeItem("token");
      queryClient.clear();
      window.location.href = "/login";
    }
  };
}
