import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import AreaRequestsCard from "../../components/AreaRequestsCard";
import { subscribeRequestsByArea } from "../../services/requests";
import { Container } from "./styles";

import { onAuthStateChanged } from "firebase/auth";
import { getAdminScopeByEmail } from "../../services/adminScope";
import { auth } from "../../services/firebase";

const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplyExameseconsultas",
  defesa: "ReplyDefesa",
};

function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request?.id });
}

export default function AdminUserAreas({ navigation, route }) {
  // ✅ agora recebemos também areaId/areaLabel vindos do AdminUsersInbox
  const {
    userEmail = "",
    areaId: areaIdFromParams = null,
    areaLabel: areaLabelFromParams = null,
  } = route?.params || {};

  const [requests, setRequests] = useState([]);
  const [scope, setScope] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // ✅ valida admin + scope
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthLoading(false);
        return navigation.replace("Login");
      }

      const nextScope = getAdminScopeByEmail(user?.email);
      if (!nextScope) {
        setAuthLoading(false);
        Alert.alert("Acesso negado", "Somente admin pode acessar esta área.");
        return navigation.replace("Home");
      }

      setScope(nextScope);
      setAuthLoading(false);
    });

    return () => unsub();
  }, [navigation]);

  // ✅ assina requests SOMENTE da área permitida
  useEffect(() => {
    if (!scope) return;

    // prioridade: params -> scope
    const areaId = areaIdFromParams || scope.areaIds?.[0] || null;
    if (!areaId) {
      setRequests([]);
      return;
    }

    setDataLoading(true);

    const unsub = subscribeRequestsByArea({
      areaId,
      onChange: (list) => {
        setRequests(Array.isArray(list) ? list : []);
        setDataLoading(false);
      },
    });

    return () => unsub?.();
  }, [scope, areaIdFromParams]);

  const groupedByArea = useMemo(() => {
    const map = {};
    const emailLower = String(userEmail || "").toLowerCase();

    const mine = (Array.isArray(requests) ? requests : []).filter((r) => {
      const emailOk =
        String(r?.userEmail || r?.email || "").toLowerCase() === emailLower;

      const notHidden = r?.isHidden !== true;

      // ✅ não mostrar concluídos/concluídas (saúde/iluminação)
      const status = String(r?.status || "").toLowerCase();
      const notConcluded = status !== "concluida" && status !== "concluido";

      return emailOk && notHidden && notConcluded;
    });

    mine.forEach((r) => {
      const aId = r?.areaId || "sem_area";

      if (!map[aId]) {
        map[aId] = {
          areaId: aId,
          areaLabel: r?.areaLabel || String(aId).toUpperCase(),
          requests: [],
        };
      }

      map[aId].requests.push(r);
    });

    // ✅ ordena solicitações por data (mais novas primeiro) dentro de cada área
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
  }, [requests, userEmail]);

  const showLoading = authLoading || dataLoading;

  const areaLabel = areaLabelFromParams || scope?.label || "ADMIN";

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        {showLoading ? (
          <View
            style={{
              minHeight: 260,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ opacity: 0.7 }}>Carregando solicitações...</Text>
          </View>
        ) : !groupedByArea.length ? (
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ opacity: 0.75 }}>
              Nenhuma solicitação pendente para {userEmail || "este usuário"} em{" "}
              {areaLabel}.
            </Text>
          </View>
        ) : (
          groupedByArea.map((group) => (
            <AreaRequestsCard
              key={group.areaId}
              areaLabel={group.areaLabel}
              requests={group.requests}
              onPressRequest={(r) => navigateToReply(navigation, r)}
              defaultOpen={true}
              minListHeight={160}
              maxListHeight={340}
            />
          ))
        )}
      </Container>
    </ScrollView>
  );
}
