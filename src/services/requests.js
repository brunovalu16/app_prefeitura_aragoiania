import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";

import { deleteObject, getStorage, ref, ref as storageRef } from "firebase/storage";
import { db, storage } from "./firebase";
import { uploadImageAsync } from "./uploadImage";





function pad2(n) {
  return String(n).padStart(2, "0");
}

// ✅ helper: pega url de [{url}] | [{uri}] | string
function getImgUri(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img?.url || img?.uri || null;
}

export async function deleteRequestImage({ requestId, imgObj }) {
  if (!requestId) throw new Error("requestId obrigatório");
  if (!imgObj) throw new Error("imgObj obrigatório");

  const db = getFirestore();
  const storage = getStorage();

  // 1) remove do array no Firestore
  const requestRef = doc(db, "requests", requestId);
  await updateDoc(requestRef, {
    images: arrayRemove(imgObj),
  });

  // 2) tenta apagar do Storage (se for URL do Firebase Storage)
  const uri = getImgUri(imgObj);
  if (uri && uri.includes("firebasestorage.googleapis.com")) {
    try {
      const decodedPath = decodeURIComponent(uri.split("/o/")[1]?.split("?")[0] || "");
      if (decodedPath) {
        await deleteObject(ref(storage, decodedPath));
      }
    } catch (e) {
      // não quebra se não conseguir apagar do storage
      console.log("⚠️ storage delete (images) falhou:", e?.message);
    }
  }
}


export async function updateRequestStatus({ requestId, status, userId }) {
  if (!requestId) throw new Error("requestId obrigatório");
  if (!status) throw new Error("status obrigatório");

  const db = getFirestore();
  const ref = doc(db, "requests", requestId);

  await updateDoc(ref, {
    status,
    statusUpdatedAt: serverTimestamp(),
    statusUpdatedBy: userId || null,
  });
}

// ✅ apaga arquivo do Storage por URL (se der erro, não quebra)
async function tryDeleteByUrl(url) {
  try {
    if (!url || typeof url !== "string") return;

    // só apaga se for URL do Firebase Storage
    if (!url.includes("firebasestorage.googleapis.com")) return;

    const decoded = decodeURIComponent(url);

    // extrai o "object path" entre "/o/" e "?"
    const marker = "/o/";
    const i = decoded.indexOf(marker);
    if (i === -1) return;

    const rest = decoded.slice(i + marker.length);
    const objectPath = rest.split("?")[0];
    if (!objectPath) return;

    await deleteObject(storageRef(storage, objectPath));
  } catch (_e) {
    // ignora: arquivo pode já ter sido deletado, permissão, etc.
  }
}

/**
 * ✅ Cria solicitação com numeração sequencial por userId+areaId
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

  // ✅ 1) cria doc dentro da transaction (sem images ainda)
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
      createdAt: serverTimestamp(),
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

    uploaded.push({ url, createdAt: Date.now() });
  }

  await updateDoc(newReqRef, { images: uploaded });

  return result;
}

/**
 * ✅ Assina (realtime) solicitações do usuário
 */
export function subscribeRequests({ userId, max = 200, onChange }) {
  const qBase = collection(db, "requests");

  let q = query(qBase, orderBy("createdAt", "desc"), limit(max));

  if (userId) {
    q = query(qBase, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(max));
  }

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange?.(list);
  });
}


/**
 * ✅ Assina (realtime) uma solicitação por id
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

  const obj = {
    url,
    createdAt: Date.now(),
  };

  await updateDoc(refDoc, {
    processImages: arrayUnion(obj),
  });

  return obj; // ✅ retorna o objeto exato salvo
}

/**
 * ✅ Remove UMA imagem do array processImages
 * - remove do Firestore (arrayRemove no objeto exato)
 * - apaga do Storage
 */
export async function deleteProcessImage({ requestId, imgObj }) {
  if (!requestId) throw new Error("deleteProcessImage: requestId obrigatório");
  if (!imgObj) throw new Error("deleteProcessImage: imgObj obrigatório");

  const refDoc = doc(db, "requests", requestId);

  // 1) remove do firestore
  await updateDoc(refDoc, {
    processImages: arrayRemove(imgObj),
  });

  // 2) remove do storage
  const url = getImgUri(imgObj);
  await tryDeleteByUrl(url);

  return { ok: true };
}

/**
 * ✅ Deleta solicitação:
 * - Lê doc para pegar URLs
 * - Apaga imagens do Storage (images + processImages)
 * - Deleta doc no Firestore
 */
export async function deleteRequest({ requestId }) {
  if (!requestId) throw new Error("deleteRequest: requestId obrigatório");

  const refDoc = doc(db, "requests", requestId);
  const snap = await getDoc(refDoc);

  if (snap.exists()) {
    const data = snap.data() || {};

    const images = Array.isArray(data.images) ? data.images : [];
    const processImages = Array.isArray(data.processImages) ? data.processImages : [];

    const urls = [
      ...images.map(getImgUri),
      ...processImages.map(getImgUri),
    ].filter(Boolean);

    await Promise.all(urls.map(tryDeleteByUrl));
  }

  await deleteDoc(refDoc);

  return { ok: true };
}


//função deletar images
