import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import AreaRequestsCard from "../../components/AreaRequestsCard";
import { subscribeRequests } from "../../services/requests";

import { Container } from "./styles";

// ✅ mapa de rotas por área (igual você fez no Recebeiluminacao)
const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplyExameseconsultas",
  defesa: "ReplyDefesa",
};

// ✅ helper de navegação por areaId
function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request?.id });
}

export default function AdminUserAreas({ navigation, route }) {
  const { userEmail = "" } = route?.params || {};
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsub = subscribeRequests({
      userId: null, // ✅ admin pega tudo (depois filtramos por email)
      max: 5000,
      onChange: (list) => setRequests(Array.isArray(list) ? list : []),
    });

    return () => unsub?.();
  }, []);

  const groupedByArea = useMemo(() => {
    const map = {};
    const emailLower = (userEmail || "").toLowerCase();

    const mine = (requests || []).filter((r) => {
      const emailOk = (r?.userEmail || "").toLowerCase() === emailLower;

      const notHidden = !r?.isHidden; // ✅ ESSENCIAL

      return emailOk && notHidden;
    });

    mine.forEach((r) => {
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

    // ✅ opcional: ordena por label da área
    return Object.values(map).sort((a, b) =>
      (a.areaLabel || "").localeCompare(b.areaLabel || ""),
    );
  }, [requests, userEmail]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        {groupedByArea.map((group) => (
          <AreaRequestsCard
            key={group.areaId}
            areaLabel={group.areaLabel}
            requests={group.requests}
            onPressRequest={(r) => navigateToReply(navigation, r)} // ✅ dinâmica por área
          />
        ))}
      </Container>
    </ScrollView>
  );
}
