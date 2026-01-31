import { useCallback, useMemo, useState } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { Images } from "../../assets/images";
import ServiceCarouselCard from "../ServiceCarouselCard";
import { BigCarousel, Dot, DotsRow } from "./styles";

export default function HomeBigCarousel({ navigation }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = width * 0.58;
  const CARD_GAP = width * 0.22; // ex: 6% da tela (ajuste fino)
  const SNAP = CARD_WIDTH + CARD_GAP;

  const handlePressSaude = useCallback(() => {
    navigation.navigate("SolicitarSaude");
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
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 18 }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        renderItem={({ item }) => (
          <ServiceCarouselCard
            title={item.title}
            image={item.image}
            icon={item.icon}
            onPress={item.onPress}
            width={CARD_WIDTH}
            style={{ flexShrink: 0 }} // garante que não “aperte”
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
