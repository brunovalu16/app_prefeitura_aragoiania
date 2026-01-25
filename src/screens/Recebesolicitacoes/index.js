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

import AdminUserCard from "../../components/AdminUserCard";

import { onAuthStateChanged } from "firebase/auth";
import AreaRequestsCard from "../../components/AreaRequestsCard";
import { auth } from "../../services/firebase";
import { deleteRequest, subscribeRequests } from "../../services/requests";

import { getAdminScopeByEmail } from "../../services/adminScope";
import { Container } from "./styles";

// ✅ mapa limpo de rotas por área
const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplyExameseconsultas",
  defesa: "ReplyDefesa",
};

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

function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request?.id });
}

export default function Recebesolicitacoes({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);

  const [scope, setScope] = useState(null);
  const isAdmin = !!scope;

  const [openUserId, setOpenUserId] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // ✅ 1) escuta o Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid || null;
      const email = String(user?.email || "").toLowerCase();

      setUid(nextUid);
      setScope(getAdminScopeByEmail(email)); // ✅ agora reconhece todos admins
      setAuthLoading(false);

      if (!nextUid) navigation.replace("Login");
    });

    return () => unsubAuth();
  }, [navigation]);

  // ✅ 2) assina Firestore
  useEffect(() => {
    if (!uid) return;

    setDataLoading(true);

    const unsub = subscribeRequests({
      userId: isAdmin ? undefined : uid, // ✅ admin: sem filtro userId (pega tudo)
      max: 200,
      onChange: (list) => {
        setRequests(Array.isArray(list) ? list : []);
        setDataLoading(false);
      },
    });

    return () => unsub?.();
  }, [uid, isAdmin]);

  const visibleRequests = useMemo(() => {
    const all = Array.isArray(requests) ? requests : [];

    // ✅ REGRA: ocultas não aparecem
    const notHidden = all.filter((r) => r?.isHidden !== true);

    // ✅ user normal: só as dele
    if (!isAdmin) return notHidden.filter((r) => r?.userId === uid);

    // ✅ admin: filtra só áreas permitidas
    const allowedAreas = Array.isArray(scope?.areaIds) ? scope.areaIds : [];
    return notHidden.filter((r) => allowedAreas.includes(r?.areaId));
  }, [requests, isAdmin, uid, scope]);

  // ✅ user normal: agrupa por área
  const groupedByArea = useMemo(() => {
    const map = {};

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
  }, [visibleRequests]);

  // ✅ admin: agrupa por usuário -> área -> solicitações
  const groupedByUserThenArea = useMemo(() => {
    const usersMap = {};

    visibleRequests.forEach((r) => {
      const userKey = r?.userId || "sem_user";
      const userEmail =
        r?.userEmail || r?.email || r?.ownerEmail || "Sem email";

      if (!usersMap[userKey]) {
        usersMap[userKey] = {
          userId: userKey,
          email: String(userEmail),
          areasMap: {},
        };
      }

      const areaId = r?.areaId || "sem_area";
      if (!usersMap[userKey].areasMap[areaId]) {
        usersMap[userKey].areasMap[areaId] = {
          areaId,
          areaLabel: r?.areaLabel || String(areaId).toUpperCase(),
          requests: [],
        };
      }

      usersMap[userKey].areasMap[areaId].requests.push(r);
    });

    return Object.values(usersMap)
      .map((u) => {
        const areasArr = Object.values(u.areasMap).sort((a, b) =>
          (a.areaLabel || "").localeCompare(b.areaLabel || ""),
        );

        areasArr.forEach((g) => {
          g.requests.sort((a, b) => {
            const ta = a?.createdAt?.toMillis?.() ?? 0;
            const tb = b?.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
        });

        return { userId: u.userId, email: u.email, areas: areasArr };
      })
      .sort((a, b) => (a.email || "").localeCompare(b.email || ""));
  }, [visibleRequests]);

  const showLoading = authLoading || (!!uid && dataLoading);

  function toggleUser(userId) {
    setOpenUserId((prev) => (prev === userId ? null : userId));
  }

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
                  minHeight: 500,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <ActivityIndicator size="large" />
                <Text style={{ opacity: 0.7 }}>Carregando solicitações...</Text>
              </View>
            ) : isAdmin ? (
              groupedByUserThenArea.map((userGroup) => {
                const isOpen = openUserId === userGroup.userId;

                return (
                  <View key={userGroup.userId} style={{ marginBottom: 12 }}>
                    <AdminUserCard
                      userEmail={userGroup.email}
                      count={userGroup.areas.reduce(
                        (acc, a) => acc + (a?.requests?.length || 0),
                        0,
                      )}
                      onPress={() => toggleUser(userGroup.userId)}
                    />

                    {isOpen && (
                      <View
                        style={{
                          marginTop: 8,
                          backgroundColor: "#fff",
                          borderRadius: 16,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.06)",
                        }}
                      >
                        <ScrollView
                          style={{ maxHeight: 380 }}
                          contentContainerStyle={{ paddingBottom: 10 }}
                          showsVerticalScrollIndicator={false}
                          nestedScrollEnabled
                        >
                          {userGroup.areas.map((areaGroup) => (
                            <AreaRequestsCard
                              key={`${userGroup.userId}-${areaGroup.areaId}`}
                              areaLabel={areaGroup.areaLabel}
                              requests={areaGroup.requests}
                              onPressRequest={(r) =>
                                navigateToReply(navigation, r)
                              }
                              onDeleteRequest={handleDeleteRequest}
                              defaultOpen={false}
                              minListHeight={160}
                              maxListHeight={320}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              groupedByArea.map((group) => (
                <AreaRequestsCard
                  key={group.areaId}
                  areaLabel={group.areaLabel}
                  requests={group.requests}
                  onPressRequest={(r) => navigateToReply(navigation, r)}
                  onDeleteRequest={handleDeleteRequest}
                />
              ))
            )}
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
