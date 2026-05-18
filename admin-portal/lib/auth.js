export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("adminAccessToken"));
export const setToken = (token) => localStorage.setItem("adminAccessToken", token);
export const clearToken = () => localStorage.removeItem("adminAccessToken");
