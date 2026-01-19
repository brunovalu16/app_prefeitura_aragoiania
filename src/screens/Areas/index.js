import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Container,
  Dropdown,
  Option,
  OptionText,
  SelectBox,
  SelectIconArea,
  SelectText,
} from "./styles";

export default function Areas({ navigation }) {
  const theme = useTheme();

  const areas = useMemo(
    () => [
      // ✅ FLUXOS PRONTOS
      { id: "iluminacao", label: "ILUMINAÇÃO PÚBLICA", goTo: "Solicitar" },

      // 🚧 futuras áreas (ainda sem fluxo)
      { id: "denuncia", label: "DENÚNCIA VIGILÂNCIA SANITÁRIA" },
      { id: "feirasemercados", label: "FEIRAS E MERCADOS" },
      { id: "cmei", label: "FILA CMEI" },
      { id: "aragoianiaverde", label: "ARAGOIANIA VERDE - AMMA" },
      { id: "limpezabocalobo", label: "LIMPEZA DE BOCA DE LOBO" },
      {
        id: "manutecao",
        label: "MANUTENÇÃO DE LIXEIRAS E EQUIPAMENTOS DE PRAÇAS",
      },
      { id: "parques", label: "MANUTEÇÃO DE PARQUES" },
      { id: "semaforo", label: "MANUTENÇÃO DE SEMÁFORO" },
      { id: "pessoasrua", label: "PESSOAS EM SITUAÇÃO DE RUA" },
      { id: "procon", label: "PROCON" },
      { id: "provavida", label: "PROVA DE VIDA" },
      { id: "redemulher", label: "REDE MULHER" },
      { id: "animais", label: "REMOÇÃO DE ANIMAIS" },
    ],
    [],
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  function handleSelect(item) {
    setSelected(item);
    setOpen(false);

    if (item.goTo) {
      navigation.navigate(item.goTo, {
        areaId: item.id,
        areaLabel: item.label,
      });
    }
  }

  return (
    <Container>
      <SelectBox activeOpacity={0.9} onPress={() => setOpen((v) => !v)}>
        <Ionicons name="play" size={16} color={theme.colors.white ?? "#fff"} />

        <SelectText numberOfLines={1}>
          {selected?.label ?? "SELECIONE A ÁREA QUE DESEJA ATENDIMENTO"}
        </SelectText>

        <SelectIconArea>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={18}
            color={theme.colors.white ?? "#fff"}
          />
        </SelectIconArea>
      </SelectBox>

      {open && (
        <Dropdown>
          <ScrollView showsVerticalScrollIndicator={false}>
            {areas.map((item) => (
              <Option
                key={item.id}
                activeOpacity={0.9}
                onPress={() => handleSelect(item)}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={theme.colors.purple}
                />
                <OptionText numberOfLines={2}>{item.label}</OptionText>
              </Option>
            ))}
          </ScrollView>
        </Dropdown>
      )}
    </Container>
  );
}
