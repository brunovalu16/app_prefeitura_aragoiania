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

import { db } from "./firebase"; // <- seu firebase já conectado

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
  const counterId = `${userId}_${areaId}`;
  const counterRef = doc(db, "counters", counterId);
  const reqCol = collection(db, "requests");
  const newReqRef = doc(reqCol); // gera ID antecipado

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
      // se você ainda não subiu pro storage, isso aqui vai ser uri local (não recomendo).
      // o ideal é virar array de URLs do storage.
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
 * Assina (realtime) solicitações do usuário por área
 */
export function subscribeRequests({
  userId,
  areaId,
  onChange,
  max = 50,
}) {
  const q = query(
    collection(db, "requests"),
    where("userId", "==", userId),
    where("areaId", "==", areaId),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange?.(data);
  });
}

/**
 * Assina (realtime) uma solicitação por id
 */
export function subscribeRequestById({ requestId, onChange }) {
  const refDoc = doc(db, "requests", requestId);
  return onSnapshot(refDoc, (snap) => {
    if (!snap.exists()) return onChange?.(null);
    onChange?.({ id: snap.id, ...snap.data() });
  });
}
