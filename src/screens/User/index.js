import { Ionicons } from "@expo/vector-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

import { db } from "../../services/firebase";

import {
  AvatarBtn,
  AvatarImage,
  Col,
  Container,
  Form,
  Label,
  PhotoActionBtn,
  PhotoActionsRow,
  PhotoActionText,
  Row2,
  SectionHint,
  SusBlock,
  TopRow,
  ValueBox,
  ValueText,
} from "./styles";

export default function User() {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", u.uid);

      const unsubDoc = onSnapshot(
        ref,
        (snap) => {
          setUserDoc(snap.exists() ? snap.data() : null);
          setLoading(false);
        },
        (err) => {
          console.log("❌ USER SNAPSHOT:", err);
          setLoading(false);
        },
      );

      // quando trocar usuário, encerra o listener do doc anterior
      return () => unsubDoc();
    });

    return () => unsubAuth();
  }, []);

  function renderPreview(uri) {
    if (!uri) return null;

    return (
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: 180,
          borderRadius: 12,
          marginTop: 10,
        }}
        resizeMode="cover"
      />
    );
  }

  if (loading) {
    return (
      <Container style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </Container>
    );
  }

  if (!userDoc) {
    return (
      <Container style={{ alignItems: "center", justifyContent: "center" }}>
        <ValueText style={{ color: theme.colors.cinza }}>
          Nenhum usuário encontrado.
        </ValueText>
      </Container>
    );
  }

  // ✅ mapeia o que você salvou no cadastro
  const fotoUsuario = userDoc?.avatarUrl || null;
  const sus = userDoc?.susDigitado || "";
  const nome = userDoc?.nome || "";
  const email = userDoc?.email || "";
  const cpf = userDoc?.cpf || "";
  const rg = userDoc?.rg || "";
  const telefone = userDoc?.telefone || "";
  const endereco = userDoc?.endereco || "";
  const tituloEleitor = userDoc?.tituloEleitor || "";

  const cpfFrente = userDoc?.documentos?.cpfRgCnh?.frente || null;
  const cpfVerso = userDoc?.documentos?.cpfRgCnh?.verso || null;

  const tituloFrente = userDoc?.documentos?.tituloEleitor?.frente || null;
  const tituloVerso = userDoc?.documentos?.tituloEleitor?.verso || null;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Container>
        <Form>
          <TopRow>
            <AvatarBtn activeOpacity={0.9}>
              {fotoUsuario ? (
                <AvatarImage source={{ uri: fotoUsuario }} />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={54}
                  color={theme.colors.cinza}
                />
              )}
            </AvatarBtn>

            <SusBlock>
              <Label>Número do SUS</Label>
              <ValueBox>
                <ValueText>{sus || "-"}</ValueText>
              </ValueBox>
            </SusBlock>
          </TopRow>

          <Label>Nome</Label>
          <ValueBox>
            <ValueText>{nome || "-"}</ValueText>
          </ValueBox>

          <Label>Email</Label>
          <ValueBox>
            <ValueText>{email || "-"}</ValueText>
          </ValueBox>

          <Row2>
            <Col>
              <Label>CPF</Label>
              <ValueBox>
                <ValueText>{cpf || "-"}</ValueText>
              </ValueBox>
            </Col>

            <Col>
              <Label>RG</Label>
              <ValueBox>
                <ValueText>{rg || "-"}</ValueText>
              </ValueBox>
            </Col>
          </Row2>

          <SectionHint>Fotos do CPF / RG / CNH</SectionHint>
          <PhotoActionsRow>
            <PhotoActionBtn disabled style={{ opacity: 0.8 }}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={theme.colors.surface}
              />
              <PhotoActionText>
                {cpfFrente && cpfVerso ? "FRENTE + VERSO OK" : "NÃO ENVIADO"}
              </PhotoActionText>
            </PhotoActionBtn>
          </PhotoActionsRow>

          {renderPreview(cpfFrente)}
          {renderPreview(cpfVerso)}

          <Label>Telefone</Label>
          <ValueBox>
            <ValueText>{telefone || "-"}</ValueText>
          </ValueBox>

          <Label>Endereço</Label>
          <ValueBox>
            <ValueText>{endereco || "-"}</ValueText>
          </ValueBox>

          <Label>Título de Eleitor</Label>
          <ValueBox>
            <ValueText>{tituloEleitor || "-"}</ValueText>
          </ValueBox>

          <SectionHint>Fotos do Título de Eleitor</SectionHint>
          <PhotoActionsRow>
            <PhotoActionBtn disabled style={{ opacity: 0.8 }}>
              <Ionicons
                name="document-outline"
                size={18}
                color={theme.colors.surface}
              />
              <PhotoActionText>
                {tituloFrente ? "FRENTE OK" : "FRENTE NÃO ENVIADA"}
              </PhotoActionText>
            </PhotoActionBtn>

            <PhotoActionBtn disabled style={{ opacity: 0.8 }}>
              <Ionicons
                name="document-outline"
                size={18}
                color={theme.colors.surface}
              />
              <PhotoActionText>
                {tituloVerso ? "VERSO OK" : "VERSO NÃO ENVIADO"}
              </PhotoActionText>
            </PhotoActionBtn>
          </PhotoActionsRow>

          {renderPreview(tituloFrente)}
          {renderPreview(tituloVerso)}
        </Form>
      </Container>
    </ScrollView>
  );
}
