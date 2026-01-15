import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

const KEY = "@app_user_id_v1";

function randomId() {
  return `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function getUserId() {
  // ✅ 1) prioriza um ID do aparelho (mais estável)
  try {
    // ANDROID (retorna string)
    if (Application.getAndroidId) {
      const androidId = Application.getAndroidId();
      if (androidId) return `device_${androidId}`;
    }

    // iOS (retorna Promise<string>)
    if (Application.getIosIdForVendorAsync) {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) return `device_${iosId}`;
    }
  } catch (_err) {
    // ignora
  }

  // ✅ 2) fallback persistente no AsyncStorage
  const cached = await AsyncStorage.getItem(KEY);
  if (cached) return cached;

  // ✅ 3) último fallback: gera e salva
  const id = randomId();
  await AsyncStorage.setItem(KEY, id);
  return id;
}
