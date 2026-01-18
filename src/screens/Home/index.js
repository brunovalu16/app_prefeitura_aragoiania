import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeRequestsList from "../../components/HomeRequestsList";
import { auth } from "../../services/firebase";

import { Container } from "./styles";

const ADMIN_EMAIL = "brunovalu16@gmail.com";

export default function Home({ navigation }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const email = (user?.email || "").toLowerCase();
      setIsAdmin(email === ADMIN_EMAIL.toLowerCase());
    });

    return () => unsub();
  }, []);

  // ✅ SOMENTE ADMIN (sem mock de usuário)
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

  return (
    <Container>
      <HomeBigCarousel navigation={navigation} />

      <HomeRequestsList
        items={items}
        onPressItem={(item) => {
          if (item.route) navigation.navigate(item.route);
        }}
        onMenuPressItem={() => {}}
      />
    </Container>
  );
}
