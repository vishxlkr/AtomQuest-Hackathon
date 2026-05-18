"use client";
import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../lib/api";
import { clearToken, getToken, setToken } from "../lib/auth";
const AuthContext = createContext(null);
function reducer(state, action) { if (action.type === "SET_USER") return { user: action.user, isLoading: false }; if (action.type === "LOGOUT") return { user: null, isLoading: false }; return state; }
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true });
  useEffect(() => { if (!getToken()) return dispatch({ type: "LOGOUT" }); api.get("/auth/me").then((res) => dispatch({ type: "SET_USER", user: res.data.data })).catch(() => dispatch({ type: "LOGOUT" })); }, []);
  const login = async (email, password) => { const res = await api.post("/auth/login", { email, password }); const user = res.data.data.user; setToken(res.data.data.accessToken); dispatch({ type: "SET_USER", user }); return user; };
  const logout = async () => { await api.post("/auth/logout").catch(() => {}); clearToken(); dispatch({ type: "LOGOUT" }); };
  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
