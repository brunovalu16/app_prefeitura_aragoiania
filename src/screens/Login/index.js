import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Images } from "../../assets/images";
import PrimaryButton from "../../components/PrimaryButton";
import {
  Container,
  InputLine,
  Label,
  Link,
  LinkText,
  LogoArea,
  LogoImage,
  RowLogin,
  RowLoginText,
} from "./styles";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const [kbOpen, setKbOpen] = useState(false);
  const [kbH, setKbH] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKbOpen(true);
      setKbH(e?.endCoordinates?.height || 0);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKbOpen(false);
      setKbH(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  async function handleEntrar() {
    const emailTrim = (email || "").trim();

    if (!emailTrim || !senha) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, emailTrim, senha);
      navigation.replace("AppTabs");
    } catch (err) {
      if (err?.code === "auth/network-request-failed") {
        Alert.alert(
          "Sem conexão",
          "Falha de rede ao conectar no Firebase. Verifique sua internet e tente novamente.",
        );
      } else if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password"
      ) {
        Alert.alert("Dados inválidos", "Email ou senha incorretos.");
      } else if (err?.code === "auth/user-not-found") {
        Alert.alert(
          "Conta não encontrada",
          "Não existe usuário com esse email.",
        );
      } else if (err?.code === "auth/invalid-email") {
        Alert.alert("Email inválido", "Digite um email válido.");
      } else {
        Alert.alert(
          "Erro ao entrar",
          "Não foi possível fazer login. Tente novamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const Content = (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <Container $kb={kbOpen} $kbH={kbH}>
          <LogoArea source={Images.pessoas}>
            <LogoImage source={Images.logo_colorida_aragoiania} />
          </LogoArea>

          <RowLogin $kb={kbOpen}>
            <RowLoginText>Faça o Login | </RowLoginText>
            <Link
              onPress={() => navigation.navigate("Cadastro")}
              activeOpacity={0.9}
            >
              <LinkText>Cadastrar</LinkText>
            </Link>
          </RowLogin>

          <Label>Email</Label>
          <InputLine
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Label style={{ marginTop: 18 }}>Senha</Label>
          <InputLine value={senha} onChangeText={setSenha} secureTextEntry />

          <PrimaryButton
            title={loading ? "ENTRANDO..." : "ENTRAR"}
            onPress={handleEntrar}
            disabled={loading}
          />
        </Container>
      </View>
    </TouchableWithoutFeedback>
  );

  // ✅ iOS com KAV / ✅ Android sem KAV (evita o “buraco branco”)
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {Content}
      </KeyboardAvoidingView>
    );
  }

  return Content;
}
