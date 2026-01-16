import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

import ProgressBarStatus from "../../../components/ProgressBarStatus";
import { addProcessImage, subscribeRequestById } from "../../../services/requests";
import { getAuthUserId } from "../../../services/userId";

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

  // ✅ preview modal (abrir imagem)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);

  function openPreview(uri) {
    if (!uri) return;
    setPreviewUri(uri);
    setPreviewOpen(true);
  }
  function closePreview() {
    setPreviewOpen(false);
    setPreviewUri(null);
  }

  useEffect(() => {
    if (!requestId) return;

    const unsub = subscribeRequestById({
      requestId,
      onChange: (doc) => setData(doc || null),
    });

    return () => unsub?.();
  }, [requestId]);

  // ✅ fallback enquanto carrega
  const requestTitle =
    data?.requestTitle || "SOLICITAÇÃO ILUMINAÇÃO PÚBLICA - --";

  const descricaoTrim = useMemo(
    () => (data?.descricao || "").trim(),
    [data?.descricao]
  );

  const enderecoTrim = useMemo(
    () => (data?.enderecoPoste || "").trim(),
    [data?.enderecoPoste]
  );

  const numeroTrim = useMemo(
    () => (data?.numeroPoste || "").trim(),
    [data?.numeroPoste]
  );

  const location = data?.location || null;
  const hasLocation =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";

  // ✅ suporta imagens como [{uri}] ou [{url}] ou string direta
  function getImgUri(img) {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img?.url || img?.uri || null;
  }

  // ✅ imagens da solicitação (criadas no Solicitar)
  const requestImages = Array.isArray(data?.images) ? data.images : [];

  // ✅ fotos do processo (salvas pelo Reply)
  const processImages = Array.isArray(data?.processImages)
    ? data.processImages
    : [];

  const hasRequestImages = requestImages.length > 0;
  const hasProcessImages = processImages.length > 0;

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

  // ✅ salva no Storage + Firestore (processImages)
  async function takePhoto() {
    try {
      const ok = await ensureCameraPermission();
      if (!ok) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });


      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      const userId = await getAuthUserId();

      await addProcessImage({
        requestId,
        userId,
        areaId: data?.areaId || "iluminacao",
        uri: asset.uri,
      });
    } catch (e) {
      console.log("❌ takePhoto:", e?.code, e?.message);
      Alert.alert("Erro", "Não foi possível enviar a foto.");
    }
  }

  // ✅ salva no Storage + Firestore (processImages)
  async function pickFromGallery() {
    try {
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

      const userId = await getAuthUserId();

      await addProcessImage({
        requestId,
        userId,
        areaId: data?.areaId || "iluminacao",
        uri: asset.uri,
      });
    } catch (e) {
      console.log("❌ pickFromGallery:", e?.code, e?.message);
      Alert.alert("Erro", "Não foi possível enviar a foto.");
    }
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
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(
                  5
                )}`
              : "Não informada"}
          </ValueText>

          <Divider />

          <SectionTitle>Imagens da solicitação</SectionTitle>

          {!hasRequestImages ? (
            <ValueText>Nenhuma imagem enviada.</ValueText>
          ) : (
            <>
              <FooterHint>
                {requestImages.length} imagem(ns) anexada(s)
              </FooterHint>

              <PreviewGrid>
                {requestImages.map((img, idx) => {
                  const uri = getImgUri(img);
                  if (!uri) return null;

                  return (
                    <PreviewItem
                      key={`${uri}-${idx}`}
                      activeOpacity={0.9}
                      onPress={() => openPreview(uri)}
                    >
                      <PreviewImage source={{ uri }} />
                    </PreviewItem>
                  );
                })}
              </PreviewGrid>
            </>
          )}

          <Divider />

          <SectionTitle>Fotos do processo de execução</SectionTitle>

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

          {hasProcessImages ? (
            <>
              <FooterHint>
                {processImages.length} foto(s) do processo
              </FooterHint>

              <PreviewGrid>
                {processImages.map((img, idx) => {
                  const uri = getImgUri(img);
                  if (!uri) return null;

                  return (
                    <PreviewItem
                      key={`${uri}-process-${idx}`}
                      activeOpacity={0.9}
                      onPress={() => openPreview(uri)}
                    >
                      <PreviewImage source={{ uri }} />
                    </PreviewItem>
                  );
                })}
              </PreviewGrid>
            </>
          ) : (
            <ValueText style={{ marginTop: 10 }}>
              Nenhuma foto do processo enviada.
            </ValueText>
          )}

          <Divider />

          <SectionTitle>Status da solicitação</SectionTitle>
          <ProgressBarStatus status={data?.status || "execucao"} />

          <Divider />
        </Card>

        {/* ✅ MODAL DE PREVIEW */}
        <Modal
          visible={previewOpen}
          transparent
          animationType="fade"
          onRequestClose={closePreview}
        >
          <Pressable
            onPress={closePreview}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.92)",
              justifyContent: "center",
              alignItems: "center",
              padding: 16,
            }}
          >
            {!!previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={{ width: "100%", height: "80%" }}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </Modal>
      </Container>
    </ScrollView>
  );
}
