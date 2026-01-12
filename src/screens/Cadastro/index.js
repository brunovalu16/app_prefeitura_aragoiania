import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "styled-components/native";
import { Images } from "../../assets/images";

import {
  Container,
  EyeBtn,
  Form,
  InputLine,
  Label,
  LogoArea,
  LogoImage,
  PasswordInput,
  PasswordRow,
  PhotoBox,
  PhotoRow,
  SendPhoto,
  SendPhotoText,
  SubmitArea,
  SubmitBtn,
  SubmitText,
  TopBack,
} from "./styles";

export default function Cadastro({ navigation }) {
  const theme = useTheme();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [tituloEleitor, setTituloEleitor] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  function handleEnviarFoto() {
    // placeholder
  }

  function handleCadastrar() {
    // opcional: validação simples
    // if (senha.length < 6) return Alert.alert("Senha", "Sua senha deve ter pelo menos 6 caracteres.");
    // if (senha !== confirmarSenha) return Alert.alert("Senha", "As senhas não conferem.");

    navigation.navigate("Login");
  }

  return (
  <Container>
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TopBack onPress={() => navigation.goBack()} activeOpacity={0.9}>
        <Ionicons name="arrow-back-circle-outline" size={35} color="#fff" />
      </TopBack>

      <LogoArea>
        <LogoImage source={Images.logo_branca_aragoiania} />
      </LogoArea>

      <PhotoRow>
        <PhotoBox>
          <Ionicons
            name="person-outline"
            size={30}
            color={theme.colors.purple}
          />
        </PhotoBox>

        <SendPhoto onPress={handleEnviarFoto} activeOpacity={0.9}>
          <SendPhotoText>ENVIAR FOTO</SendPhotoText>
        </SendPhoto>
      </PhotoRow>

      <Form>
        <Label>Nome</Label>
        <InputLine value={nome} onChangeText={setNome} />

        <Label>Email</Label>
        <InputLine
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Label>CPF</Label>
        <InputLine
          value={cpf}
          onChangeText={(v) =>
            setCpf(v.replace(/\D/g, "").slice(0, 11))
          }
          keyboardType="numeric"
        />

        <Label>Telefone</Label>
        <InputLine
          value={telefone}
          onChangeText={(v) =>
            setTelefone(v.replace(/\D/g, "").slice(0, 11))
          }
          keyboardType="phone-pad"
        />

        <Label>Endereço</Label>
        <InputLine value={endereco} onChangeText={setEndereco} />

        <Label>Título de Eleitor</Label>
        <InputLine
          value={tituloEleitor}
          onChangeText={(v) =>
            setTituloEleitor(v.replace(/\D/g, "").slice(0, 12))
          }
          keyboardType="numeric"
        />

        <Label>Criar senha</Label>
        <PasswordRow>
          <PasswordInput
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showSenha}
            autoCapitalize="none"
          />
          <EyeBtn onPress={() => setShowSenha((s) => !s)} activeOpacity={0.9}>
            <Ionicons
              name={showSenha ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="rgba(255,255,255,0.9)"
            />
          </EyeBtn>
        </PasswordRow>

        <Label>Confirmar senha</Label>
        <PasswordRow>
          <PasswordInput
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!showConfirmarSenha}
            autoCapitalize="none"
          />
          <EyeBtn
            onPress={() => setShowConfirmarSenha((s) => !s)}
            activeOpacity={0.9}
          >
            <Ionicons
              name={
                showConfirmarSenha
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={18}
              color="rgba(255,255,255,0.9)"
            />
          </EyeBtn>
        </PasswordRow>
      </Form>

      <SubmitArea>
        <SubmitBtn onPress={handleCadastrar} activeOpacity={0.9}>
          <SubmitText>CADASTRAR</SubmitText>
        </SubmitBtn>
      </SubmitArea>
    </ScrollView>
  </Container>
);
}
