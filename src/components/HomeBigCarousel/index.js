import { useMemo, useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import { Images } from "../../assets/images";
import ServiceCarouselCard from "../ServiceCarouselCard";
import { BigCarousel, Dot, DotsRow } from "./styles";

export default function HomeBigCarousel({ navigation }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = Math.round(width * 0.58);
  const CARD_GAP = 55;
  const SNAP = CARD_WIDTH + CARD_GAP;

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
        onPress: () => {},
      },
      {
        id: "serv_area_3",
        title: "SERVIÇOS\nPOR ÁREA",
        image: Images.logo_branca_aragoiania,
        onPress: () => {},
      },
    ],
    [navigation]
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
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SNAP
          );
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ServiceCarouselCard
            title={item.title}
            image={item.image}
            onPress={item.onPress}
            width={CARD_WIDTH}
            style={{ marginRight: index === bigCards.length - 1 ? 0 : CARD_GAP }}
          />
        )}
      />

      {/* 🔵 BOLINHAS — AGORA DENTRO DO CONTAINER */}
      <DotsRow>
        {bigCards.map((_, index) => (
          <Dot key={index} active={index === activeIndex} />
        ))}
      </DotsRow>
    </BigCarousel>
  );
}
