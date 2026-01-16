import {
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { uploadImageAsync } from "./uploadImage";

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Cria solicitação com numeração sequencial por userId+areaId
 * ✅ Upload das imagens para Storage e salva URLs no Firestore
 * ⚠️ SEM serverTimestamp dentro de arrays
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

  // ✅ normaliza imagens: [{uri}] | [{url}] | ["..."]
  const safeImages = Array.isArray(images) ? images : [];
  const imageUris = safeImages
    .map((img) => {
      if (!img) return null;
      if (typeof img === "string") return img;
      return img.uri || img.url || null;
    })
    .filter(Boolean);

  // ✅ 1) cria doc vazio (images/processImages) dentro da transaction
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

      images: [], // ✅ preenche depois com URLs
      processImages: [], // ✅ já inicia

      location: location || null,
      status: "execucao",
      createdAt: serverTimestamp(), // ✅ aqui pode
    });

    return { requestId: newReqRef.id, requestTitle, requestNumber: nextNumber };
  });

  // ✅ 2) se não tiver imagens, já retorna
  if (!imageUris.length) return result;

  // ✅ 3) upload fora da transaction e salva urls no doc
  const uploaded = [];

  for (let i = 0; i < imageUris.length; i++) {
    const uri = imageUris[i];

    // se já for url http(s), mantém
    if (
      typeof uri === "string" &&
      (uri.startsWith("http://") || uri.startsWith("https://"))
    ) {
      uploaded.push({ url: uri, createdAt: Date.now() });
      continue;
    }

    const filePath = `requests/${userId}/${areaId}/${result.requestId}/request/${Date.now()}_${i}.jpg`;
    const url = await uploadImageAsync({ uri, path: filePath });

    uploaded.push({
      url,
      createdAt: Date.now(), // ✅ permitido em array
    });
  }

  await updateDoc(newReqRef, { images: uploaded });

  return result;
}

/**
 * Assina (realtime) solicitações do usuário.
 */
export function subscribeRequests({ userId, areaId, onChange, max = 50 }) {
  if (!userId) {
    console.log("⚠️ subscribeRequests: userId vazio", userId);
    onChange?.([]);
    return () => {};
  }

  const refCol = collection(db, "requests");

  const constraints = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(max),
  ];

  if (areaId) constraints.unshift(where("areaId", "==", areaId));

  const q = query(refCol, ...constraints);

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

/**
 * ✅ Anexa foto do processo:
 * - Upload no Storage
 * - Salva em processImages: [{ url, createdAt }]
 */
export async function addProcessImage({ requestId, userId, areaId, uri }) {
  if (!requestId) throw new Error("addProcessImage: requestId obrigatório");
  if (!userId) throw new Error("addProcessImage: userId obrigatório");
  if (!uri) throw new Error("addProcessImage: uri obrigatório");

  const safeArea = areaId || "iluminacao";

  const filePath = `requests/${userId}/${safeArea}/${requestId}/process/${Date.now()}.jpg`;
  const url = await uploadImageAsync({ uri, path: filePath });

  const refDoc = doc(db, "requests", requestId);

  await updateDoc(refDoc, {
    processImages: arrayUnion({
      url,
      createdAt: Date.now(), // ✅ permitido
    }),
  });

  return { url };
}
