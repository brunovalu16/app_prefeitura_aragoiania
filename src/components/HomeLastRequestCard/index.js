import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

import {
  CardRow,
  SmallCard,
  SmallIconLeft,
  SmallInfo,
  SmallSub,
  SmallTitle,
} from "./styles";

export default function HomeLastRequestCard({
  title = "MINHAS SOLICITAÇÕES",
  subtitle = "ILUMINAÇÃO PÚBLICA",
  status = "execucao",
  onPress,
  onMenuPress,
  onDeletePress, // ✅ novo
}) {
  const theme = useTheme();

  return (
    <CardRow>
      <SmallCard activeOpacity={0.9} onPress={onPress}>
        <SmallIconLeft>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.colors.purple}
          />

          <SmallInfo>
            <SmallTitle>{title}</SmallTitle>
            <SmallSub>{subtitle}</SmallSub>
            <SmallSub style={{ marginTop: 4, opacity: 0.85 }}>
              Status: {(status || "execucao").toLowerCase()}
            </SmallSub>
          </SmallInfo>
        </SmallIconLeft>

        {/* ✅ AÇÕES DIREITA (LIXEIRA + MENU) */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons
            name="trash-outline"
            size={18}
            color="#B91C1C"
            onPress={onDeletePress}
          />

          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={theme.colors.purple}
            onPress={onMenuPress}
          />
        </View>
      </SmallCard>
    </CardRow>
  );
}
