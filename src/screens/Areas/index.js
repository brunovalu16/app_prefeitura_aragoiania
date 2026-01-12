import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

import HomeGreeting from "../../components/HomeGreeting";
import HomeShortcuts from "../../components/HomeShortcuts";

import {
  Banner,
  BannerText,
  Card,
  Container,
  Item,
  ItemText,
  ModalBackdrop,
  ModalCard,
  ModalClose,
  ModalHeader,
  ModalItem,
  ModalItemText,
  ModalList,
  ModalTitle,
  Top,
} from "./styles";

export default function Areas({ navigation }) {
  const theme = useTheme();

  const areas = useMemo(
    () => [
      { id: "iluminacao", label: "ILUMINAÇÃO PÚBLICA", goTo: "Solicitar" },
      { id: "saude", label: "SAÚDE", goTo: "Solicitar" },
      { id: "defesa", label: "DEFESA CIVIL", goTo: "Solicitar" },
    ],
    []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  function handleSelect(area) {
    setSelectedArea(area);
    setModalOpen(false);

    // opcional: já navega ao escolher
    navigation.navigate(area.goTo, { areaId: area.id, areaLabel: area.label });
  }

  return (
    <Container>
      <SafeAreaView edges={["top"]}>
        <Top>
          <HomeGreeting
            name="Bruno Valú"
            onLogout={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }}
          />
          <HomeShortcuts initialActiveLabel="SERVIÇOS" />
        </Top>
      </SafeAreaView>

      {/* Banner clicável */}
      <Banner activeOpacity={0.9} onPress={() => setModalOpen(true)}>
        <Ionicons
          name="play"
          size={16}
          color={theme.colors.white ?? "#fff"}
        />
        <BannerText>
          {selectedArea?.label ?? "SELECIONE A ÁREA QUE DESEJA ATENDIMENTO"}
        </BannerText>
        <Ionicons
          name={modalOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.colors.white ?? "#fff"}
          style={{ marginLeft: "auto" }}
        />
      </Banner>

      <Card>
        <Item onPress={() => navigation.navigate("Solicitar")}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.colors.purple}
          />
          <ItemText red>ILUMINAÇÃO PÚBLICA</ItemText>
        </Item>

        <Item onPress={() => {}}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.colors.purple}
          />
          <ItemText>SAÚDE</ItemText>
        </Item>

        <Item onPress={() => {}}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.colors.purple}
          />
          <ItemText>DEFESA CIVIL</ItemText>
        </Item>
      </Card>

      {/* Modal de opções */}
      {modalOpen && (
        <ModalBackdrop activeOpacity={1} onPress={() => setModalOpen(false)}>
          <ModalCard activeOpacity={1}>
            <ModalHeader>
              <ModalTitle>Escolha uma área</ModalTitle>
              <ModalClose activeOpacity={0.9} onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={18} color={theme.colors.textMuted} />
              </ModalClose>
            </ModalHeader>

            <ModalList
              data={areas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ModalItem activeOpacity={0.9} onPress={() => handleSelect(item)}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <ModalItemText>{item.label}</ModalItemText>
                </ModalItem>
              )}
            />
          </ModalCard>
        </ModalBackdrop>
      )}
    </Container>
  );
}
