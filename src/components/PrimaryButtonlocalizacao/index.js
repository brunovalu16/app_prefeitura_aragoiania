import { Btn, Txt } from "./styles";

export default function PrimaryButtonlocalizacao({
  title,
  onPress,
  variant = "purple",
  style,
}) {
  return (
    <Btn onPress={onPress} variant={variant} style={style} activeOpacity={0.9}>
      <Txt numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Txt>
    </Btn>
  );
}
