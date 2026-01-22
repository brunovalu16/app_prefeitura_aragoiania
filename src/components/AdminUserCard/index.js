import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";

import { Card, Left, Right, Subtitle, Title } from "./styles";

export default function AdminUserCard({
  userEmail,
  count = 0,
  onPress,
  open = false,
}) {
  const theme = useTheme();

  return (
    <Card activeOpacity={0.9} onPress={onPress}>
      {/* ESQUERDA: ícone + email */}
      <Left>
        <Ionicons name="person-outline" size={18} color={theme.colors.purple} />
        <Title numberOfLines={1}>{userEmail}</Title>
      </Left>

      {/* DIREITA: contador + chevron */}
      <Right>
        <Subtitle>{count} solicitação(ões)</Subtitle>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.purple}
        />
      </Right>
    </Card>
  );
}
