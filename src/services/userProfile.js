import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// ✅ busca dados do usuário em users/{uid}
export async function getUserProfile(userId) {
  if (!userId) return null;

  const refDoc = doc(db, "users", userId);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

// ✅ pega só o endereço (campo "endereco" do seu print)
export async function getUserAddress(userId) {
  const profile = await getUserProfile(userId);
  const endereco = String(profile?.endereco || "").trim();
  return endereco || "";
}
