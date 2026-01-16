import * as FileSystem from "expo-file-system/legacy";
import { app, auth } from "./firebase";

function guessContentType(uri) {
  const u = (uri || "").toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  if (u.endsWith(".heic") || u.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

function genToken() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export async function uploadImageAsync({ uri, path }) {
  console.log("✅ uploadImageAsync REST ATIVO:", uri, "->", path);

  if (!uri) throw new Error("uploadImageAsync: uri obrigatório");
  if (!path) throw new Error("uploadImageAsync: path obrigatório");

  const bucket = app?.options?.storageBucket;
  if (!bucket) throw new Error("uploadImageAsync: storageBucket ausente");

  const user = auth.currentUser;
  if (!user) throw new Error("uploadImageAsync: usuário não autenticado");

  const idToken = await user.getIdToken(true);

  const name = encodeURIComponent(path);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${name}`;

  const contentType = guessContentType(uri);

  // ✅ token que vira link público
  const token = genToken();

  console.log("🪣 bucket(app):", bucket);
  console.log("🌐 uploadUrl:", uploadUrl);

  const result = await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": contentType,
      "x-goog-meta-firebaseStorageDownloadTokens": token,
    },
  });

  if (result.status !== 200) {
    throw new Error(
      `uploadImageAsync: status ${result.status} - ${result.body || "sem body"}`
    );
  }

  const json = JSON.parse(result.body || "{}");
  const objectName = json?.name || path;

  // ✅ se o firebase devolver downloadTokens, usa ele (mais seguro)
  const responseTokenRaw = json?.downloadTokens;
  const finalToken = (responseTokenRaw || token).split(",")[0];

  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    objectName
  )}?alt=media&token=${finalToken}`;

  return downloadURL;
}
