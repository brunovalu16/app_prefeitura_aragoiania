import { useState } from "react";
import { Images } from "../../assets/images";
import PrimaryButton from "../../components/PrimaryButton";
import { Container, InputLine, Label, Link, LinkText, LogoArea, LogoImage, RowLogin, RowLoginText } from "./styles";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <Container>
      <LogoArea source={Images.pessoas}>
        <LogoImage source={Images.logo_colorida_aragoiania} />
      </LogoArea>

      <RowLogin>
        <RowLoginText>Faça o Login | </RowLoginText>
        <Link onPress={() => navigation.navigate("Cadastro")} activeOpacity={0.9}>
          <LinkText>Cadastrar</LinkText>
        </Link>
      </RowLogin>


      <Label>Email</Label>
      <InputLine value={email} onChangeText={setEmail} autoCapitalize="none" />

      <Label style={{ marginTop: 18 }}>Senha</Label>
      <InputLine value={senha} onChangeText={setSenha} secureTextEntry />

      <PrimaryButton
        title="ENTRAR"
        onPress={() => navigation.replace("AppTabs")}
      />
    </Container>
  );
}
