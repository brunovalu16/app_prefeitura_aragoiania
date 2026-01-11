import { Card, Logo, LogoWrap, Title } from "./styles";

export default function ServiceCarouselCard({
  title,
  image,
  onPress,
  width,
  height,
  style,
}) {
  return (
    <Card
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        width ? { width } : null,
        height ? { height } : null,
        style,
      ]}
    >
      <LogoWrap>
        <Logo source={image} />
      </LogoWrap>

      <Title>{title}</Title>
    </Card>
  );
}
