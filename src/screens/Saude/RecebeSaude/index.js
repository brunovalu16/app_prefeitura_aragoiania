import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import AreaRequestsCard from "../../../components/AreaRequestsCard";
import { auth } from "../../../services/firebase";
import { deleteRequest, subscribeRequests } from "../../../services/requests";

import { Container } from "./styles";

// ✅ mapa limpo de rotas por área
const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplyExameseconsultas",
  defesa: "ReplyDefesa",
};

//função deletar
async function handleDeleteRequest(request) {
  try {
    const status = (request?.status || "").toLowerCase();

    if (status !== "analise") {
      return Alert.alert(
        "Não é possível excluir",
        "Essa solicitação não pode ser deletada pois está em andamento.",
      );
    }

    Alert.alert(
      "Excluir solicitação",
      "Tem certeza que deseja excluir? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteRequest({ requestId: request.id });
          },
        },
      ],
    );
  } catch (e) {
    console.log("❌ deleteRequest:", e?.code, e?.message);
    Alert.alert("Erro", "Não foi possível excluir a solicitação.");
  }
}

// ✅ helper de navegação
function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request?.id });
}

//Pagina Recebeiluminacao

export default function RecebeSaude({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ ADD

  // ✅ loading states
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // ✅ 1) escuta o Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid || null;
      const email = (user?.email || "").toLowerCase();

      console.log("🔑 Auth UID:", nextUid);
      console.log("📧 Auth Email:", email);

      setUid(nextUid);
      setIsAdmin(email === "brunovalu16@gmail.com"); // ✅ admin pelo email
      setAuthLoading(false);

      if (!nextUid) navigation.replace("Login");
    });

    return () => unsubAuth();
  }, [navigation]);

  // ✅ 2) quando tiver UID, assina o Firestore
  useEffect(() => {
    if (!uid) return;

    setDataLoading(true);

    const unsub = subscribeRequests({
      userId: isAdmin ? null : uid, // ✅ admin: sem filtro de userId
      max: 200,
      onChange: (list) => {
        setRequests(Array.isArray(list) ? list : []);
        setDataLoading(false);
      },
    });

    return () => unsub?.();
  }, [uid, isAdmin]); // ✅ ADD isAdmin

  // ✅ agrupa solicitações por área
  const groupedByArea = useMemo(() => {
    const map = {};

    // ✅ usuário não vê concluída
    const visibleRequests = (requests || []).filter(
      (r) => (r?.status || "").toLowerCase() !== "concluida",
    );

    visibleRequests.forEach((r) => {
      const areaId = r?.areaId || "sem_area";

      if (!map[areaId]) {
        map[areaId] = {
          areaId,
          areaLabel: r?.areaLabel || String(areaId).toUpperCase(),
          requests: [],
        };
      }

      map[areaId].requests.push(r);
    });

    const arr = Object.values(map).sort((a, b) =>
      (a.areaLabel || "").localeCompare(b.areaLabel || ""),
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

  const showLoading = authLoading || (!!uid && dataLoading);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Container style={{ flex: 1 }}>
            {showLoading ? (
              <View
                style={{
                  flex: 1,
                  minHeight: 300,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <ActivityIndicator size="large" />
                <Text style={{ opacity: 0.7 }}>Carregando solicitações...</Text>
              </View>
            ) : (
              groupedByArea.map((group) => (
                <AreaRequestsCard
                  key={group.areaId}
                  areaLabel={group.areaLabel}
                  requests={group.requests}
                  onPressRequest={(r) => navigateToReply(navigation, r)}
                  onDeleteRequest={handleDeleteRequest} // ✅ ADD
                />
              ))
            )}
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
