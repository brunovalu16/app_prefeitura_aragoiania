import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions, FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View
} from "react-native";
import { useTheme } from "styled-components/native";



import ProgressBarStatus from "../../../components/ProgressBarStatus";
import {
  addProcessImage,
  deleteRequest,
  subscribeRequestById,
} from "../../../services/requests";
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

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
  const listRef = useRef(null);

const [deleting, setDeleting] = useState(false);

  const { requestId } = route?.params || {};
  const [data, setData] = useState(null);

  // ✅ preview modal + navegação
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]); // lista de URIs
  const [previewIndex, setPreviewIndex] = useState(0);

  function openPreview(list, index = 0) {
  const safeList = Array.isArray(list) ? list.filter(Boolean) : [];
  if (!safeList.length) return;

  const safeIndex = Math.max(0, Math.min(index, safeList.length - 1));

  setPreviewList(safeList);
  setPreviewIndex(safeIndex);
  setPreviewOpen(true);

  // ✅ garante que o FlatList abre exatamente na imagem clicada
  requestAnimationFrame(() => {
    listRef.current?.scrollToIndex({
      index: safeIndex,
      animated: false,
    });
  });
}

function closePreview() {
  setPreviewOpen(false);
  setPreviewList([]);
  setPreviewIndex(0);
}


  const canPrev = previewIndex > 0;
  const canNext = previewIndex < previewList.length - 1;


 function goPrev() {
  if (!canPrev) return;
  const next = previewIndex - 1;
  setPreviewIndex(next);
  listRef.current?.scrollToIndex({ index: next, animated: true });
}

function goNext() {
  if (!canNext) return;
  const next = previewIndex + 1;
  setPreviewIndex(next);
  listRef.current?.scrollToIndex({ index: next, animated: true });
}


  useEffect(() => {
    if (!requestId) return;

    const unsub = subscribeRequestById({
      requestId,
      onChange: (doc) => setData(doc || null),
    });

    return () => unsub?.();
  }, [requestId]);

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

  // ✅ suporta imagens como [{url}] | [{uri}] | "string"
  function getImgUri(img) {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img?.url || img?.uri || null;
  }

  const requestImagesRaw = Array.isArray(data?.images) ? data.images : [];
  const processImagesRaw = Array.isArray(data?.processImages)
    ? data.processImages
    : [];

  // ✅ listas só de uri, já prontas pro modal e pro grid
  const requestUris = requestImagesRaw
    .map(getImgUri)
    .filter(Boolean);

  const processUris = processImagesRaw
    .map(getImgUri)
    .filter(Boolean);

  const MAX_PROCESS_PHOTOS = 5;
  const canAddProcessPhoto = processUris.length < MAX_PROCESS_PHOTOS;

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
    try {
      if (!requestId) return Alert.alert("Erro", "Solicitação inválida.");

      if (!canAddProcessPhoto) {
        Alert.alert(
          "Limite atingido",
          `Você pode adicionar no máximo ${MAX_PROCESS_PHOTOS} fotos do processo.`
        );
        return;
      }

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

  async function pickFromGallery() {
    try {
      if (!requestId) return Alert.alert("Erro", "Solicitação inválida.");

      if (!canAddProcessPhoto) {
        Alert.alert(
          "Limite atingido",
          `Você pode adicionar no máximo ${MAX_PROCESS_PHOTOS} fotos do processo.`
        );
        return;
      }

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


  //função deletar
  function handleDeleteRequest() {
  if (!requestId) return;

  Alert.alert(
    "Excluir solicitação",
    "Tem certeza que deseja excluir essa solicitação? Essa ação não pode ser desfeita.",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteRequest({ requestId });

            Alert.alert("Pronto", "Solicitação excluída com sucesso.");
            navigation.goBack(); // ou navigate("Recebeiluminacao")
          } catch (e) {
            console.log("❌ deleteRequest:", e?.code, e?.message);
            Alert.alert("Erro", "Não foi possível excluir a solicitação.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]
  );
}


  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="document-text-outline" size={18} color={theme.colors.purple} />
              <AreaTitle>{requestTitle}</AreaTitle>
            </View>

            <Pressable
              onPress={handleDeleteRequest}
              disabled={deleting}
              style={{ padding: 6, opacity: deleting ? 0.5 : 1 }}
              hitSlop={10}
            >
              <Ionicons name="trash-outline" size={20} color="#E11D48" />
            </Pressable>
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

          {!requestUris.length ? (
            <ValueText>Nenhuma imagem enviada.</ValueText>
          ) : (
            <>
              <FooterHint>{requestUris.length} imagem(ns) anexada(s)</FooterHint>

              <PreviewGrid>
                {requestUris.map((uri, idx) => (
                  <PreviewItem
                    key={`${uri}-${idx}`}
                    activeOpacity={0.9}
                    onPress={() => openPreview(requestUris, idx)}
                  >
                    <PreviewImage
                      source={{ uri }}
                      style={{ width: "100%", height: "100%", opacity: 1 }}
                    />
                  </PreviewItem>
                ))}
              </PreviewGrid>
            </>
          )}

          <Divider />

          <SectionTitle>Fotos do processo de execução</SectionTitle>

          <ActionRow>
            <SmallAction
              onPress={takePhoto}
              disabled={!canAddProcessPhoto}
              style={{ opacity: canAddProcessPhoto ? 1 : 0.5 }}
            >
              <Ionicons name="camera-outline" size={15} color="#fff" />
              <SmallActionText>CÂMERA</SmallActionText>
            </SmallAction>

            <SmallAction
              onPress={pickFromGallery}
              disabled={!canAddProcessPhoto}
              style={{ opacity: canAddProcessPhoto ? 1 : 0.5 }}
            >
              <Ionicons name="images-outline" size={15} color="#fff" />
              <SmallActionText>GALERIA</SmallActionText>
            </SmallAction>
          </ActionRow>

          {!processUris.length ? (
            <ValueText style={{ marginTop: 10 }}>
              Nenhuma foto do processo enviada.
            </ValueText>
          ) : (
            <>
              <FooterHint>{processUris.length} foto(s) do processo</FooterHint>

              <PreviewGrid>
                {processUris.map((uri, idx) => (
                  <PreviewItem
                    key={`${uri}-process-${idx}`}
                    activeOpacity={0.9}
                    onPress={() => openPreview(processUris, idx)}
                  >
                    <PreviewImage
                      source={{ uri }}
                      style={{ width: "100%", height: "100%", opacity: 1 }}
                    />
                  </PreviewItem>
                ))}
              </PreviewGrid>
            </>
          )}

          <Divider />

          <SectionTitle>Status da solicitação</SectionTitle>
          <ProgressBarStatus status={data?.status || "execucao"} />

          <Divider />
        </Card>

        {/* ✅ MODAL COM SETAS */}
        <Modal
          visible={previewOpen}
          transparent
          animationType="fade"
          onRequestClose={closePreview}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}>
            {/* ✅ toque no fundo fecha (fica atrás de tudo) */}
            <Pressable
              onPress={closePreview}
              style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            />

            {/* ✅ CARROSSEL */}
            <FlatList
              ref={listRef}
              data={previewList}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              getItemLayout={(_, index) => ({
                length: SCREEN_W,
                offset: SCREEN_W * index,
                index,
              })}
              initialScrollIndex={previewIndex}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  listRef.current?.scrollToOffset({
                    offset: info.averageItemLength * info.index,
                    animated: false,
                  });
                }, 50);
              }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                setPreviewIndex(idx);
              }}
              renderItem={({ item: uri }) => (
                <View
                  style={{
                    width: SCREEN_W,
                    height: SCREEN_H,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                  }}
                  pointerEvents="box-none"
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "78%" }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />

            {/* ✅ X fechar */}
            <Pressable
              onPress={closePreview}
              style={{
                position: "absolute",
                top: 48,
                right: 18,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
              }}
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>

            {/* ✅ indicador 1/5 */}
            <View
              style={{
                position: "absolute",
                top: 52,
                left: 18,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            >
              <ValueText style={{ color: "#fff" }}>
                {previewList.length ? `${previewIndex + 1}/${previewList.length}` : ""}
              </ValueText>
            </View>

            {/* ✅ seta esquerda */}
            <Pressable
              onPress={goPrev}
              disabled={!canPrev}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                marginTop: -22,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.14)",
                alignItems: "center",
                justifyContent: "center",
                opacity: canPrev ? 1 : 0.3,
              }}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>

            {/* ✅ seta direita */}
            <Pressable
              onPress={goNext}
              disabled={!canNext}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                marginTop: -22,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.14)",
                alignItems: "center",
                justifyContent: "center",
                opacity: canNext ? 1 : 0.3,
              }}
              hitSlop={10}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </Pressable>
          </View>
        </Modal>

      </Container>
    </ScrollView>
  );
}
