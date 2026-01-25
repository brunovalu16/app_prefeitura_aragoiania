import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { subscribeRequests } from "../../services/requests";

import AdminUserCard from "../../components/AdminUserCard";
import { Container } from "./styles";

import { getAdminScopeByEmail } from "../../services/adminScope";

export default function AdminUsersInbox({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [scope, setScope] = useState(null);

  // ✅ auth + scope
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid || null;
      const email = String(user?.email || "").toLowerCase();

      setUid(nextUid);

      if (!nextUid) {
        setAuthLoading(false);
        navigation.replace("Login");
        return;
      }

      const nextScope = getAdminScopeByEmail(email);
      if (!nextScope) {
        setAuthLoading(false);
        Alert.alert("Acesso negado", "Somente admin pode acessar esta área.");
        navigation.replace("Home");
        return;
      }

      setScope(nextScope);
      setAuthLoading(false);
    });

    return () => unsub();
  }, [navigation]);

  // ✅ data (admin: só áreas permitidas)
  useEffect(() => {
    if (!uid || !scope) return;

    setDataLoading(true);

    const unsub = subscribeRequests({
      userId: null, // ✅ admin pega tudo (vamos filtrar por área aqui)
      max: 5000,
      onChange: (list) => {
        const all = Array.isArray(list) ? list : [];

        // ✅ filtra só áreas permitidas pro admin logado
        const allowedAreas = Array.isArray(scope?.areaIds) ? scope.areaIds : [];
        const filtered = all.filter((r) => allowedAreas.includes(r?.areaId));

        setRequests(filtered);
        setDataLoading(false);
      },
    });

    return () => unsub?.();
  }, [uid, scope]);

  // ✅ agrupa por email (só pendentes e não escondidas)
  const groupedByUser = useMemo(() => {
    const map = {};

    const visible = (requests || []).filter((r) => {
      const status = String(r?.status || "").toLowerCase();
      const notHidden = r?.isHidden !== true;
      return status !== "concluida" && notHidden;
    });

    visible.forEach((r) => {
      const email = (r?.userEmail || "").toLowerCase() || "sem-email";

      if (!map[email]) {
        map[email] = { userEmail: email, requests: [] };
      }

      map[email].requests.push(r);
    });

    return Object.values(map)
      .filter((u) => (u.requests?.length || 0) > 0)
      .sort((a, b) => (a.userEmail || "").localeCompare(b.userEmail || ""));
  }, [requests]);

  const showLoading = authLoading || dataLoading;

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
              flex: 1,
              minHeight: 260,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ opacity: 0.7 }}>Carregando usuários...</Text>
          </View>
        ) : (
          groupedByUser.map((u) => (
            <AdminUserCard
              key={u.userEmail}
              userEmail={u.userEmail}
              count={u.requests.length}
              onPress={() =>
                navigation.navigate("AdminUserAreas", {
                  userEmail: u.userEmail,
                })
              }
            />
          ))
        )}
      </Container>
    </ScrollView>
  );
}
