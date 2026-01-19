import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import HomeRequestsList from "../../components/HomeRequestsList";

import { auth } from "../../services/firebase";
import { subscribeRequests } from "../../services/requests";

import { Container } from "./styles";

const ADMIN_EMAIL = "brunovalu16@gmail.com";

// Pagina Home

export default function Home({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [uid, setUid] = useState(null);

  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = (user?.email || "").toLowerCase();
      setIsAdmin(email === ADMIN_EMAIL.toLowerCase());
      setUid(user?.uid || null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const unsub = subscribeRequests({
      userId: uid,
      max: 50,
      onChange: (list) => setMyRequests(Array.isArray(list) ? list : []),
    });

    return () => unsub?.();
  }, [uid]);

  const items = isAdmin
    ? [
        {
          id: "admin-1",
          title: "PAINEL ADMIN",
          subtitle: "CAIXA DE ENTRADA POR ÁREA",
          route: "AdminUsersInbox",
        },
      ]
    : [];

  const quickList = useMemo(() => {
    return (myRequests || [])
      .filter((r) => (r?.status || "").toLowerCase() !== "concluida")
      .slice(0, 3);
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
          onPressItem={(item) => {
            if (item.route) navigation.navigate(item.route);
          }}
          onMenuPressItem={() => {}}
        />

        <View style={{ paddingHorizontal: 12, marginTop: -160 }}>
          {quickList.length ? (
            quickList.map((r) => (
              <View key={r.id} style={{ marginBottom: 10 }}>
                <HomeLastRequestCard
                  title="MINHAS SOLICITAÇÕES"
                  subtitle={r.requestTitle}
                  status={r.status || "analise"}
                  onPress={() => navigation.navigate("Recebeiluminacao")}
                  onMenuPress={() => {}}
                />
              </View>
            ))
          ) : (
            <Text style={{ opacity: 0.6 }}></Text>
          )}
        </View>
      </Container>
    </ScrollView>
  );
}
