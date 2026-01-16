import * as FileSystem from "expo-file-system/legacy";
import { app, auth } from "./firebase";

function genToken() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export async function testStorageUpload() {
  const bucket = app?.options?.storageBucket;
  if (!bucket) throw new Error("testStorageUpload: storageBucket ausente");

  const user = auth.currentUser;
  if (!user) throw new Error("testStorageUpload: usuário não autenticado");

  const idToken = await user.getIdToken(true);

  const localUri = `${FileSystem.cacheDirectory}storage_test_${Date.now()}.txt`;
  await FileSystem.writeAsStringAsync(localUri, "TESTE STORAGE OK");

  const remotePath = `tests/${Date.now()}.txt`;
  const name = encodeURIComponent(remotePath);

  // ✅ SOMENTE este endpoint
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${name}`;
  const token = genToken();

  console.log("🪣 bucket(app):", bucket);
  console.log("🌐 test uploadUrl:", uploadUrl);

  const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
    httpMethod: "POST",
    headers: {
      // ✅ Bearer (não Firebase, não GCS)
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "text/plain",
      "x-goog-meta-firebaseStorageDownloadTokens": token,
    },
  });

  if (result.status !== 200) {
    throw new Error(`TEST status ${result.status} - ${result.body || "sem body"}`);
  }

  const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    remotePath
  )}?alt=media&token=${token}`;

  console.log("✅ STORAGE TEST OK:", downloadURL);
  return { remotePath, downloadURL };
}
