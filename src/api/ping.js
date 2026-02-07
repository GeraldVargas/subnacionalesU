import { apiGet } from "./http";

export function ping() {
  return apiGet("/api/ping");
}
