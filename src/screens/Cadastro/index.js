import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Alert, Modal, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";
import { Images } from "../../assets/images";
import {
  AlertBody,
  AlertCard,
  AlertFooter,
  AlertHeader,
  AlertHeaderRow,
  AlertMessage,
  AlertOkBtn,
  AlertOkText,
  AlertOverlay,
  AlertTitle,
  Col,
  Container,
  EyeBtn,
  Form,
  FormLock,
  InputBox,
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
  TopBack,
} from "./styles";

export default function Cadastro({ navigation }) {
  const theme = useTheme();

  const [isPicking, setIsPicking] = useState(false);

  // ✅ Fotos (URIs)
  const [fotoCpfFrente, setFotoCpfFrente] = useState(null);
  const [fotoCpfVerso, setFotoCpfVerso] = useState(null);

  const [fotoTitulo1, setFotoTitulo1] = useState(null); // frente
  const [fotoTitulo2, setFotoTitulo2] = useState(null); // verso

  // ✅ Popup custom
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  // 0º SUS (5 dígitos)
  const [sus, setSus] = useState("");
  const [susBloqueado, setSusBloqueado] = useState(false);

  const SUS_PADRAO_LIBERADO = "00000";
  const SUS_TAMANHO = 5;

  // ✅ Libera o formulário só quando SUS tiver 5 dígitos e bater com o padrão
  const susLiberado =
    sus.length === SUS_TAMANHO &&
    !susBloqueado &&
    sus === SUS_PADRAO_LIBERADO;

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

  // ✅ Popup
  function showPopup(title, message) {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  }
  function closePopup() {
    setPopupVisible(false);
  }

  // ✅ Validação SUS: só valida quando tiver 5 dígitos
  function validarSusOuBloquear(susValue) {
    const susLimpo = (susValue || "").replace(/\D/g, "");

    if (susLimpo.length < SUS_TAMANHO) {
      setSusBloqueado(false);
      return;
    }

    const permitido = susLimpo === SUS_PADRAO_LIBERADO;

    if (!permitido) {
      setSusBloqueado(true);
      showPopup(
        "Acesso bloqueado",
        "Usuário não tem permissão para acessar o SUS na região de Aragoiania."
      );
    } else {
      setSusBloqueado(false);
    }
  }

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

  // ✅ Helper: pega FRENTE e depois VERSO (câmera ou galeria)
async function pegarFrenteVerso({ source, setFrente, setVerso }) {
  if (!susLiberado) return;
  if (isPicking) return;

  setIsPicking(true);

  try {
    const ok =
      source === "camera"
        ? await pedirPermissoesCamera()
        : await pedirPermissoesGaleria();

    if (!ok) return;

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
            allowsEditing: false, // ✅ igual câmera (recomendado)
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
            allowsEditing: false, // ✅ igual câmera (recomendado)
          });

    if (resultVerso.canceled) {
      // ✅ cancelou o verso → desfaz a frente também
      setFrente(null);
      setVerso(null);
      return;
    }

    const uriVerso = resultVerso.assets?.[0]?.uri || null;
    setVerso(uriVerso);
  } catch (e) {
    Alert.alert("Erro", "Não foi possível selecionar as fotos.");
    setFrente(null);
    setVerso(null);
  } finally {
    setIsPicking(false);
  }
}


  // ✅ CPF/RG/CNH (frente/verso)
function handleCameraCpfRg() {
  if (isPicking) return;
  pegarFrenteVerso({ source: "camera", setFrente: setFotoCpfFrente, setVerso: setFotoCpfVerso });
}

function handleGaleriaCpfRg() {
  if (isPicking) return;
  pegarFrenteVerso({ source: "gallery", setFrente: setFotoCpfFrente, setVerso: setFotoCpfVerso });
}

function handleCameraTitulo() {
  if (isPicking) return;
  pegarFrenteVerso({ source: "camera", setFrente: setFotoTitulo1, setVerso: setFotoTitulo2 });
}

function handleGaleriaTitulo() {
  if (isPicking) return;
  pegarFrenteVerso({ source: "gallery", setFrente: setFotoTitulo1, setVerso: setFotoTitulo2 });
}


  // ✅ Cadastrar
  function handleCadastrar() {
    if (!susLiberado) {
      Alert.alert("SUS", `Digite o SUS correto (${SUS_PADRAO_LIBERADO}) para liberar.`);
      return;
    }

    if (!nome) return Alert.alert("Campo obrigatório", "Informe seu nome completo.");
    if (!email) return Alert.alert("Campo obrigatório", "Informe seu email.");
    if (!cpf || !rg) return Alert.alert("Documento", "Informe CPF e RG.");
    if (!telefone) return Alert.alert("Contato", "Informe um telefone válido.");
    if (!endereco) return Alert.alert("Endereço", "Informe seu endereço.");
    if (!tituloEleitor) return Alert.alert("Título de eleitor", "Informe o título de eleitor.");

    // ✅ Agora CPF/RG/CNH exige FRENTE + VERSO
    if (!fotoCpfFrente || !fotoCpfVerso) {
      return Alert.alert(
        "Documento obrigatório",
        "Envie as duas fotos (frente e verso) do CPF, RG ou CNH."
      );
    }

    // ✅ Título exige FRENTE + VERSO
    if (!fotoTitulo1 || !fotoTitulo2) {
      return Alert.alert(
        "Documento obrigatório",
        "Envie as duas fotos (frente e verso) do Título de Eleitor."
      );
    }

    if (senha.length < 6) {
      return Alert.alert("Senha inválida", "A senha deve conter no mínimo 6 caracteres.");
    }

    if (senha !== confirmarSenha) {
      return Alert.alert("Senha", "As senhas não conferem.");
    }

    navigation.navigate("Login");
  }

  return (
    <Container>
      <Modal
        visible={popupVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePopup}
      >
        <AlertOverlay activeOpacity={1} onPress={closePopup}>
          <AlertCard activeOpacity={1} onPress={() => {}}>
            <AlertHeader>
              <AlertHeaderRow>
                <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                <AlertTitle>{popupTitle}</AlertTitle>
              </AlertHeaderRow>
            </AlertHeader>

            <AlertBody>
              <AlertMessage>{popupMessage}</AlertMessage>
            </AlertBody>

            <AlertFooter>
              <AlertOkBtn onPress={closePopup} activeOpacity={0.9}>
                <AlertOkText>OK</AlertOkText>
              </AlertOkBtn>
            </AlertFooter>
          </AlertCard>
        </AlertOverlay>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <TopBack onPress={() => navigation.goBack()} activeOpacity={0.9}>
          <Ionicons name="arrow-back-circle-outline" size={35} color="#777777" />
        </TopBack>

        <LogoArea>
          <LogoImage source={Images.logo_colorida_aragoiania} />
        </LogoArea>

        <Form>
          {/* 0º SUS */}
          <Label>Número do SUS</Label>
          <InputBox
            ref={susRef}
            value={sus}
            onChangeText={(v) => {
              const limpo = v.replace(/\D/g, "").slice(0, SUS_TAMANHO);
              setSus(limpo);

              if (limpo.length === SUS_TAMANHO) {
                validarSusOuBloquear(limpo);
              } else {
                setSusBloqueado(false);
              }
            }}
            onBlur={() => validarSusOuBloquear(sus)}
            keyboardType="numeric"
            placeholder="Digite o número do SUS"
            placeholderTextColor={theme.colors.surface}
            selectTextOnFocus={false}
            onPressIn={handleSusPressIn}
            maxLength={SUS_TAMANHO}
          />

          {!susLiberado && (
            <SectionHint style={{ marginTop: 10 }}>
              Digite o número do SUS para liberar o cadastro:
            </SectionHint>
          )}

          <FormLock
            pointerEvents={susLiberado ? "auto" : "none"}
            style={{ opacity: susLiberado ? 1 : 0.45 }}
          >
            {/* 1º Nome */}
            <Label>Nome</Label>
            <InputLine value={nome} onChangeText={setNome} editable={susLiberado} />

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
                  onChangeText={(v) => setCpf(v.replace(/\D/g, "").slice(0, 11))}
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
                disabled={!susLiberado || isPicking}
                style={{ opacity: !susLiberado || isPicking ? 0.6 : 1 }}
              >
                <Ionicons name="camera-outline" size={18} color={theme.colors.surface} />
                <PhotoActionText>TIRAR FOTO</PhotoActionText>
              </PhotoActionBtn>

              <PhotoActionBtn
                onPress={handleGaleriaCpfRg}
                activeOpacity={0.9}
                disabled={!susLiberado || isPicking}
                style={{ opacity: !susLiberado || isPicking ? 0.6 : 1 }}
              >
                <Ionicons name="image-outline" size={18} color={theme.colors.surface} />
                <PhotoActionText>GALERIA</PhotoActionText>
              </PhotoActionBtn>
            </PhotoActionsRow>

            {/* 5º Telefone */}
            <Label>Telefone</Label>
            <InputLine
              value={telefone}
              onChangeText={(v) => setTelefone(v.replace(/\D/g, "").slice(0, 11))}
              keyboardType="phone-pad"
              editable={susLiberado}
            />

            {/* 6º Endereço */}
            <Label>Endereço</Label>
            <InputLine value={endereco} onChangeText={setEndereco} editable={susLiberado} />

            {/* 7º Título */}
            <Label>Título de Eleitor</Label>
            <InputLine
              value={tituloEleitor}
              onChangeText={(v) => setTituloEleitor(v.replace(/\D/g, "").slice(0, 12))}
              keyboardType="numeric"
              editable={susLiberado}
            />

            {/* 8º Fotos Título (FRENTE + VERSO) */}
            <SectionHint>Fotos do Título de Eleitor (Frente e Verso)</SectionHint>
            <PhotoActionsRow>
              <PhotoActionBtn
                onPress={handleCameraTitulo}
                activeOpacity={0.9}
                disabled={!susLiberado || isPicking}
                style={{ opacity: !susLiberado || isPicking ? 0.6 : 1 }}
              >
                <Ionicons name="camera-outline" size={18} color={theme.colors.surface} />
                <PhotoActionText>TIRAR FOTO</PhotoActionText>
              </PhotoActionBtn>

              <PhotoActionBtn
                onPress={handleGaleriaTitulo}
                activeOpacity={0.9}
                disabled={!susLiberado || isPicking}
                style={{ opacity: !susLiberado || isPicking ? 0.6 : 1 }}
              >
                <Ionicons name="image-outline" size={18} color={theme.colors.surface} />
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
                disabled={!susLiberado}
                style={{ opacity: !susLiberado ? 0.6 : 1 }}
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
                disabled={!susLiberado}
                style={{ opacity: !susLiberado ? 0.6 : 1 }}
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
                disabled={!susLiberado}
                style={{ opacity: !susLiberado ? 0.5 : 1 }}
              >
                <SubmitText>CADASTRAR</SubmitText>
              </SubmitBtn>
            </SubmitArea>
          </FormLock>
        </Form>
      </ScrollView>
    </Container>
  );
}
