import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";

import {
    Card,
    Left,
    Subtitle,
    Title,
} from "./styles";

export default function AdminUserCard({ userEmail, count = 0, onPress }) {
  const theme = useTheme();

  return (
    <Card activeOpacity={0.9} onPress={onPress}>
      <Left>
        <Ionicons name="person-outline" size={18} color={theme.colors.purple} />
        <Title numberOfLines={1}>{userEmail}</Title>
      </Left>

      <Subtitle>{count} solicitação(ões)</Subtitle>
    </Card>
  );
}
