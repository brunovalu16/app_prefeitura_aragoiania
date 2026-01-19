import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { subscribeRequests } from "../../services/requests";

import AdminUserCard from "../../components/AdminUserCard";
import { Container } from "./styles";

const ADMIN_EMAIL = "brunovalu16@gmail.com";

export default function AdminUsersInbox({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const nextUid = user?.uid || null;
      const email = (user?.email || "").toLowerCase();

      setUid(nextUid);
      setIsAdmin(email === ADMIN_EMAIL.toLowerCase());
      setAuthLoading(false);

      if (!nextUid) navigation.replace("Login");
    });

    return () => unsub();
  }, [navigation]);

  // data (admin: tudo)
  useEffect(() => {
    if (!uid || !isAdmin) return;

    setDataLoading(true);

    const unsub = subscribeRequests({
      userId: null, // ✅ admin pega tudo
      max: 5000,
      onChange: (list) => {
        setRequests(Array.isArray(list) ? list : []);
        setDataLoading(false);
      },
    });

    return () => unsub?.();
  }, [uid, isAdmin]);

  // agrupa por email
  const groupedByUser = useMemo(() => {
    const map = {};

    // ✅ ADMIN só vê solicitações ainda abertas (não concluídas)
    const pending = (requests || []).filter(
      (r) => (r?.status || "").toLowerCase() !== "concluida",
    );

    pending.forEach((r) => {
      const email = (r?.userEmail || "").toLowerCase() || "sem-email";

      if (!map[email]) {
        map[email] = {
          userEmail: email,
          requests: [],
        };
      }

      map[email].requests.push(r);
    });

    // ✅ remove usuários sem solicitações (por segurança)
    return Object.values(map)
      .filter((u) => (u.requests?.length || 0) > 0)
      .sort((a, b) => (a.userEmail || "").localeCompare(b.userEmail || ""));
  }, [requests]);

  const showLoading = authLoading || (isAdmin && dataLoading);

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
