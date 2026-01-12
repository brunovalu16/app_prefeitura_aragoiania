import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeLastRequestCard from "../../components/HomeLastRequestCard";
import { Container, ListArea, ListScroll } from "./styles";

export default function Home({ navigation }) {
  
  return (
    <Container>
      <HomeBigCarousel navigation={navigation} />

      {/* ✅ cards */}
      <ListArea>
        <ListScroll showsVerticalScrollIndicator={false}>
          <HomeLastRequestCard
            title="MINHAS SOLICITAÇÕES"
            subtitle="ILUMINAÇÃO PÚBLICA"
            onPress={() => navigation.navigate("Replyiluminacao")}
            onMenuPress={() => {}}
          />

          <HomeLastRequestCard
            title="MINHAS SOLICITAÇÕES"
            subtitle="ÁREA DA SAÚDE"
            onPress={() => navigation.navigate("ReplySaude")}
            onMenuPress={() => {}}
          />

          <HomeLastRequestCard
            title="MINHAS SOLICITAÇÕES"
            subtitle="PODA DE ÁRVORES"
            onPress={() => navigation.navigate("ReplyPoda")}
            onMenuPress={() => {}}
          />

          <HomeLastRequestCard
            title="MINHAS SOLICITAÇÕES"
            subtitle="TAPA BURACOS"
            onPress={() => navigation.navigate("ReplyTapaBuracos")}
            onMenuPress={() => {}}
          />
        </ListScroll>
      </ListArea>
    </Container>
  );
}
