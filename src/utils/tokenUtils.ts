export const tokenUtils = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  setUser: (user: object) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
