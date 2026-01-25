import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "styled-components/native";

import { testStorageUpload } from "../../../services/storageTest";

import MapModal from "../../../components/MapModal";
import PrimaryButtonenviarareas from "../../../components/PrimaryButtonenviarareas";
import PrimaryButtonlocalizacao from "../../../components/PrimaryButtonlocalizacao";

import { getAuth } from "firebase/auth";
import { createRequest } from "../../../services/requests";
import { getAuthUserId } from "../../../services/userId";

import AppAlert from "../../../components/AppAlert";

import {
  ActionRow,
  AddressInput,
  // ✅ NOVOS
  AddressRow,
  AreaTitle,
  Card,
  Container,
  CounterRow,
  CounterText,
  DescriptionInput,
  FieldLabel,
  Helper,
  PostNumberInput,
  PreviewGrid,
  PreviewImage,
  PreviewItem,
  RemoveBadge,
  RemoveBadgeText,
  Row,
  SmallAction,
  SmallActionText,
} from "./styles";

export default function Solicitar({ navigation }) {
  const theme = useTheme();

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState(null);

  const [modal, setModal] = useState(false);
  const [enderecoPoste, setEnderecoPoste] = useState("");
  const [numeroPoste, setNumeroPoste] = useState("");
  const [descricao, setDescricao] = useState("");

  const [images, setImages] = useState([]); // [{ uri }]
  const [location, setLocation] = useState(null); // { latitude, longitude }

  const [loading, setLoading] = useState(false);
  const [sentOnce, setSentOnce] = useState(false);

  const MAX_PHOTOS = 5;
  const MAX_CHARS = 500;

  const descricaoTrim = useMemo(() => descricao.trim(), [descricao]);
  const canSend = !!descricaoTrim && !loading;

  // chama uma vez só pra testar
  useEffect(() => {
    testStorageUpload().catch((e) =>
      console.log("❌ STORAGE TEST FAIL:", e?.code, e?.message, e),
    );
  }, []);

  async function ensureMediaPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para selecionar imagens.",
      );
      return false;
    }
    return true;
  }

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

  function addAssetsToImages(assets) {
    if (!assets?.length) return;

    const remaining = MAX_PHOTOS - images.length;
    if (remaining <= 0) {
      Alert.alert(
        "Limite atingido",
        `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
      );
      return;
    }

    const mapped = assets.slice(0, remaining).map((a) => ({ uri: a.uri }));

    setImages((prev) => [...prev, ...mapped]);
  }

  async function pickFromGallery() {
    Keyboard.dismiss();

    if (images.length >= MAX_PHOTOS) {
      Alert.alert(
        "Limite atingido",
        `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
      );
      return;
    }

    const ok = await ensureMediaPermission();
    if (!ok) return;

    const remaining = MAX_PHOTOS - images.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remaining, // iOS 14+ / versões recentes
    });

    if (result.canceled) return;

    addAssetsToImages(result.assets);
  }

  async function takePhoto() {
    Keyboard.dismiss();

    if (images.length >= MAX_PHOTOS) {
      Alert.alert(
        "Limite atingido",
        `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`,
      );
      return;
    }

    const ok = await ensureCameraPermission();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled) return;

    addAssetsToImages(result.assets);
  }

  function removeImage(uri) {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  }

  function handleOpenMap() {
    Keyboard.dismiss();
    setModal(true);
  }

  function handleSelectLocation(data) {
    // data: { latitude, longitude, address }
    setLocation(data);
    setModal(false);
  }

  async function handleSend() {
    if (loading) return;

    try {
      Keyboard.dismiss();

      if (!descricaoTrim) {
        setSentOnce(true);
        Alert.alert("Atenção", "Preencha a descrição da solicitação.");
        return;
      }

      setLoading(true);

      const userId = await getAuthUserId(); // ✅ AGORA COM AWAIT

      const auth = getAuth();
      const userEmail = (auth.currentUser?.email || "").trim().toLowerCase(); // ✅ email real

      const { requestId } = await createRequest({
        userId,
        userEmail, // ✅ envia pro backend
        areaId: "iluminacao",
        areaLabel: "ILUMINAÇÃO PÚBLICA",
        descricao: descricaoTrim,
        enderecoPoste,
        numeroPoste,
        images,
        location,
      });

      setSuccessRequestId(requestId);
      setSuccessOpen(true);
    } catch (err) {
      console.log("❌ handleSend:", err?.code, err?.message);
      Alert.alert("Erro", "Não foi possível enviar sua solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
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
                <AreaTitle>ILUMINAÇÃO PÚBLICA</AreaTitle>
              </Row>

              <FieldLabel>Descrição da solicitação</FieldLabel>

              <DescriptionInput
                placeholder="Descreva o problema com o máximo de detalhes possível"
                placeholderTextColor="#9CA3AF"
                value={descricao}
                onChangeText={(t) => {
                  setDescricao(t.slice(0, MAX_CHARS));
                  if (sentOnce) setSentOnce(false);
                }}
              />

              <CounterRow>
                <CounterText error={sentOnce && !descricaoTrim}>
                  {sentOnce && !descricaoTrim ? "Descrição obrigatória" : " "}
                </CounterText>

                <CounterText>
                  {descricao.length}/{MAX_CHARS}
                </CounterText>
              </CounterRow>

              <FieldLabel>Imagem da solicitação</FieldLabel>
              <Helper>
                Deseja adicionar uma imagem à solicitação? Tire fotos com a
                câmera agora ou escolha da galeria de fotos do seu celular.
                Limite de {MAX_PHOTOS} fotos
              </Helper>

              <ActionRow>
                <SmallAction onPress={takePhoto} disabled={loading}>
                  <Ionicons name="camera-outline" size={16} color="#fff" />
                  <SmallActionText>CÂMERA</SmallActionText>
                </SmallAction>

                <SmallAction
                  onPress={pickFromGallery}
                  style={{ marginLeft: 10 }}
                  disabled={loading}
                >
                  <Ionicons name="images-outline" size={16} color="#fff" />
                  <SmallActionText>GALERIA</SmallActionText>
                </SmallAction>
              </ActionRow>

              {!!images.length && (
                <PreviewGrid>
                  {images.map((img) => (
                    <PreviewItem key={img.uri}>
                      <PreviewImage source={{ uri: img.uri }} />
                      <RemoveBadge onPress={() => removeImage(img.uri)}>
                        <RemoveBadgeText>×</RemoveBadgeText>
                      </RemoveBadge>
                    </PreviewItem>
                  ))}
                </PreviewGrid>
              )}

              <FieldLabel>Endereço onde está o poste</FieldLabel>

              <AddressRow>
                <AddressInput
                  placeholder="Ex: Rua X, Setor Y, próximo ao nº 123"
                  placeholderTextColor="#9CA3AF"
                  value={enderecoPoste}
                  onChangeText={setEnderecoPoste}
                  returnKeyType="next"
                />
              </AddressRow>

              <FieldLabel>Número do poste</FieldLabel>

              <AddressRow>
                <PostNumberInput
                  placeholder="Ex: 123456 (se tiver)"
                  placeholderTextColor="#9CA3AF"
                  value={numeroPoste}
                  onChangeText={(t) =>
                    setNumeroPoste(t.replace(/\s/g, "").slice(0, 30))
                  }
                  returnKeyType="done"
                />
              </AddressRow>

              <PrimaryButtonlocalizacao
                title={
                  location?.address?.trim()
                    ? location.address
                    : location?.latitude
                      ? `LOCAL OK (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
                      : "USAR LOCALIZAÇÃO ATUAL"
                }
                onPress={handleOpenMap}
                style={{ marginTop: 12 }}
              />

              <PrimaryButtonenviarareas
                title={loading ? "ENVIANDO..." : "ENVIAR"}
                onPress={handleSend}
                disabled={!canSend}
                style={{ marginTop: 10 }}
              />
            </Card>

            <MapModal
              visible={modal}
              onClose={() => setModal(false)}
              onSelectLocation={handleSelectLocation}
            />
          </Container>
        </ScrollView>

        {/* ✅ POPUP DE SUCESSO */}
        <AppAlert
          visible={successOpen}
          variant="success"
          title="Solicitação enviada"
          message="Sua solicitação foi registrada com sucesso."
          onClose={() => {
            setSuccessOpen(false);

            if (successRequestId) {
              navigation.navigate("Replyiluminacao", {
                requestId: successRequestId,
              });
            }
          }}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
