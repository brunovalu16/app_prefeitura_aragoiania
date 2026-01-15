import { auth } from "./firebase";

export function getAuthUserId() {
  // ✅ retorna null se não estiver logado (não lança erro)
  return auth?.currentUser?.uid ?? null;
}
