import { useMemo, useState } from "react";
import { useTheme } from "styled-components/native";
import AppHeader from "../../components/AppHeader";
import PrimaryButton from "../../components/PrimaryButton";
import { Card, Container, GridRow, HeaderLogo, Input, Label, Mini, SendWrap } from "./styles";

export default function CepPreenchido({ navigation, route }) {
  const theme = useTheme();
  const cep = route?.params?.cep ?? "";

  // mock preenchido (backend depois)
  const mock = useMemo(() => ({
    cep,
    logradouro: "R C193A",
    bairro: "JARDIM AMERICA",
  }), [cep]);

  const [quadra, setQuadra] = useState("44");
  const [lote, setLote] = useState("17");

  return (
    <Container>
      <AppHeader showBack />
      <HeaderLogo>Aragoiânia</HeaderLogo>

      <Card>
        <Label>CEP</Label>
        <Input value={mock.cep} editable={false} />

        <PrimaryButton title="USAR LOCALIZAÇÃO ATUAL" onPress={() => {}} style={{ marginTop: 12 }} />

        <Label>Logradouro</Label>
        <Input value={mock.logradouro} editable={false} />

        <Label>Bairro</Label>
        <Input value={mock.bairro} editable={false} />

        <GridRow>
          <Mini value={quadra} onChangeText={setQuadra} placeholder="Quadra" keyboardType="numeric" />
          <Mini value={lote} onChangeText={setLote} placeholder="Lote" keyboardType="numeric" style={{ marginLeft: 10 }} />
        </GridRow>

        <SendWrap>
          <PrimaryButton
            title="ENVIAR"
            onPress={() => navigation.popToTop()} // volta pro início do Stack (Home)
            style={{ width: 110, marginTop: 12 }}
          />
        </SendWrap>
      </Card>
    </Container>
  );
}
