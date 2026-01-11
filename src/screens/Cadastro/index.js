import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "styled-components/native";
import { Images } from "../../assets/images";
import {
  Container,
  Form,
  InputLine,
  Label,
  LogoArea,
  LogoImage,
  PhotoBox,
  PhotoRow,
  SendPhoto,
  SendPhotoText,
  SubmitArea,
  SubmitBtn,
  SubmitText,
  TopBack
} from "./styles";

export default function Cadastro({ navigation }) {
  const theme = useTheme();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [tituloEleitor, setTituloEleitor] = useState("");

  function handleEnviarFoto() {
    // placeholder: depois você conecta câmera/galeria
  }

 function handleCadastrar() {
  navigation.navigate("Login");
}


  return (
    <Container>
      <TopBack onPress={() => navigation.goBack()} activeOpacity={0.9}>
        <Ionicons name="arrow-back-circle-outline" size={35} color="#fff" />
      </TopBack>

      <LogoArea>
        <LogoImage source={Images.logo_branca_aragoiania} />
      </LogoArea>

      <PhotoRow>
        <PhotoBox>
          <Ionicons name="person-outline" size={30} color={theme.colors.purple} />
        </PhotoBox>

        <SendPhoto onPress={handleEnviarFoto} activeOpacity={0.9}>
          <SendPhotoText>ENVIAR FOTO</SendPhotoText>
        </SendPhoto>
      </PhotoRow>

      <Form>
        <Label>Nome</Label>
        <InputLine value={nome} onChangeText={setNome} />

        <Label>Email</Label>
        <InputLine value={email} onChangeText={setEmail} autoCapitalize="none" />

        <Label>CPF</Label>
        <InputLine
          value={cpf}
          onChangeText={(v) => setCpf(v.replace(/\D/g, "").slice(0, 11))}
          keyboardType="numeric"
        />

        <Label>Telefone</Label>
        <InputLine
          value={telefone}
          onChangeText={(v) => setTelefone(v.replace(/\D/g, "").slice(0, 11))}
          keyboardType="phone-pad"
        />

        <Label>Endereço</Label>
        <InputLine value={endereco} onChangeText={setEndereco} />

        

        <Label>Título de Eleitor</Label>
        <InputLine
          value={tituloEleitor}
          onChangeText={(v) => setTituloEleitor(v.replace(/\D/g, "").slice(0, 12))}
          keyboardType="numeric"
        />
      </Form>

      <SubmitArea>
        <SubmitBtn onPress={handleCadastrar} activeOpacity={0.9}>
          <SubmitText>CADASTRAR</SubmitText>
        </SubmitBtn>
      </SubmitArea>
    </Container>
  );
}
