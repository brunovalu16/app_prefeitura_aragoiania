import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { BackButton, Center, Container, Row, Title } from "./styles";

export default function AppHeader({ title, showBack }) {
  const nav = useNavigation();
  const theme = useTheme();

  return (
    <Container>
      <Row>
        {showBack ? (
          <BackButton onPress={() => nav.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.purple} />
          </BackButton>
        ) : (
          <BackButton />
        )}

        <Center>{title ? <Title>{title}</Title> : null}</Center>

        <BackButton />
      </Row>
    </Container>
  );
}
