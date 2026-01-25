import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import AreaRequestsCard from "../../components/AreaRequestsCard";
import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeRequestsList from "../../components/HomeRequestsList";

import { auth } from "../../services/firebase";
import { subscribeRequests } from "../../services/requests";

import { Container } from "./styles";

import { getAdminScopeByEmail } from "../../services/adminScope";

// ✅ mapa limpo de rotas por área (igual Recebesolicitacoes)
const AREA_REPLY_ROUTE = {
  iluminacao: "Replyiluminacao",
  saude: "ReplyExameseconsultas",
  defesa: "ReplyDefesa",
};

function navigateToReply(navigation, request) {
  const route = AREA_REPLY_ROUTE[request?.areaId] || "Replyiluminacao";
  navigation.navigate(route, { requestId: request?.id });
}

export default function Home({ navigation }) {
  const [uid, setUid] = useState(null);
  const [scope, setScope] = useState(null);

  const [myRequests, setMyRequests] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdmin = !!scope;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = String(user?.email || "").toLowerCase();

      setScope(getAdminScopeByEmail(email)); // ✅ agora reconhece adminsaude/adminiluminacao
      setUid(user?.uid || null);

      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (authLoading) return;

    // ✅ admin NÃO busca solicitações na Home
    if (isAdmin) {
      setMyRequests([]);
      return;
    }

    if (!uid) return;

    const unsub = subscribeRequests({
      userId: uid,
      max: 200,
      onChange: (list) => setMyRequests(Array.isArray(list) ? list : []),
    });

    return () => unsub?.();
  }, [uid, isAdmin, authLoading]);

  // ✅ card admin aparece para QUALQUER admin do scope
  const items = isAdmin
    ? [
        {
          id: "admin-1",
          title: "PAINEL ADMIN",
          subtitle: scope?.label || "CAIXA DE ENTRADA POR ÁREA",
          route: "AdminUsersInbox",
        },
      ]
    : [];

  // ✅ AGRUPA POR ÁREA (user normal)
  const groupedByAreaQuick = useMemo(() => {
    const map = {};
    const visibleRequests = (myRequests || []).filter((r) => !r?.isHidden);

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

    const arr = Object.values(map);

    arr.sort((a, b) => (a.areaLabel || "").localeCompare(b.areaLabel || ""));

    arr.forEach((g) => {
      g.requests.sort((a, b) => {
        const ta = a?.createdAt?.toMillis?.() ?? 0;
        const tb = b?.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
    });

    return arr.slice(0, 3);
  }, [myRequests]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        <HomeBigCarousel navigation={navigation} />

        <HomeRequestsList
          items={items}
          onPressItem={(item) => item.route && navigation.navigate(item.route)}
          onMenuPressItem={() => {}}
        />

        {/* ✅ user normal */}
        {!isAdmin && (
          <View style={{ paddingHorizontal: 12, marginTop: -160 }}>
            {groupedByAreaQuick.length ? (
              groupedByAreaQuick.map((group) => (
                <AreaRequestsCard
                  key={group.areaId}
                  areaLabel={group.areaLabel}
                  requests={group.requests}
                  onPressRequest={(r) => navigateToReply(navigation, r)}
                />
              ))
            ) : (
              <Text style={{ opacity: 0.6 }} />
            )}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}
