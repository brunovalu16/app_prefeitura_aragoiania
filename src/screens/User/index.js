import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

import {
  AvatarBtn, // ✅ ADD
  AvatarImage,
  Col,
  Container,
  Form,
  InputLine, // ✅ ADD
  Label,
  PhotoActionBtn,
  PhotoActionsRow,
  PhotoActionText,
  Row2,
  SectionHint, // ✅ ADD
  SusBlock, // ✅ ADD
  TopRow,
  ValueText, // ✅ ADD
} from "./styles";


export default function User({ navigation, route }) {
  const theme = useTheme();

  // ✅ dados vindos do cadastro (via route.params)
  const {
    fotoUsuario = null,
    sus = "",
    nome = "",
    email = "",
    cpf = "",
    rg = "",
    telefone = "",
    endereco = "",
    tituloEleitor = "",
    fotoCpfRg = null,
    fotoTitulo1 = null,
    fotoTitulo2 = null,
  } = route?.params || {};

  function renderPreview(uri) {
    if (!uri) return null;

    return (
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: 180,
          borderRadius: 12,
          marginTop: 10,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Container>
        

       <Form>
        <TopRow>
          <AvatarBtn activeOpacity={0.9}>
            {fotoUsuario ? (
              <AvatarImage source={{ uri: fotoUsuario }} />
            ) : (
              <Ionicons name="person-outline" size={26} color={theme.colors.cinza} />
            )}
          </AvatarBtn>

          <SusBlock>
            <Label>Número do SUS</Label>
            <InputLine>
              <ValueText>{sus || "-"}</ValueText>
            </InputLine>
          </SusBlock>
        </TopRow>


        <Label>Nome</Label>
        <InputLine><ValueText>{nome || "-"}</ValueText></InputLine>

        <Label>Email</Label>
        <InputLine><ValueText>{email || "-"}</ValueText></InputLine>

        <Row2>
          <Col>
            <Label>CPF</Label>
            <InputLine><ValueText>{cpf || "-"}</ValueText></InputLine>
          </Col>

          <Col>
            <Label>RG</Label>
            <InputLine><ValueText>{rg || "-"}</ValueText></InputLine>
          </Col>
        </Row2>

        <SectionHint>Fotos do CPF e RG</SectionHint>
        <PhotoActionsRow>
          <PhotoActionBtn disabled>
            <Ionicons name="document-text-outline" size={18} color={theme.colors.cinza} />
            <PhotoActionText>{fotoCpfRg ? "ANEXADO" : "NÃO ENVIADO"}</PhotoActionText>
          </PhotoActionBtn>
        </PhotoActionsRow>
        {renderPreview(fotoCpfRg)}

        <Label>Telefone</Label>
        <InputLine><ValueText>{telefone || "-"}</ValueText></InputLine>

        <Label>Endereço</Label>
        <InputLine><ValueText>{endereco || "-"}</ValueText></InputLine>

        <Label>Título de Eleitor</Label>
        <InputLine><ValueText>{tituloEleitor || "-"}</ValueText></InputLine>

        <SectionHint>Fotos do Título de Eleitor</SectionHint>
        <PhotoActionsRow>
          <PhotoActionBtn disabled>
            <Ionicons name="document-outline" size={18} color={theme.colors.surface} />
            <PhotoActionText>{fotoTitulo1 ? "FRENTE OK" : "FRENTE NÃO ENVIADA"}</PhotoActionText>
          </PhotoActionBtn>

          <PhotoActionBtn disabled>
            <Ionicons name="document-outline" size={18} color={theme.colors.surface} />
            <PhotoActionText>{fotoTitulo2 ? "VERSO OK" : "VERSO NÃO ENVIADO"}</PhotoActionText>
          </PhotoActionBtn>
        </PhotoActionsRow>
        {renderPreview(fotoTitulo1)}
        {renderPreview(fotoTitulo2)}
      </Form>


      </Container>
    </ScrollView>
  );
}
