import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import AreaRequestsCard from "../../components/AreaRequestsCard";
import { auth } from "../../services/firebase"; // ✅ pega do seu firebase conectado
import { subscribeRequests } from "../../services/requests";

import { Container } from "./styles";

// ✅ mapa limpo de rotas por área
const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplySaude",
  defesa: "ReplyDefesa",
};

// ✅ helper de navegação
function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request.id });
}

export default function Recebeiluminacao({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);

  // ✅ 1) escuta o Auth (garante que teremos UID quando carregar)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid || null;
      console.log("🔑 Auth UID:", nextUid);
      setUid(nextUid);

      if (!nextUid) {
        navigation.replace("Login");
      }
    });

    return () => unsubAuth();
  }, [navigation]);

  // ✅ 2) quando tiver UID, assina o Firestore
  useEffect(() => {
    if (!uid) return;

    const unsub = subscribeRequests({
      userId: uid,
      max: 200,
      onChange: setRequests,
    });

    return () => unsub?.();
  }, [uid]);

  // ✅ agrupa solicitações por área
  const groupedByArea = useMemo(() => {
    const map = {};

    (requests || []).forEach((r) => {
      const areaId = r?.areaId || "sem_area";

      if (!map[areaId]) {
        map[areaId] = {
          areaId,
          areaLabel: r?.areaLabel || areaId.toUpperCase(),
          requests: [],
        };
      }

      map[areaId].requests.push(r);
    });

    const arr = Object.values(map).sort((a, b) =>
      (a.areaLabel || "").localeCompare(b.areaLabel || "")
    );

    arr.forEach((g) => {
      g.requests.sort((a, b) => {
        const ta = a?.createdAt?.toMillis?.() ?? 0;
        const tb = b?.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
    });

    return arr;
  }, [requests]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Container style={{ flex: 1 }}>
            {groupedByArea.map((group) => (
              <AreaRequestsCard
                key={group.areaId}
                areaLabel={group.areaLabel}
                requests={group.requests}
                onPressRequest={(r) => navigateToReply(navigation, r)}
              />
            ))}
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
