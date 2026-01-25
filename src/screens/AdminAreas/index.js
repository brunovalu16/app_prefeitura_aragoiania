import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import { getAdminScopeByEmail } from "../../services/adminScope";
import { auth } from "../../services/firebase";

export default function AdminAreas({ navigation }) {
  const [scope, setScope] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const areaId = scope?.areaIds?.[0];
  if (!areaId) return null;

  const canGo = !!scope && !!areaId;

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
      {authLoading ? (
        <View
          style={{
            minHeight: 260,
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ opacity: 0.7 }}>Verificando acesso...</Text>
        </View>
      ) : !scope ? (
        // se caiu aqui, já redirecionou/alertou, mas deixo seguro
        <View style={{ paddingVertical: 14 }}>
          <Text style={{ opacity: 0.75 }}>Acesso não autorizado.</Text>
        </View>
      ) : (
        <View style={{ marginBottom: 10 }}>
          <HomeLastRequestCard
            title="PAINEL ADMIN"
            subtitle={scope.label}
            status=""
            onPress={() => {
              if (!canGo) {
                Alert.alert(
                  "Erro",
                  "Não foi possível identificar a área do admin.",
                );
                return;
              }

              navigation.navigate("AdminInboxArea", {
                areaId,
                areaLabel: scope.label,
              });
            }}
            onMenuPress={() => {}}
          />
        </View>
      )}
    </ScrollView>
  );
}
