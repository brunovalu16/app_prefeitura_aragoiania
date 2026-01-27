import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { uploadImageAsync } from "../../services/uploadImage";

import { Images } from "../../assets/images";
import {
  AvatarBtn,
  AvatarImage,
  Col,
  Container,
  EyeBtn,
  Form,
  FormLock,
  InputLine,
  Label,
  LogoArea,
  LogoImage,
  PasswordInput,
  PasswordRow,
  PhotoActionBtn,
  PhotoActionsRow,
  PhotoActionText,
  Row2,
  SectionHint,
  SubmitArea,
  SubmitBtn,
  SubmitText,
  SusInput,
  SusRow,
  TopBack
} from "./styles";

export default function Cadastro({ navigation }) {
  const theme = useTheme();

  // ✅ Avatar do usuário (uri local e url do storage)
  const [avatarUri, setAvatarUri] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  // ✅ Fotos (URIs)
  const [fotoCpfFrente, setFotoCpfFrente] = useState(null);
  const [fotoCpfVerso, setFotoCpfVerso] = useState(null);

  const [fotoTitulo1, setFotoTitulo1] = useState(null); // frente
  const [fotoTitulo2, setFotoTitulo2] = useState(null); // verso

  // 0º SUS (5 dígitos)
  const [sus, setSus] = useState("");

  const SUS_TAMANHO = 5;

  // ✅ Libera o formulário quando SUS tiver 5 dígitos (qualquer número)
  const susLiberado = sus.length === SUS_TAMANHO;

  // 1º Nome
  const [nome, setNome] = useState("");

  // 2º Email
  const [email, setEmail] = useState("");

  // 3º CPF + RG
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");

  // 5º Telefone
  const [telefone, setTelefone] = useState("");

  // 6º Endereço
  const [endereco, setEndereco] = useState("");

  // 7º Título
  const [tituloEleitor, setTituloEleitor] = useState("");

  // 9º Senha + 10º confirmar
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // ✅ Duplo clique no SUS (seleciona tudo)
  const susRef = useRef(null);
  const lastTapRef = useRef(0);

  function selectAllSus() {
    const len = (sus || "").length;
    if (!susRef.current || len === 0) return;

    susRef.current.setNativeProps({
      selection: { start: 0, end: len },
    });
  }

  function handleSusPressIn() {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 260;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      selectAllSus();
    }
    lastTapRef.current = now;
  }

  // ✅ Permissões
  async function pedirPermissoesCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão", "Você precisa permitir o uso da câmera.");
      return false;
    }
    return true;
  }

  async function pedirPermissoesGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão", "Você precisa permitir o acesso à galeria.");
      return false;
    }
    return true;
  }

  async function pickAvatar(source = "gallery") {
    if (isPicking || isSubmitting) return;

    setIsPicking(true);
    try {
      const ok =
        source === "camera"
          ? await pedirPermissoesCamera()
          : await pedirPermissoesGaleria();

      if (!ok) return;

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: true, // ✅ avatar melhor com crop
              aspect: [1, 1],
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: true,
              aspect: [1, 1],
            });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri || null;
      setAvatarUri(uri);
    } catch (_e) {
      Alert.alert("Erro", "Não foi possível selecionar a foto do perfil.");
    } finally {
      setIsPicking(false);
    }
  }

  // ✅ Helper: pega FRENTE e depois VERSO (câmera ou galeria)
  async function pegarFrenteVerso({ source, setFrente, setVerso }) {
    if (!susLiberado) {
      Alert.alert("SUS", "Digite um número de SUS com 5 dígitos.");
      return;
    }

    setIsPicking(true);

    try {
      const ok =
        source === "camera"
          ? await pedirPermissoesCamera()
          : await pedirPermissoesGaleria();

      if (!ok) return;

      // ✅ zera antes de começar um novo fluxo
      setFrente(null);
      setVerso(null);

      // 1) FRENTE
      const resultFrente =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            });

      if (resultFrente.canceled) return;

      const uriFrente = resultFrente.assets?.[0]?.uri || null;
      setFrente(uriFrente);

      // 2) VERSO
      const resultVerso =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false,
            });

      if (resultVerso.canceled) {
        // ✅ cancelou o verso → desfaz a frente também
        setFrente(null);
        setVerso(null);
        return;
      }

      const uriVerso = resultVerso.assets?.[0]?.uri || null;
      setVerso(uriVerso);
    } catch (_e) {
      Alert.alert("Erro", "Não foi possível selecionar as fotos.");
      setFrente(null);
      setVerso(null);
    } finally {
      setIsPicking(false);
    }
  }

  // ✅ CPF/RG/CNH (frente/verso)
  function handleCameraCpfRg() {
    if (isPicking || isSubmitting) return;
    pegarFrenteVerso({
      source: "camera",
      setFrente: setFotoCpfFrente,
      setVerso: setFotoCpfVerso,
    });
  }
  function handleGaleriaCpfRg() {
    if (isPicking || isSubmitting) return;
    pegarFrenteVerso({
      source: "gallery",
      setFrente: setFotoCpfFrente,
      setVerso: setFotoCpfVerso,
    });
  }

  // ✅ Título (frente/verso)
  function handleCameraTitulo() {
    if (isPicking || isSubmitting) return;
    pegarFrenteVerso({
      source: "camera",
      setFrente: setFotoTitulo1,
      setVerso: setFotoTitulo2,
    });
  }
  function handleGaleriaTitulo() {
    if (isPicking || isSubmitting) return;
    pegarFrenteVerso({
      source: "gallery",
      setFrente: setFotoTitulo1,
      setVerso: setFotoTitulo2,
    });
  }

  // ✅ Cadastrar
  async function handleCadastrar() {
    if (isSubmitting) return;

    // ✅ regra nova: só exige 5 dígitos
    if (!susLiberado) {
      Alert.alert("SUS", "Digite um número de SUS com 5 dígitos.");
      return;
    }

    // ✅ validações
    if (!nome)
      return Alert.alert("Campo obrigatório", "Informe seu nome completo.");
    if (!email) return Alert.alert("Campo obrigatório", "Informe seu email.");
    if (!cpf || !rg) return Alert.alert("Documento", "Informe CPF e RG.");
    if (!telefone) return Alert.alert("Contato", "Informe um telefone válido.");
    if (!endereco) return Alert.alert("Endereço", "Informe seu endereço.");
    if (!tituloEleitor)
      return Alert.alert("Título de eleitor", "Informe o título de eleitor.");

    if (!fotoCpfFrente || !fotoCpfVerso) {
      return Alert.alert(
        "Documento obrigatório",
        "Envie as duas fotos (frente e verso) do CPF, RG ou CNH.",
      );
    }

    if (!fotoTitulo1 || !fotoTitulo2) {
      return Alert.alert(
        "Documento obrigatório",
        "Envie as duas fotos (frente e verso) do Título de Eleitor.",
      );
    }

    if (senha.length < 6) {
      return Alert.alert(
        "Senha inválida",
        "A senha deve conter no mínimo 6 caracteres.",
      );
    }

    if (senha !== confirmarSenha) {
      return Alert.alert("Senha", "As senhas não conferem.");
    }

    const emailSafe = String(email || "")
      .trim()
      .toLowerCase();

    try {
      setIsSubmitting(true);

      // 1) cria usuário no Auth
      const cred = await createUserWithEmailAndPassword(auth, emailSafe, senha);
      const uid = cred.user.uid;

      // (opcional) salva nome no perfil do Auth
      await updateProfile(cred.user, {
        displayName: String(nome || "").trim(),
      });

      // 2) upload fotos no Storage (REST) — sua lógica
      const basePath = `users/${uid}/cadastro`;

      // ✅ avatar (opcional)
      let avatarUrl = null;

      if (avatarUri) {
        avatarUrl = await uploadImageAsync({
          uri: avatarUri,
          path: `${basePath}/avatar_${Date.now()}.jpg`,
        });

        // ✅ salva no Auth Profile também
        await updateProfile(cred.user, { photoURL: avatarUrl });
      }

      const cpfFrenteUrl = await uploadImageAsync({
        uri: fotoCpfFrente,
        path: `${basePath}/doc_cpf_rg_cnh_frente_${Date.now()}.jpg`,
      });

      const cpfVersoUrl = await uploadImageAsync({
        uri: fotoCpfVerso,
        path: `${basePath}/doc_cpf_rg_cnh_verso_${Date.now()}.jpg`,
      });

      const tituloFrenteUrl = await uploadImageAsync({
        uri: fotoTitulo1,
        path: `${basePath}/doc_titulo_frente_${Date.now()}.jpg`,
      });

      const tituloVersoUrl = await uploadImageAsync({
        uri: fotoTitulo2,
        path: `${basePath}/doc_titulo_verso_${Date.now()}.jpg`,
      });

      // 3) salva usuário no Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        nome: String(nome || "").trim(),
        email: emailSafe,
        avatarUrl: avatarUrl || null,
        cpf: String(cpf || "").trim(),
        rg: String(rg || "").trim(),
        telefone: String(telefone || "").trim(),
        endereco: String(endereco || "").trim(),
        tituloEleitor: String(tituloEleitor || "").trim(),

        // ✅ SUS do jeito que está
        susDigitado: sus,

        documentos: {
          cpfRgCnh: {
            frente: cpfFrenteUrl,
            verso: cpfVersoUrl,
          },
          tituloEleitor: {
            frente: tituloFrenteUrl,
            verso: tituloVersoUrl,
          },
        },

        status: "pendente",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Cadastro enviado com sucesso!");
      navigation.navigate("Login");
    } catch (err) {
      console.log("❌ CADASTRO:", err?.code, err?.message);

      if (err?.code === "auth/email-already-in-use") {
        Alert.alert(
          "Email já cadastrado",
          "Esse email já está em uso. Faça login ou use outro email.",
        );
        return;
      }
      if (err?.code === "auth/invalid-email") {
        Alert.alert("Email inválido", "Digite um email válido.");
        return;
      }
      if (err?.code === "auth/weak-password") {
        Alert.alert("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      Alert.alert("Erro", "Não foi possível concluir o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const disableActions = !susLiberado || isPicking || isSubmitting;

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <TopBack onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Ionicons
            name="arrow-back-circle-outline"
            size={35}
            color="#777777"
          />
        </TopBack>

        <LogoArea>
          <LogoImage source={Images.logo_colorida_aragoiania} />
        </LogoArea>

        <Form>
          {/* 0º SUS + AVATAR */}
          <Label>Número do SUS</Label>
          <SusRow>
            <AvatarBtn
              activeOpacity={0.9}
              onPress={() => {
                Alert.alert("Foto do perfil", "Escolha uma opção", [
                  { text: "Câmera", onPress: () => pickAvatar("camera") },
                  { text: "Galeria", onPress: () => pickAvatar("gallery") },
                  { text: "Cancelar", style: "cancel" },
                ]);
              }}
              disabled={isPicking || isSubmitting}
              style={{ opacity: isPicking || isSubmitting ? 0.6 : 1 }}
            >
              {avatarUri ? (
                <AvatarImage source={{ uri: avatarUri }} />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={44}
                  color="#777777"
                />
              )}
            </AvatarBtn>

            <SusInput
              ref={susRef}
              value={sus}
              onChangeText={(v) => {
                const limpo = v.replace(/\D/g, "").slice(0, SUS_TAMANHO);
                setSus(limpo);
              }}
              keyboardType="numeric"
              placeholder="Digite o número do SUS"
              placeholderTextColor={theme.colors.surface}
              selectTextOnFocus={false}
              onPressIn={handleSusPressIn}
              maxLength={SUS_TAMANHO}
            />
          </SusRow>

          <FormLock
            pointerEvents={susLiberado ? "auto" : "none"}
            style={{ opacity: susLiberado ? 1 : 0.45 }}
          >
            {/* 1º Nome */}
            <Label>Nome</Label>
            <InputLine
              value={nome}
              onChangeText={setNome}
              editable={susLiberado}
            />

            {/* 2º Email */}
            <Label>Email</Label>
            <InputLine
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              editable={susLiberado}
            />

            {/* 3º CPF e RG */}
            <Row2>
              <Col>
                <Label>CPF</Label>
                <InputLine
                  value={cpf}
                  onChangeText={(v) =>
                    setCpf(v.replace(/\D/g, "").slice(0, 11))
                  }
                  keyboardType="numeric"
                  editable={susLiberado}
                />
              </Col>

              <Col>
                <Label>RG</Label>
                <InputLine
                  value={rg}
                  onChangeText={(v) => setRg(v.replace(/\D/g, "").slice(0, 14))}
                  keyboardType="numeric"
                  editable={susLiberado}
                />
              </Col>
            </Row2>

            {/* 4º Fotos CPF/RG/CNH (FRENTE + VERSO) */}
            <SectionHint>Foto do CPF, RG ou CNH (Frente e Verso)</SectionHint>
            <PhotoActionsRow>
              <PhotoActionBtn
                onPress={handleCameraCpfRg}
                activeOpacity={0.9}
                disabled={disableActions}
                style={{ opacity: disableActions ? 0.6 : 1 }}
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={theme.colors.surface}
                />
                <PhotoActionText>TIRAR FOTO</PhotoActionText>
              </PhotoActionBtn>

              <PhotoActionBtn
                onPress={handleGaleriaCpfRg}
                activeOpacity={0.9}
                disabled={disableActions}
                style={{ opacity: disableActions ? 0.6 : 1 }}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={theme.colors.surface}
                />
                <PhotoActionText>GALERIA</PhotoActionText>
              </PhotoActionBtn>
            </PhotoActionsRow>

            {/* 5º Telefone */}
            <Label>Telefone</Label>
            <InputLine
              value={telefone}
              onChangeText={(v) =>
                setTelefone(v.replace(/\D/g, "").slice(0, 11))
              }
              keyboardType="phone-pad"
              editable={susLiberado}
            />

            {/* 6º Endereço */}
            <Label>Endereço</Label>
            <InputLine
              value={endereco}
              onChangeText={setEndereco}
              editable={susLiberado}
            />

            {/* 7º Título */}
            <Label>Título de Eleitor</Label>
            <InputLine
              value={tituloEleitor}
              onChangeText={(v) =>
                setTituloEleitor(v.replace(/\D/g, "").slice(0, 12))
              }
              keyboardType="numeric"
              editable={susLiberado}
            />

            {/* 8º Fotos Título (FRENTE + VERSO) */}
            <SectionHint>
              Fotos do Título de Eleitor (Frente e Verso)
            </SectionHint>
            <PhotoActionsRow>
              <PhotoActionBtn
                onPress={handleCameraTitulo}
                activeOpacity={0.9}
                disabled={disableActions}
                style={{ opacity: disableActions ? 0.6 : 1 }}
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={theme.colors.surface}
                />
                <PhotoActionText>TIRAR FOTO</PhotoActionText>
              </PhotoActionBtn>

              <PhotoActionBtn
                onPress={handleGaleriaTitulo}
                activeOpacity={0.9}
                disabled={disableActions}
                style={{ opacity: disableActions ? 0.6 : 1 }}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={theme.colors.surface}
                />
                <PhotoActionText>GALERIA</PhotoActionText>
              </PhotoActionBtn>
            </PhotoActionsRow>

            {/* 9º Senha */}
            <Label>Senha</Label>
            <PasswordRow>
              <PasswordInput
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
                autoCapitalize="none"
                editable={susLiberado}
              />
              <EyeBtn
                onPress={() => setShowSenha((s) => !s)}
                activeOpacity={0.9}
                disabled={!susLiberado || isSubmitting}
                style={{ opacity: !susLiberado || isSubmitting ? 0.6 : 1 }}
              >
                <Ionicons
                  name={showSenha ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="black"
                />
              </EyeBtn>
            </PasswordRow>

            {/* 10º Confirmar senha */}
            <Label>Confirmar senha</Label>
            <PasswordRow>
              <PasswordInput
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!showConfirmarSenha}
                autoCapitalize="none"
                editable={susLiberado}
              />
              <EyeBtn
                onPress={() => setShowConfirmarSenha((s) => !s)}
                activeOpacity={0.9}
                disabled={!susLiberado || isSubmitting}
                style={{ opacity: !susLiberado || isSubmitting ? 0.6 : 1 }}
              >
                <Ionicons
                  name={showConfirmarSenha ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="black"
                />
              </EyeBtn>
            </PasswordRow>

            <SubmitArea>
              <SubmitBtn
                onPress={handleCadastrar}
                activeOpacity={0.9}
                disabled={!susLiberado || isSubmitting}
                style={{ opacity: !susLiberado || isSubmitting ? 0.5 : 1 }}
              >
                <SubmitText>
                  {isSubmitting ? "SALVANDO..." : "CADASTRAR"}
                </SubmitText>
              </SubmitBtn>
            </SubmitArea>
          </FormLock>
        </Form>
      </ScrollView>
    </Container>
  );
}
