import { SafeAreaView } from "react-native-safe-area-context";
import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeGreeting from "../../components/HomeGreeting";
import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import HomeShortcuts from "../../components/HomeShortcuts";
import { Container, Top } from "./styles";

export default function Home({ navigation }) {
  return (
    <Container>
      <SafeAreaView edges={["top"]}>
        <Top>
          <HomeGreeting name="Bruno Valú" 
          onLogout={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          />

          <HomeShortcuts
            initialActiveLabel="SERVIÇOS"
            onChange={(label) => {
              // aqui você decide o que fazer ao trocar o atalho
            }}
          />
        </Top>
      </SafeAreaView>

      <HomeBigCarousel navigation={navigation} />

      <HomeLastRequestCard
        title="MINHAS SOLICITAÇÕES"
        subtitle="ÁREA DA SAÚDE"
        onPress={() => {
          // abre a lista de solicitações (depois você define a rota)
        }}
        onMenuPress={() => {
          // abre menu/ações (depois você define)
        }}
      />


    </Container>
  );
}
