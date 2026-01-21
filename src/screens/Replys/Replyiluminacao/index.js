import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";

import { getAuth } from "firebase/auth";

import ProgressBarStatus from "../../../components/ProgressBarStatus";
import {
  addProcessImage,
  deleteProcessImage,
  deleteRequestImage,
  subscribeRequestById,
  updateRequestStatus,
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
  SaveStatusButton, // ✅ ADD
  SaveStatusText,
  SectionTitle,
  SmallAction,
  SmallActionText,
  ValueText,
} from "./styles";

export default function Replyiluminacao({ navigation, route }) {
  const theme = useTheme();
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
  const listRef = useRef(null);

  const { requestId } = route?.params || {};
  const [data, setData] = useState(null);

  // ✅ controle de status (admin)
  const [draftStatus, setDraftStatus] = useState("execucao");
  const [savingStatus, setSavingStatus] = useState(false);

  //campo e notas
  const [noteAnalise, setNoteAnalise] = useState("");
  const [notePendente, setNotePendente] = useState("");
  const [noteExecucao, setNoteExecucao] = useState("");

  const canEditAnalise = isAdmin && draftStatus === "analise";
  const canEditPendente = isAdmin && draftStatus === "pendente";
  const canEditExecucao = isAdmin && draftStatus === "execucao";

  // ✅ preview modal + navegação
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewList, setPreviewList] = useState([]); // lista de URIs
  const [previewIndex, setPreviewIndex] = useState(0);

  // ✅ uploads pendentes (spinner na miniatura)
  const [pendingProcessThumbs, setPendingProcessThumbs] = useState([]); // [{id, uri}]

  //para verificar usuario logado
  const auth = getAuth();

  const isAdmin =
    (auth.currentUser?.email || "").toLowerCase() ===
    "brunovalu16@gmail.com".toLowerCase();

  //campo e notas
  useEffect(() => {
    setDraftStatus(data?.status || "analise");
    setNoteAnalise(data?.noteAnalise || "");
    setNotePendente(data?.notePendente || "");
    setNoteExecucao(data?.noteExecucao || "");
  }, [data?.status, data?.noteAnalise, data?.notePendente, data?.noteExecucao]);

  function openPreview(list, index = 0) {
    const safeList = Array.isArray(list) ? list.filter(Boolean) : [];
    if (!safeList.length) return;

    const safeIndex = Math.max(0, Math.min(index, safeList.length - 1));

    setPreviewList(safeList);
    setPreviewIndex(safeIndex);
    setPreviewOpen(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: safeIndex, animated: false });
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

  async function handleSaveStatus() {
    try {
      if (!requestId) return Alert.alert("Erro", "requestId inválido.");

      setSavingStatus(true);

      const userId = await getAuthUserId();

      const statusLower = String(draftStatus || "").toLowerCase();
      const isConcluida = statusLower === "concluida"; // ✅ iluminação usa "concluida"

      await updateRequestStatus({
        requestId,
        status: statusLower, // ✅ salva status normalizado
        userId,
        notes: { noteAnalise, notePendente, noteExecucao },

        // ✅ REGRA GLOBAL: "concluída" some do app
        isHidden: isConcluida,
      });

      Alert.alert("Sucesso", "Status atualizado!");
    } catch (e) {
      console.log("❌ updateRequestStatus:", e?.code, e?.message);
      Alert.alert("Erro", e?.message || "Não foi possível salvar o status.");
    } finally {
      setSavingStatus(false);
    }
  }

  useEffect(() => {
    if (!requestId) return;

    const unsub = subscribeRequestById({
      requestId,
      onChange: (doc) => setData(doc || null),
    });

    return () => unsub?.();
  }, [requestId]);

  useEffect(() => {
    setDraftStatus(data?.status || "execucao");
  }, [data?.status]);

  const requestTitle =
    data?.requestTitle || "SOLICITAÇÃO ILUMINAÇÃO PÚBLICA - --";

  const descricaoTrim = useMemo(
    () => (data?.descricao || "").trim(),
    [data?.descricao],
  );
  const enderecoTrim = useMemo(
    () => (data?.enderecoPoste || "").trim(),
    [data?.enderecoPoste],
  );
  const numeroTrim = useMemo(
    () => (data?.numeroPoste || "").trim(),
    [data?.numeroPoste],
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

  // ✅ arrays “reais” do Firestore (objetos)
  const requestImages = Array.isArray(data?.images) ? data.images : [];
  const processImages = Array.isArray(data?.processImages)
    ? data.processImages
    : [];

  // ✅ listas só de uri pro modal
  const requestUris = requestImages.map(getImgUri).filter(Boolean);
  const processUris = processImages.map(getImgUri).filter(Boolean);

  const MAX_PROCESS_PHOTOS = 5;
  const canAddProcessPhoto =
    processImages.length + pendingProcessThumbs.length < MAX_PROCESS_PHOTOS;

  async function ensureCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar fotos.",
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
        "Precisamos de acesso à galeria para selecionar imagens.",
      );
      return false;
    }
    return true;
  }

  // ✅ excluir imagem “real” (Firestore + Storage)
  async function handleDeleteImage(field, item) {
    if (!requestId) return;

    Alert.alert(
      "Remover foto",
      "Deseja remover esta foto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              if (field === "processImages") {
                await deleteProcessImage({
                  requestId,
                  field,
                  imgObj: item,
                });
                return;
              }

              if (field === "images") {
                await deleteRequestImage({
                  requestId,
                  imgObj: item,
                });
                return;
              }

              // fallback (se passar algum field errado)
              throw new Error(`Campo inválido para deletar imagem: ${field}`);
            } catch (e) {
              console.log("❌ delete image:", e?.code, e?.message);
              Alert.alert("Erro", "Não foi possível remover a foto.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  }

  async function takePhoto() {
    let tempId = null;

    try {
      if (!requestId) return Alert.alert("Erro", "Solicitação inválida.");
      if (!canAddProcessPhoto) {
        Alert.alert(
          "Limite atingido",
          `Você pode adicionar no máximo ${MAX_PROCESS_PHOTOS} fotos do processo.`,
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

      // ✅ miniatura pendente com spinner
      tempId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setPendingProcessThumbs((prev) => [
        { id: tempId, uri: asset.uri },
        ...prev,
      ]);

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
    } finally {
      if (tempId) {
        setPendingProcessThumbs((prev) => prev.filter((x) => x.id !== tempId));
      }
    }
  }

  async function pickFromGallery() {
    let tempId = null;

    try {
      if (!requestId) return Alert.alert("Erro", "Solicitação inválida.");
      if (!canAddProcessPhoto) {
        Alert.alert(
          "Limite atingido",
          `Você pode adicionar no máximo ${MAX_PROCESS_PHOTOS} fotos do processo.`,
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

      tempId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setPendingProcessThumbs((prev) => [
        { id: tempId, uri: asset.uri },
        ...prev,
      ]);

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
    } finally {
      if (tempId) {
        setPendingProcessThumbs((prev) => prev.filter((x) => x.id !== tempId));
      }
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
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : "Não informada"}
          </ValueText>

          <Divider />

          {/* ===================== IMAGENS DA SOLICITAÇÃO ===================== */}
          <SectionTitle>Imagens da solicitação</SectionTitle>

          {!requestImages.length ? (
            <ValueText>Nenhuma imagem enviada.</ValueText>
          ) : (
            <>
              <FooterHint>
                {requestImages.length} imagem(ns) anexada(s)
              </FooterHint>

              <PreviewGrid>
                {requestImages.map((item, idx) => {
                  const uri = getImgUri(item);
                  if (!uri) return null;

                  return (
                    <PreviewItem
                      key={`${uri}-${idx}`}
                      activeOpacity={0.9}
                      onPress={() => openPreview(requestUris, idx)}
                    >
                      <PreviewImage
                        source={{ uri }}
                        style={{ width: "100%", height: "100%", opacity: 1 }}
                      />

                      {/* ✅ X para excluir */}
                      <Pressable
                        onPress={() => handleDeleteImage("images", item)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: "rgba(0,0,0,0.55)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        hitSlop={10}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </Pressable>
                    </PreviewItem>
                  );
                })}
              </PreviewGrid>
            </>
          )}

          <Divider />

          {/* ===================== FOTOS DO PROCESSO ===================== */}
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

          {/* ✅ grid do processo: pendentes (spinner) + reais (com X) */}
          {!processImages.length && !pendingProcessThumbs.length ? (
            <ValueText style={{ marginTop: 10 }}>
              Nenhuma foto do processo enviada.
            </ValueText>
          ) : (
            <>
              <FooterHint>
                {processImages.length + pendingProcessThumbs.length} foto(s) do
                processo
              </FooterHint>

              <PreviewGrid>
                {/* pendentes primeiro */}
                {pendingProcessThumbs.map((p) => (
                  <PreviewItem key={`pending-${p.id}`} activeOpacity={1}>
                    <PreviewImage
                      source={{ uri: p.uri }}
                      style={{ width: "100%", height: "100%", opacity: 0.65 }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator />
                    </View>
                  </PreviewItem>
                ))}

                {/* reais */}
                {processImages.map((item, idx) => {
                  const uri = getImgUri(item);
                  if (!uri) return null;

                  const modalIndex = processUris.indexOf(uri);

                  return (
                    <PreviewItem
                      key={`${uri}-process-${idx}`}
                      activeOpacity={0.9}
                      onPress={() =>
                        openPreview(
                          processUris,
                          modalIndex >= 0 ? modalIndex : idx,
                        )
                      }
                    >
                      <PreviewImage
                        source={{ uri }}
                        style={{ width: "100%", height: "100%", opacity: 1 }}
                      />

                      {/* ✅ X para excluir */}
                      <Pressable
                        onPress={() => handleDeleteImage("processImages", item)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: "rgba(0,0,0,0.55)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        hitSlop={10}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </Pressable>
                    </PreviewItem>
                  );
                })}
              </PreviewGrid>
            </>
          )}

          <Divider />

          <SectionTitle>Status da solicitação</SectionTitle>

          <ProgressBarStatus
            status={draftStatus}
            isAdmin={isAdmin}
            onChangeStatus={setDraftStatus}
          />

          <Divider />

          <Divider />

          <SectionTitle>Informações por etapa</SectionTitle>

          {/* ANÁLISE */}
          <ValueText style={{ fontWeight: "800", marginTop: 8 }}>
            ANÁLISE
          </ValueText>
          {isAdmin ? (
            <TextInput
              value={noteAnalise}
              onChangeText={setNoteAnalise}
              editable={canEditAnalise}
              placeholder="Digite as informações da análise..."
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                padding: 12,
                marginTop: 6,
                opacity: canEditAnalise ? 1 : 0.55,
              }}
            />
          ) : (
            <ValueText>{noteAnalise?.trim() ? noteAnalise : "—"}</ValueText>
          )}

          {/* PENDENTE */}
          <ValueText style={{ fontWeight: "800", marginTop: 14 }}>
            PENDENTE
          </ValueText>
          {isAdmin ? (
            <TextInput
              value={notePendente}
              onChangeText={setNotePendente}
              editable={canEditPendente}
              placeholder="Digite o que está pendente..."
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                padding: 12,
                marginTop: 6,
                opacity: canEditPendente ? 1 : 0.55,
              }}
            />
          ) : (
            <ValueText>{notePendente?.trim() ? notePendente : "—"}</ValueText>
          )}

          {/* EM EXECUÇÃO */}
          <ValueText style={{ fontWeight: "800", marginTop: 14 }}>
            EM EXECUÇÃO
          </ValueText>
          {isAdmin ? (
            <TextInput
              value={noteExecucao}
              onChangeText={setNoteExecucao}
              editable={canEditExecucao}
              placeholder="Digite informações da execução..."
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                padding: 12,
                marginTop: 6,
                opacity: canEditExecucao ? 1 : 0.55,
              }}
            />
          ) : (
            <ValueText>{noteExecucao?.trim() ? noteExecucao : "—"}</ValueText>
          )}
        </Card>

        {isAdmin && (
          <SaveStatusButton
            onPress={handleSaveStatus}
            disabled={
              savingStatus || draftStatus === (data?.status || "execucao")
            }
          >
            {savingStatus ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <SaveStatusText>SALVAR STATUS</SaveStatusText>
            )}
          </SaveStatusButton>
        )}

        {/* ===================== MODAL CARROSSEL FOTOS ===================== */}
        <Modal
          visible={previewOpen}
          transparent
          animationType="fade"
          onRequestClose={closePreview}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}>
            {/* toque no fundo fecha */}
            <Pressable
              onPress={closePreview}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />

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
              onScrollToIndexFailed={() => {}}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_W,
                );
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

            {/* X fechar */}
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

            {/* indicador 1/N */}
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
                {previewList.length
                  ? `${previewIndex + 1}/${previewList.length}`
                  : ""}
              </ValueText>
            </View>

            {/* seta esquerda */}
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

            {/* seta direita */}
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
