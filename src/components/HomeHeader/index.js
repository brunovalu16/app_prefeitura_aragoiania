import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { Images } from "../../assets/images";
import { db } from "../../services/firebase";

import HomeGreeting from "../HomeGreeting";
import HomeShortcuts from "../HomeShortcuts";
import { Container } from "./styles";

export default function HomeHeader() {
  const navigation = useNavigation();

  const [userName, setUserName] = useState("Carregando...");
  const [avatarSource, setAvatarSource] = useState(Images.avatar);

  useEffect(() => {
    const auth = getAuth();
    let unsubDoc = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // limpa listener antigo
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (!user) {
        setUserName("Usuário");
        setAvatarSource(Images.avatar);
        return;
      }

      // fallback imediato (caso Firestore demore)
      setUserName(user.displayName || "Usuário");
      setAvatarSource(user.photoURL ? { uri: user.photoURL } : Images.avatar);

      // assina doc do Firestore (fonte principal)
      const ref = doc(db, "users", user.uid);
      unsubDoc = onSnapshot(
        ref,
        (snap) => {
          const data = snap.exists() ? snap.data() : null;

          const nome = data?.nome || user.displayName || "Usuário";
          const avatarUrl = data?.avatarUrl || user.photoURL || null;

          setUserName(nome);
          setAvatarSource(avatarUrl ? { uri: avatarUrl } : Images.avatar);
        },
        () => {
          // se der erro no snapshot, pelo menos mantém Auth
          setUserName(user.displayName || "Usuário");
          setAvatarSource(
            user.photoURL ? { uri: user.photoURL } : Images.avatar,
          );
        },
      );
    });

    return () => {
      if (unsubDoc) unsubDoc();
      unsubAuth();
    };
  }, []);

  return (
    <SafeAreaView edges={["top"]}>
      <Container>
        <HomeGreeting
          name={userName}
          avatar={avatarSource}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : null}
          onLogout={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }}
        />

        <HomeShortcuts initialActiveLabel="SERVIÇOS" />
      </Container>
    </SafeAreaView>
  );
}
