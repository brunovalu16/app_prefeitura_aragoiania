import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Cria solicitação com numeração sequencial por userId+areaId
 */
export async function createRequest({
  userId,
  areaId,
  areaLabel,
  descricao,
  enderecoPoste,
  numeroPoste,
  images = [],
  location = null,
}) {
  if (!userId) throw new Error("createRequest: userId obrigatório");
  if (!areaId) throw new Error("createRequest: areaId obrigatório");
  if (!areaLabel) throw new Error("createRequest: areaLabel obrigatório");

  const counterId = `${userId}_${areaId}`;
  const counterRef = doc(db, "counters", counterId);
  const reqCol = collection(db, "requests");
  const newReqRef = doc(reqCol);

  const result = await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const lastNumber = counterSnap.exists()
      ? counterSnap.data().lastNumber || 0
      : 0;

    const nextNumber = lastNumber + 1;
    const requestTitle = `SOLICITAÇÃO ${areaLabel} - ${pad2(nextNumber)}`;

    tx.set(counterRef, { lastNumber: nextNumber }, { merge: true });

    tx.set(newReqRef, {
      userId,
      areaId,
      areaLabel,
      requestNumber: nextNumber,
      requestTitle,
      descricao: (descricao || "").trim(),
      enderecoPoste: (enderecoPoste || "").trim(),
      numeroPoste: (numeroPoste || "").trim(),
      images: Array.isArray(images) ? images : [],
      location: location || null,
      status: "execucao",
      createdAt: serverTimestamp(),
    });

    return { requestId: newReqRef.id, requestTitle };
  });

  return result;
}

/**
 * Assina (realtime) solicitações do usuário.
 * - Se passar areaId -> filtra por área
 * - Se NÃO passar areaId -> traz todas as solicitações do usuário
 */
export function subscribeRequests({ userId, areaId, onChange, max = 50 }) {
  // ✅ evita Firestore quebrar com where(undefined)
  if (!userId) {
    console.log("⚠️ subscribeRequests: userId vazio", userId);
    onChange?.([]);
    return () => {};
  }

  const ref = collection(db, "requests");

  // ✅ constraints base
  const constraints = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(max),
  ];

  // ✅ filtra por areaId só se existir
  if (areaId) {
    constraints.unshift(where("areaId", "==", areaId));
  }

  const q = query(ref, ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange?.(data);
    },
    (err) => {
      console.log("❌ subscribeRequests onSnapshot:", err?.code, err?.message);
      onChange?.([]);
    }
  );
}

/**
 * Assina (realtime) uma solicitação por id
 */
export function subscribeRequestById({ requestId, onChange }) {
  if (!requestId) {
    console.log("⚠️ subscribeRequestById: requestId vazio", requestId);
    onChange?.(null);
    return () => {};
  }

  const refDoc = doc(db, "requests", requestId);

  return onSnapshot(
    refDoc,
    (snap) => {
      if (!snap.exists()) return onChange?.(null);
      onChange?.({ id: snap.id, ...snap.data() });
    },
    (err) => {
      console.log("❌ subscribeRequestById onSnapshot:", err?.code, err?.message);
      onChange?.(null);
    }
  );
}
