import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import { auth } from "../../services/firebase";

const ADMIN_EMAIL = "brunovalu16@gmail.com";

const AREAS = [
  { id: "iluminacao", label: "ILUMINAÇÃO PÚBLICA" },
  { id: "saude", label: "ÁREA DA SAÚDE" },
  { id: "defesa", label: "DEFESA CIVIL" },
];

export default function AdminAreas({ navigation }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = (user?.email || "").toLowerCase();
      const isAdmin = email === ADMIN_EMAIL.toLowerCase();

      if (!user) return navigation.replace("Login");
      if (!isAdmin) {
        Alert.alert("Acesso negado", "Somente admin pode acessar esta área.");
        return navigation.replace("Home");
      }

      setOk(true);
    });

    return () => unsub();
  }, [navigation]);

  if (!ok) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
      {AREAS.map((a) => (
        <View key={a.id} style={{ marginBottom: 10 }}>
          <HomeLastRequestCard
            title="PAINEL ADMIN"
            subtitle={a.label}
            status="" // pode deixar vazio
            onPress={() => navigation.navigate("AdminInboxArea", { areaId: a.id, areaLabel: a.label })}
            onMenuPress={() => {}}
            onDeletePress={null} // não precisa delete aqui
          />
        </View>
      ))}
    </ScrollView>
  );
}
