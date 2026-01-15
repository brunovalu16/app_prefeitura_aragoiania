import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { FlatList } from "react-native";

import ShortcutPill from "../ShortcutPill";
import { ShortcutsRow } from "./styles";

export default function HomeShortcuts({
  initialActiveLabel = "CADASTRO",
  onChange,
  shortcuts: shortcutsProp,
}) {
  const navigation = useNavigation();

  const defaultShortcuts = useMemo(
    () => [
      { id: "cadastro", label: "CADASTRO" },
      { id: "solicitacoes", label: "SOLICITAÇÕES" },
      { id: "diario", label: "DIÁRIO OFICIAL" },
      { id: "empregos", label: "EMPREGOS E CURSOS SINE" },
      { id: "saude", label: "NOTÍCIAS SAÚDE" },
      { id: "eventos", label: "EVENTOS" },
    ],
    []
  );

  const shortcuts = shortcutsProp?.length ? shortcutsProp : defaultShortcuts;

  const [activeShortcut, setActiveShortcut] = useState(initialActiveLabel);

  function handlePress(item) {
    setActiveShortcut(item.label);

    // ✅ Navegação interna (fixa) para o User
    if (item.id === "cadastro" || item.label === "CADASTRO") {
      navigation.navigate("User");
    }

    // ✅ Navegação interna (fixa) para o Recebeiluminacao
    if (item.id === "solicitacoes" || item.label === "SOLICITAÇÕES") {
      navigation.navigate("Recebeiluminacao");
    }

    // ✅ continua disparando callback pra Home se você quiser usar depois
    if (onChange) onChange(item.label);
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
            onPress={() => handlePress(item)}
          />
        )}
      />
    </ShortcutsRow>
  );
}
