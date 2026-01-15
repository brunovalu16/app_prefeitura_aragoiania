import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";
import ProgressBarStatus from "../../../components/ProgressBarStatus";

import { subscribeRequestById } from "../../../services/requests";

import {
  ActionRow,
  AreaTitle,
  Card,
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

  // ✅ agora vem só o id
  const { requestId } = route?.params || {};

  // ✅ dados do Firebase
  const [data, setData] = useState(null);

  // ✅ fotos do processo (local do aparelho)
  const [localImages, setLocalImages] = useState([]);

  useEffect(() => {
    if (!requestId) return;

    const unsub = subscribeRequestById({
      requestId,
      onChange: (doc) => {
        setData(doc);

        // carrega imagens iniciais da solicitação (uma vez)
        // para não sobrescrever as fotos locais do processo depois
        if (doc && Array.isArray(doc.images)) {
          setLocalImages((prev) => (prev.length ? prev : doc.images));
        }
      },
    });

    return () => unsub?.();
  }, [requestId]);

  // ✅ fallback enquanto carrega
  const requestTitle = data?.requestTitle || "SOLICITAÇÃO ILUMINAÇÃO PÚBLICA - --";
  const descricaoTrim = useMemo(() => (data?.descricao || "").trim(), [data?.descricao]);
  const enderecoTrim = useMemo(() => (data?.enderecoPoste || "").trim(), [data?.enderecoPoste]);
  const numeroTrim = useMemo(() => (data?.numeroPoste || "").trim(), [data?.numeroPoste]);

  const location = data?.location || null;
  const hasLocation =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";

  // ✅ suporta imagens como [{uri}] ou [{url}]
  function getImgUri(img) {
    return img?.uri || img?.url || null;
  }

  const hasImages = Array.isArray(localImages) && localImages.length > 0;

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

    setLocalImages((prev) => [{ uri: asset.uri }, ...(prev || [])]);
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

    setLocalImages((prev) => [{ uri: asset.uri }, ...(prev || [])]);
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
            <AreaTitle>{requestTitle}</AreaTitle>
          </Row>

          <Divider />

          <SectionTitle>Descrição</SectionTitle>
          <ValueText>{descricaoTrim || "—"}</ValueText>

          <Divider />

          <SectionTitle>Endereço onde está o poste</SectionTitle>
          <ValueText>{enderecoTrim || "—"}</ValueText>

          <Divider />

          <SectionTitle>Número do poste</SectionTitle>
          <ValueText>{numeroTrim || "—"}</ValueText>

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
                {localImages.map((img, idx) => {
                  const uri = getImgUri(img);
                  if (!uri) return null;

                  return (
                    <PreviewItem key={`${uri}-${idx}`}>
                      <PreviewImage source={{ uri }} />
                    </PreviewItem>
                  );
                })}
              </PreviewGrid>
            </>
          )}

          <Divider />

          <SectionTitle>Fotos do processo de execução:</SectionTitle>

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
          <ProgressBarStatus status={data?.status || "execucao"} />

          <Divider />
        </Card>
      </Container>
    </ScrollView>
  );
}
