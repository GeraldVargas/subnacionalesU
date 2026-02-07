import { api } from "./http";

export async function login(nombre_usuario, contrasena) {
  await api.csrf();
  return api.post("/api/login", { nombre_usuario, contrasena });
}

export const me = () => api.get("/api/me");
export const permissions = () => api.get("/api/permissions");
export const logout = () => api.post("/api/logout", {});
