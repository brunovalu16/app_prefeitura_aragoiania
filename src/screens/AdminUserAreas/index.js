import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import AreaRequestsCard from "../../components/AreaRequestsCard";
import { subscribeRequests } from "../../services/requests";

import { Container } from "./styles";

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

    const mine = (requests || []).filter(
      (r) => (r?.userEmail || "").toLowerCase() === emailLower
    );

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

    return Object.values(map);
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
            onPressRequest={(r) =>
              navigation.navigate("Replyiluminacao", { requestId: r?.id })
            }
          />
        ))}
      </Container>
    </ScrollView>
  );
}
