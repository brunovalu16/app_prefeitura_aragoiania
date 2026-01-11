import { useMemo, useState } from "react";
import { FlatList } from "react-native";
import ShortcutPill from "../ShortcutPill";
import { ShortcutsRow } from "./styles";

export default function HomeShortcuts({
  initialActiveLabel = "SERVIÇOS",
  onChange,
  shortcuts: shortcutsProp,
}) {
  const defaultShortcuts = useMemo(
    () => [
      { id: "agenda", label: "MINHA AGENDA" },
      { id: "debitos", label: "DÉBITOS" },
      { id: "servicos", label: "SERVIÇOS" },
      { id: "saude", label: "SAÚDE" },
      { id: "iptu", label: "IPTU" },
      { id: "iluminação", label: "ILUMINAÇÃO" },
    ],
    []
  );

  const shortcuts = shortcutsProp?.length ? shortcutsProp : defaultShortcuts;

  const [activeShortcut, setActiveShortcut] = useState(initialActiveLabel);

  function handlePress(label) {
    setActiveShortcut(label);
    if (onChange) onChange(label);
  }

  return (
    <ShortcutsRow>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={shortcuts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShortcutPill
            label={item.label}
            active={activeShortcut === item.label}
            onPress={() => handlePress(item.label)}
          />
        )}
      />
    </ShortcutsRow>
  );
}
