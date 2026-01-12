import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTheme } from "styled-components/native";


import {
  Container,
  Dropdown,
  Option,
  OptionText,
  SelectBox,
  SelectIconArea,
  SelectText
} from "./styles";

export default function Areas({ navigation }) {
  const theme = useTheme();

  const areas = useMemo(
  () => [
    { id: "iluminacao", label: "ILUMINAÇÃO PÚBLICA", goTo: "Solicitar" },
    { id: "saude", label: "SAÚDE" }, // sem destino por enquanto
    { id: "defesa", label: "DEFESA CIVIL" }, // sem destino por enquanto
  ],
  []
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
      

      {/* ✅ DROPDOWN */}
      <SelectBox activeOpacity={0.9} onPress={() => setOpen((v) => !v)}>
        <Ionicons
          name="play"
          size={16}
          color={theme.colors.white ?? "#fff"}
        />

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
          {areas.map((item) => (
            <Option key={item.id} activeOpacity={0.9} onPress={() => handleSelect(item)}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={theme.colors.purple}
              />
              <OptionText>{item.label}</OptionText>
            </Option>
          ))}
        </Dropdown>
      )}
    </Container>
  );
}
