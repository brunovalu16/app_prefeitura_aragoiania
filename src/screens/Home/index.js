import HomeBigCarousel from "../../components/HomeBigCarousel";
import HomeRequestsList from "../../components/HomeRequestsList";
import { Container } from "./styles";

export default function Home({ navigation }) {
  const items = [
    { id: "1", title: "MINHAS SOLICITAÇÕES", subtitle: "ILUMINAÇÃO PÚBLICA", route: "Replyiluminacao" },
    { id: "2", title: "MINHAS SOLICITAÇÕES", subtitle: "ÁREA DA SAÚDE", route: "ReplySaude" },
    { id: "3", title: "MINHAS SOLICITAÇÕES", subtitle: "PODA DE ÁRVORES", route: "ReplyPoda" },
    { id: "4", title: "MINHAS SOLICITAÇÕES", subtitle: "TAPA BURACOS", route: "ReplyTapaBuracos" },
  ];

  return (
    <Container>
      <HomeBigCarousel navigation={navigation} />

      <HomeRequestsList
        items={items}
        onPressItem={(item) => {
          // ✅ backend ready: item vem do array (depois vem do backend)
          if (item.route) navigation.navigate(item.route);
        }}
        onMenuPressItem={(item) => {
          // menu por item (depois você define)
        }}
      />
    </Container>
  );
}
