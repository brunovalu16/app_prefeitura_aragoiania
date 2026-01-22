import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { Card, Logo, LogoWrap, Title } from "./styles";

export default function ServiceCarouselCard({
  title,
  image,
  icon, // 👈 novo
  onPress,
  width,
  height,
  style,
}) {
  const theme = useTheme();

  return (
    <Card
      activeOpacity={0.92}
      onPress={onPress}
      style={[width ? { width } : null, height ? { height } : null, style]}
    >
      <LogoWrap>
        <Logo source={image} />

        {/* 🏠 ÍCONE OPCIONAL */}
        {icon && (
          <Ionicons
            name={icon}
            size={140}
            color={theme.colors.surface}
            style={{ position: "absolute", marginTop: 30 }}
          />
        )}
      </LogoWrap>

      <Title>{title}</Title>
    </Card>
  );
}
