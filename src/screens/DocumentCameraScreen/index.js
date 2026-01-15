import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

import {
  ActionsRow,
  ActionText,
  BottomHint,
  BottomWrap,
  Container,
  DocSelectorBtn,
  DocSelectorText,
  FrameOverlay,
  IconBtn,
  PermissionBtn,
  PermissionBtnText,
  PermissionText,
  PermissionWrap,
  PrimaryBtn,
  RetakeBtn,
  ShutterBtn,
  ShutterInner,
  Spacer,
  StepChip,
  StepChipText,
  TopBar
} from "./styles";

export default function DocumentCameraScreen({ navigation, route }) {


  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const tipos = useMemo(
    () => [
      { id: "CNH", label: "CNH", precisaVerso: true },
      { id: "RG", label: "RG", precisaVerso: true },
      { id: "CPF", label: "CPF", precisaVerso: false },
    ],
    []
  );

  const [tipoDoc, setTipoDoc] = useState(tipos[0]);
  const [step, setStep] = useState("FRENTE");
  const [frontUri, setFrontUri] = useState(null);
  const [backUri, setBackUri] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleTakePicture() {
    if (!cameraRef.current || loading) return;
    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (!photo?.uri) {
        Alert.alert("Erro", "Não foi possível capturar a foto.");
        return;
      }

      if (step === "FRENTE") {
        setFrontUri(photo.uri);

        if (tipoDoc.precisaVerso) {
          setStep("VERSO");
        } else {
          navigation.navigate({
            name: route?.params?.returnTo || "Cadastro",
            params: { docTipo: tipoDoc.id, docFrente: photo.uri, docVerso: null },
            merge: true,
          });
          navigation.goBack();
        }
      } else {
        setBackUri(photo.uri);

        navigation.navigate({
          name: route?.params?.returnTo || "Cadastro",
          params: { docTipo: tipoDoc.id, docFrente: frontUri, docVerso: photo.uri },
          merge: true,
        });
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    } finally {
      setLoading(false);
    }
  }

  function handleRetake() {
    if (step === "FRENTE") setFrontUri(null);
    else setBackUri(null);
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <PermissionWrap>
        <PermissionText>Precisamos da permissão da câmera para continuar.</PermissionText>

        <PermissionBtn onPress={requestPermission}>
          <PermissionBtnText>PERMITIR CÂMERA</PermissionBtnText>
        </PermissionBtn>
      </PermissionWrap>
    );
  }

  const jaTemFoto = step === "FRENTE" ? !!frontUri : !!backUri;

  return (
    <Container>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

      <TopBar>
        <IconBtn onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={30} color="#fff" />
        </IconBtn>

        <DocSelectorBtn
          onPress={() => {
            const idx = tipos.findIndex((t) => t.id === tipoDoc.id);
            const next = tipos[(idx + 1) % tipos.length];
            setTipoDoc(next);

            if (!next.precisaVerso && step === "VERSO") {
              setStep("FRENTE");
              setBackUri(null);
            }
          }}
        >
          <Ionicons name="card-outline" size={18} color="#fff" />
          <DocSelectorText>{tipoDoc.label}</DocSelectorText>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </DocSelectorBtn>

        <Spacer />
      </TopBar>

      <FrameOverlay />

      <StepChip>
        <StepChipText>{step}</StepChipText>
      </StepChip>

      <BottomWrap>
        <BottomHint>Centralize o documento na moldura</BottomHint>

        <ActionsRow>
          {jaTemFoto ? (
            <>
              <RetakeBtn onPress={handleRetake}>
                <ActionText>REFazer</ActionText>
              </RetakeBtn>

              <PrimaryBtn
                onPress={() => {
                  if (step === "FRENTE" && tipoDoc.precisaVerso) setStep("VERSO");
                }}
              >
                <ActionText>
                  {step === "FRENTE" && tipoDoc.precisaVerso ? "IR PARA VERSO" : "OK"}
                </ActionText>
              </PrimaryBtn>
            </>
          ) : (
            <ShutterBtn onPress={handleTakePicture} disabled={loading}>
              <ShutterInner />
            </ShutterBtn>
          )}
        </ActionsRow>
      </BottomWrap>
    </Container>
  );
}
