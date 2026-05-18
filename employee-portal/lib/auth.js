export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("accessToken"));
export const setToken = (token) => localStorage.setItem("accessToken", token);
export const clearToken = () => localStorage.removeItem("accessToken");
