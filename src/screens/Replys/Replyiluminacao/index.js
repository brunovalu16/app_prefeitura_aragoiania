import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";
import ProgressBarStatus from "../../../components/ProgressBarStatus";

import {
  ActionRow,
  AreaTitle,
  Card,
  Chip,
  ChipText,
  Container,
  Divider,
  FooterHint,
  PreviewGrid,
  PreviewImage,
  PreviewItem,
  Row,
  SectionTitle,
  SmallAction,
  SmallActionText,
  ValueText,
} from "./styles";

export default function Replyiluminacao({ navigation, route }) {
  const theme = useTheme();

  const {
    areaLabel = "SOLICITAÇÃO ILUMINAÇÃO PÚBLICA - 01",
    descricao = "",
    cep = "",
    images = [],
    location = null,
  } = route?.params || {};

  const descricaoTrim = useMemo(() => (descricao || "").trim(), [descricao]);

  // ✅ imagens viram state local pra permitir adicionar foto nova
  const [localImages, setLocalImages] = useState(
    Array.isArray(images) ? images : []
  );

  const hasImages = localImages.length > 0;

  const hasLocation =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";

  const hasCep = (cep || "").replace(/\D/g, "").length === 8;
  const cepFmt = hasCep
    ? cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
    : "Não informado";

  async function ensureCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar fotos."
      );
      return false;
    }
    return true;
  }

  async function takePhoto() {
    const ok = await ensureCameraPermission();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    // ✅ adiciona a foto no começo do array (aparece primeiro)
    setLocalImages((prev) => [{ uri: asset.uri }, ...prev]);
  }


  async function ensureGalleryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permissão necessária",
      "Precisamos de acesso à galeria para selecionar imagens."
    );
    return false;
  }
  return true;
}

async function pickFromGallery() {
  const ok = await ensureGalleryPermission();
  if (!ok) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: false,
  });

  if (result.canceled) return;

  const asset = result.assets?.[0];
  if (!asset?.uri) return;

  setLocalImages((prev) => [{ uri: asset.uri }, ...prev]);
}


  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        <Card>
          <Row>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={theme.colors.purple}
            />
            <AreaTitle>{areaLabel}</AreaTitle>
          </Row>

          <Divider />

          <SectionTitle>Descrição</SectionTitle>
          <ValueText>{descricaoTrim || "—"}</ValueText>

          <Divider />

          <SectionTitle>CEP</SectionTitle>
          <Chip>
            <Ionicons name="location-outline" size={16} color="#fff" />
            <ChipText>{cepFmt}</ChipText>
          </Chip>

          <Divider />

          <SectionTitle>Localização</SectionTitle>
          <ValueText>
            {hasLocation
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : "Não informada"}
          </ValueText>

          <Divider />

          <SectionTitle>Imagens</SectionTitle>

          {!hasImages ? (
            <ValueText>Nenhuma imagem enviada.</ValueText>
          ) : (
            <>
              <FooterHint>{localImages.length} imagem(ns) anexada(s)</FooterHint>

              <PreviewGrid>
                {localImages.map((img, idx) => (
                  <PreviewItem key={`${img?.uri || idx}-${idx}`}>
                    <PreviewImage source={{ uri: img.uri }} />
                  </PreviewItem>
                ))}
              </PreviewGrid>
            </>
          )}

          <Divider />

          {/* ✅ botão de tirar foto (admin vai usar depois) */}
          <SectionTitle>Adicionar foto</SectionTitle>

          <ActionRow>
            <SmallAction onPress={takePhoto}>
              <Ionicons name="camera-outline" size={15} color="#fff" />
              <SmallActionText>CÂMERA</SmallActionText>
            </SmallAction>

            <SmallAction onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={15} color="#fff" />
              <SmallActionText>GALERIA</SmallActionText>
            </SmallAction>
          </ActionRow>


          <Divider />

          <SectionTitle>Status da solicitação</SectionTitle>
          <ProgressBarStatus status="execucao" />
          <Divider />
        </Card>
      </Container>
    </ScrollView>
  );
}
