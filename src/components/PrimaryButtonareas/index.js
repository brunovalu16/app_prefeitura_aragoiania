import { Btn, Txt } from "./styles";

export default function PrimaryButtonareas({ title, onPress, variant = "purple", style }) {
  return (
    <Btn onPress={onPress} variant={variant} style={style} activeOpacity={0.9}>
      <Txt>{title}</Txt>
    </Btn>
  );
}