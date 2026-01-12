import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { CardRow, SmallCard, SmallIconLeft, SmallInfo, SmallSub, SmallTitle } from "./styles";

export default function HomeLastRequestCard({
  title = "MINHAS SOLICITAÇÕES",
  subtitle = "ILUMINAÇÃO PÚBLICA",
  onPress,
  onMenuPress,
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
          </SmallInfo>
        </SmallIconLeft>

        <Ionicons
          name="ellipsis-vertical"
          size={18}
          color={theme.colors.purple}
          onPress={onMenuPress}
        />
      </SmallCard>
    </CardRow>
  );
}
