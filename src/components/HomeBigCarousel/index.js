import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, useWindowDimensions } from "react-native";
import { Images } from "../../assets/images";
import ServiceCarouselCard from "../ServiceCarouselCard";
import { BigCarousel, Dot, DotsRow } from "./styles";

import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function HomeBigCarousel({ navigation }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = Math.round(width * 0.58);
  const CARD_GAP = 55;
  const SNAP = CARD_WIDTH + CARD_GAP;

  const handlePressSaude = useCallback(async () => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) {
        Alert.alert("Atenção", "Faça login para acessar.");
        return;
      }

      const snap = await getDoc(doc(db, "users", uid));
      const sus = String(snap.data()?.susDigitado || "").trim();

      if (sus !== "00000") {
        Alert.alert(
          "Acesso bloqueado",
          "Usuário não tem permissão para acessar o SUS na região de Aragoiania.",
        );
        return;
      }

      navigation.navigate("SolicitarSaude");
    } catch (e) {
      console.log("❌ SAUDE CHECK:", e);
      Alert.alert("Erro", "Não foi possível validar seu acesso.");
    }
  }, [navigation]);

  const bigCards = useMemo(
    () => [
      {
        id: "serv_area_1",
        title: "SERVIÇOS\nPOR ÁREA",
        image: Images.servico,
        onPress: () => navigation.navigate("Areas"),
      },
      {
        id: "serv_area_2",
        title: "ÁREA DA\nSAÚDE",
        image: Images.saude,
        onPress: handlePressSaude,
      },
      {
        id: "serv_area_3",
        title: "ASSISTÊNCIA\nSOCIAL",
        icon: "heart-circle-outline",
        onPress: () => {},
      },
      {
        id: "serv_area_4",
        title: "EDUCAÇÃO",
        icon: "school-outline",
        onPress: () => {},
      },
      {
        id: "serv_area_5",
        title: "HABITAÇÃO\nARAGOIANIA",
        icon: "home-outline",
        onPress: () => {},
      },
    ],
    [navigation, handlePressSaude],
  );

  return (
    <BigCarousel>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={bigCards}
        keyExtractor={(item) => item.id}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 18, paddingRight: 18 }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SNAP);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ServiceCarouselCard
            title={item.title}
            image={item.image}
            icon={item.icon}
            onPress={item.onPress}
            width={CARD_WIDTH}
            style={{
              marginRight: index === bigCards.length - 1 ? 0 : CARD_GAP,
            }}
          />
        )}
      />

      {/* 🔵 BOLINHAS */}
      <DotsRow>
        {bigCards.map((_, index) => (
          <Dot key={index} active={index === activeIndex} />
        ))}
      </DotsRow>
    </BigCarousel>
  );
}
