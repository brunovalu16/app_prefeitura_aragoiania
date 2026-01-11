import { Label, Pill } from "./styles";

export default function ShortcutPill({ label, onPress, active }) {
  return (
    <Pill onPress={onPress} active={active} activeOpacity={0.9}>
      <Label>{label}</Label>
    </Pill>
  );
}
