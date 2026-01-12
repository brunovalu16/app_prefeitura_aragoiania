import { SafeAreaView } from "react-native-safe-area-context";
import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeGreeting from "../../components/HomeGreeting";
import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import HomeShortcuts from "../../components/HomeShortcuts";
import { Container, ListArea, ListScroll, Top } from "./styles";

export default function Home({ navigation }) {
  return (
    <Container>
      <SafeAreaView edges={["top"]}>
        <Top>
          <HomeGreeting
            name="Bruno Valú"
            onLogout={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          />

          <HomeShortcuts initialActiveLabel="SERVIÇOS" />
        </Top>
      </SafeAreaView>

      <HomeBigCarousel navigation={navigation} />

      {/* ✅ cards */}
      <ListArea>
        <ListScroll showsVerticalScrollIndicator={false}>
          <HomeLastRequestCard title="MINHAS SOLICITAÇÕES" subtitle="ILUMINAÇÃO PÚBLICA" onPress={() => {}} onMenuPress={() => {}} />
          <HomeLastRequestCard title="MINHAS SOLICITAÇÕES" subtitle="ÁREA DA SAÚDE" onPress={() => {}} onMenuPress={() => {}} />
          <HomeLastRequestCard title="MINHAS SOLICITAÇÕES" subtitle="PODA DE ÁRVORES" onPress={() => {}} onMenuPress={() => {}} />
          <HomeLastRequestCard title="MINHAS SOLICITAÇÕES" subtitle="TAPA BURACOS" onPress={() => {}} onMenuPress={() => {}} />
        </ListScroll>
      </ListArea>
    </Container>
  );
}
