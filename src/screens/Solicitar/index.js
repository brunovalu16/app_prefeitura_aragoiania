import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "styled-components/native";
import AppHeader from "../../components/AppHeader";
import MapModal from "../../components/MapModal";
import PrimaryButton from "../../components/PrimaryButton";
import {
    ActionRow,
    AreaTitle,
    Banner, BannerText,
    Box,
    Card,
    CepInput,
    CepRow,
    Container,
    FieldLabel,
    HeaderLogo,
    Helper,
    Row,
    SmallAction, SmallActionText
} from "./styles";

export default function Solicitar({ navigation }) {
  const theme = useTheme();
  const [modal, setModal] = useState(false);
  const [cep, setCep] = useState("");

  function handleCepChange(value) {
    const only = value.replace(/\D/g, "").slice(0, 8);
    setCep(only);

    // quando completar 8 dígitos -> Página 6
    if (only.length === 8) {
      navigation.navigate("CepPreenchido", { cep: only });
    }
  }

  return (
    <Container>
      <AppHeader showBack />
      <HeaderLogo>Aragoiânia</HeaderLogo>

      <Banner>
        <Ionicons name="play" size={16} color="#fff" />
        <BannerText>SELECIONE A ÁREA QUE DESEJA ATENDIMENTO</BannerText>
      </Banner>

      <Card>
        <Row>
          <Ionicons name="document-text-outline" size={18} color={theme.colors.purple} />
          <AreaTitle>ILUMINAÇÃO PÚBLICA</AreaTitle>
        </Row>

        <FieldLabel>Descrição da solicitação</FieldLabel>
        <Box />

        <FieldLabel>Imagem da solicitação</FieldLabel>
        <Helper>
          Deseja adicionar uma imagem à solicitação? Tire fotos com a câmera agora ou escolha da galeria de fotos do seu celular. Limite de 5 fotos
        </Helper>

        <ActionRow>
          <SmallAction onPress={() => {}}>
            <Ionicons name="camera-outline" size={16} color="#fff" />
            <SmallActionText>CÂMERA</SmallActionText>
          </SmallAction>

          <SmallAction onPress={() => {}} style={{ marginLeft: 10 }}>
            <Ionicons name="images-outline" size={16} color="#fff" />
            <SmallActionText>GALERIA</SmallActionText>
          </SmallAction>
        </ActionRow>

        <FieldLabel>Adicione o endereço à solicitação</FieldLabel>

        <CepRow>
          <CepInput
            placeholder="CEP"
            placeholderTextColor="rgba(255,255,255,0.8)"
            keyboardType="numeric"
            value={cep}
            onChangeText={handleCepChange}
            returnKeyType="done"
          />
        </CepRow>

        <PrimaryButton
          title="USAR LOCALIZAÇÃO ATUAL"
          onPress={() => setModal(true)}
          style={{ marginTop: 12 }}
        />
      </Card>

      <MapModal visible={modal} onClose={() => setModal(false)} />
    </Container>
  );
}
