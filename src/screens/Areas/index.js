import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import AppHeader from "../../components/AppHeader";
import { Banner, BannerText, Card, Container, HeaderLogo, Item, ItemText } from "./styles";

export default function Areas({ navigation }) {
  const theme = useTheme();

  return (
    <Container>
      <AppHeader showBack />
      <HeaderLogo>Aragoiânia</HeaderLogo>

      <Banner>
        <Ionicons name="play" size={16} color="#fff" />
        <BannerText>SELECIONE A ÁREA QUE DESEJA ATENDIMENTO</BannerText>
      </Banner>

      <Card>
        <Item onPress={() => navigation.navigate("Solicitar")}>
          <Ionicons name="document-text-outline" size={18} color={theme.colors.purple} />
          <ItemText red>ILUMINAÇÃO PÚBLICA</ItemText>
        </Item>
        <Item onPress={() => {}}>
          <Ionicons name="document-text-outline" size={18} color={theme.colors.purple} />
          <ItemText>SAÚDE</ItemText>
        </Item>
        <Item onPress={() => {}}>
          <Ionicons name="document-text-outline" size={18} color={theme.colors.purple} />
          <ItemText>DEFESA CIVIL</ItemText>
        </Item>
      </Card>
    </Container>
  );
}
