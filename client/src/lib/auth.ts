export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function removeAuthToken(): void {
  localStorage.removeItem("token");
}
