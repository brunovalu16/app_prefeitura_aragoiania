import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "styled-components/native";

import MapModal from "../../components/MapModal";
import PrimaryButtonenviarareas from "../../components/PrimaryButtonenviarareas";
import PrimaryButtonlocalizacao from "../../components/PrimaryButtonlocalizacao";

import {
  ActionRow,
  AreaTitle,
  Card,
  CepInput,
  CepRow,
  Container,
  CounterRow,
  CounterText,
  DescriptionInput,
  FieldLabel,
  Helper,
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

  const [modal, setModal] = useState(false);
  const [cep, setCep] = useState("");
  const [descricao, setDescricao] = useState("");

  const [images, setImages] = useState([]); // [{ uri }]
  const [location, setLocation] = useState(null); // { latitude, longitude }

  const [loading ] = useState(false);
  const [sentOnce, setSentOnce] = useState(false);

  const MAX_PHOTOS = 5;
  const MAX_CHARS = 500;

  const descricaoTrim = useMemo(() => descricao.trim(), [descricao]);
  const canSend = !!descricaoTrim && !loading;

  function handleCepChange(value) {
    const only = value.replace(/\D/g, "").slice(0, 8);
    setCep(only);

    if (only.length === 8) {
      Keyboard.dismiss();
      navigation.navigate("CepPreenchido", { cep: only });
    }
  }

 

  async function ensureMediaPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para selecionar imagens."
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
        "Precisamos de acesso à câmera para tirar fotos."
      );
      return false;
    }
    return true;
  }

  function addAssetsToImages(assets) {
    if (!assets?.length) return;

    const remaining = MAX_PHOTOS - images.length;
    if (remaining <= 0) {
      Alert.alert("Limite atingido", `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`);
      return;
    }

    const mapped = assets
      .slice(0, remaining)
      .map((a) => ({ uri: a.uri }));

    setImages((prev) => [...prev, ...mapped]);
  }

  async function pickFromGallery() {
    Keyboard.dismiss();

    if (images.length >= MAX_PHOTOS) {
      Alert.alert("Limite atingido", `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`);
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
      Alert.alert("Limite atingido", `Você pode adicionar no máximo ${MAX_PHOTOS} fotos.`);
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

  function handleSelectLocation(coords) {
    // coords: { latitude, longitude }
    setLocation(coords);
    setModal(false);
  }

function handleSend() {
  Keyboard.dismiss();

  if (!descricaoTrim) {
    setSentOnce(true);
    Alert.alert("Atenção", "Preencha a descrição da solicitação.");
    return;
  }

  navigation.navigate("Replyiluminacao", {
    areaId: "iluminacao",
    areaLabel: "ILUMINAÇÃO PÚBLICA",
    descricao: descricaoTrim,
    cep,
    images,
    location,
  });
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
              Deseja adicionar uma imagem à solicitação? Tire fotos com a câmera
              agora ou escolha da galeria de fotos do seu celular. Limite de{" "}
              {MAX_PHOTOS} fotos
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

            <FieldLabel>Adicione o endereço à solicitação</FieldLabel>

            <CepRow>
              <CepInput
                placeholder="CEP"
                placeholderTextColor="#4B0F8A"
                keyboardType="numeric"
                value={cep}
                onChangeText={handleCepChange}
                returnKeyType="done"
              />
            </CepRow>

            <PrimaryButtonlocalizacao
              title={
                location
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
    </KeyboardAvoidingView>
  </TouchableWithoutFeedback>
);
}
