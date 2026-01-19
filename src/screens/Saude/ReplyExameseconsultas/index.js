import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTheme } from "styled-components/native";

import { getAuth } from "firebase/auth";
import { subscribeRequestById } from "../../../services/requests";

import {
  BackBtn,
  Body,
  Card,
  Container,
  DividerSpace,
  Header,
  HeaderContent,
  HeaderTitle,
  OptionLeft,
  OptionRow,
  OptionText,
  SectionTitle,
  SelectedPill,
  SelectedPillText,
} from "./styles";

function parseDescricao(descricaoRaw) {
  const map = {};
  const lines = (descricaoRaw || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const k = line.slice(0, idx).trim().toLowerCase();
    const v = line.slice(idx + 1).trim();

    // guarda o ÚLTIMO valor (se repetiu “Médico:” duas vezes, fica o último)
    if (k && v) map[k] = v;
  }

  return {
    medico: map["médico"] || map["medico"] || "",
    clinica: map["clínica"] || map["clinica"] || "",
    exame: map["exame"] || "",
    procedimento: map["procedimento"] || "",
    transporte:
      map["agendamento de transporte"] ||
      map["agendamento de transporte "] ||
      "",
    data: map["data"] || "",
    horario: map["horário"] || map["horario"] || "",
    lines,
  };
}

export default function ReplyExameseconsultas({ navigation, route }) {
  const theme = useTheme();
  const { requestId } = route?.params || {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const isAdmin =
    (auth.currentUser?.email || "").toLowerCase() ===
    "brunovalu16@gmail.com".toLowerCase();

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = subscribeRequestById({
      requestId,
      onChange: (doc) => {
        setData(doc || null);
        setLoading(false);
      },
    });

    return () => unsub?.();
  }, [requestId]);

  const descricao = useMemo(
    () => (data?.descricao || "").trim(),
    [data?.descricao],
  );
  const parsed = useMemo(() => parseDescricao(descricao), [descricao]);

  const saudeData = data?.saudeData || null;

  // ✅ agendamento estruturado
  const medicoAgendado = saudeData?.medicoAgendado || "";
  const dataAgendada = saudeData?.dataAgendada || "";
  const horaAgendada = saudeData?.horaAgendada || "";

  // ✅ FALLBACKS (saudeData -> descricao)
  const medicoSelecionado = saudeData?.medicoSelecionado || parsed.medico || "";
  const clinicaSelecionada =
    saudeData?.clinicaSelecionada || parsed.clinica || "";
  const exameSelecionado = saudeData?.exameSelecionado || parsed.exame || "";
  const procedimentoSelecionado =
    saudeData?.procedimentoSelecionado || parsed.procedimento || "";

  const transporte = (saudeData?.transporte || parsed.transporte || "").trim();

  const clinicasDisponiveisNoSlot = Array.isArray(
    saudeData?.clinicasDisponiveisNoSlot,
  )
    ? saudeData.clinicasDisponiveisNoSlot
    : [];

  const requestTitle =
    data?.requestTitle || "SOLICITAÇÃO SAÚDE - EXAMES E CONSULTAS";

  const statusLabel = useMemo(() => {
    const s = String(data?.status || "analise").toLowerCase();
    if (s === "analise") return "EM ANÁLISE";
    if (s === "pendente") return "PENDENTE";
    if (s === "execucao") return "EM EXECUÇÃO";
    if (s === "concluida") return "CONCLUÍDA";
    return String(data?.status || "—").toUpperCase();
  }, [data?.status]);

  const medicoLabel = useMemo(() => {
    if (medicoAgendado && dataAgendada && horaAgendada) {
      return `${String(medicoAgendado).split(" (")[0]} • ${dataAgendada} ${horaAgendada}`;
    }

    // se não tem agendamento estruturado, tenta usar data/horário parseados
    if (medicoSelecionado && parsed.data && parsed.horario) {
      return `${String(medicoSelecionado).split(" (")[0]} • ${parsed.data} ${parsed.horario}`;
    }

    if (medicoSelecionado) return String(medicoSelecionado).split(" (")[0];
    return "";
  }, [
    medicoAgendado,
    dataAgendada,
    horaAgendada,
    medicoSelecionado,
    parsed.data,
    parsed.horario,
  ]);

  return (
    <Container>
      {/* ✅ HEADER bonito */}
      <Header style={{ overflow: "hidden" }}>
        <LinearGradient
          colors={[
            theme.colors.purple,
            theme.colors.purple2 ? theme.colors.purple2 : theme.colors.purple,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <HeaderContent>
            <BackBtn activeOpacity={0.9} onPress={() => navigation.goBack()}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.surface}
              />
            </BackBtn>

            <HeaderTitle numberOfLines={1}>{requestTitle}</HeaderTitle>
          </HeaderContent>
        </LinearGradient>
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <Body>
          <Card>
            <SectionTitle>Resumo da solicitação</SectionTitle>

            {loading ? (
              <View
                style={{
                  paddingVertical: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <ActivityIndicator size="large" />
                <Text style={{ color: theme.colors.textSecondary }}>
                  Carregando solicitação...
                </Text>
              </View>
            ) : !data ? (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  Solicitação não encontrada.
                </Text>
              </View>
            ) : (
              <>
                {/* STATUS */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.cinza}
                    />
                    <OptionText>Status</OptionText>
                  </OptionLeft>

                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {statusLabel}
                    </SelectedPillText>
                  </SelectedPill>
                </OptionRow>

                <DividerSpace />

                {/* MÉDICO */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <Ionicons
                      name="medkit-outline"
                      size={18}
                      color={theme.colors.cinza}
                    />
                    <OptionText>Médico</OptionText>
                  </OptionLeft>

                  {medicoLabel ? (
                    <SelectedPill>
                      <SelectedPillText>{medicoLabel}</SelectedPillText>
                    </SelectedPill>
                  ) : (
                    <Text style={{ color: theme.colors.textSecondary }}>—</Text>
                  )}
                </OptionRow>

                {/* CLÍNICA */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color={theme.colors.cinza}
                    />
                    <OptionText>Clínica</OptionText>
                  </OptionLeft>

                  {clinicaSelecionada ? (
                    <SelectedPill>
                      <SelectedPillText numberOfLines={1}>
                        {clinicaSelecionada}
                      </SelectedPillText>
                    </SelectedPill>
                  ) : (
                    <Text style={{ color: theme.colors.textSecondary }}>—</Text>
                  )}
                </OptionRow>

                {/* EXAME */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={theme.colors.cinza}
                    />
                    <OptionText>Exame</OptionText>
                  </OptionLeft>

                  {exameSelecionado ? (
                    <SelectedPill>
                      <SelectedPillText numberOfLines={1}>
                        {exameSelecionado}
                      </SelectedPillText>
                    </SelectedPill>
                  ) : (
                    <Text style={{ color: theme.colors.textSecondary }}>—</Text>
                  )}
                </OptionRow>

                {/* PROCEDIMENTO */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <Ionicons
                      name="fitness-outline"
                      size={18}
                      color={theme.colors.cinza}
                    />
                    <OptionText>Procedimento</OptionText>
                  </OptionLeft>

                  {procedimentoSelecionado ? (
                    <SelectedPill>
                      <SelectedPillText numberOfLines={1}>
                        {procedimentoSelecionado}
                      </SelectedPillText>
                    </SelectedPill>
                  ) : (
                    <Text style={{ color: theme.colors.textSecondary }}>—</Text>
                  )}
                </OptionRow>

                <DividerSpace />

                {/* TRANSPORTE */}
                <View style={{ marginTop: 2 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: theme.colors.text,
                      marginBottom: 8,
                    }}
                  >
                    Agendamento de Transporte
                  </Text>

                  <View
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: theme.colors.background,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: transporte
                          ? theme.colors.text
                          : theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporte ? transporte : "Não informado"}
                    </Text>

                    <Text
                      style={{ color: "red", marginTop: 6, fontWeight: "800" }}
                    >
                      (A prefeitura irá confirmar)
                    </Text>
                  </View>
                </View>

                <DividerSpace />

                {/* DESCRIÇÃO FORMATADA */}

                {isAdmin ? (
                  <>
                    <DividerSpace />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "900",
                        color: theme.colors.text,
                        marginBottom: 10,
                      }}
                    >
                      Clínicas disponíveis no slot (admin)
                    </Text>

                    {!clinicasDisponiveisNoSlot.length ? (
                      <Text style={{ color: theme.colors.textSecondary }}>
                        —
                      </Text>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        {clinicasDisponiveisNoSlot.map((c) => (
                          <View
                            key={c}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 12,
                              backgroundColor: theme.colors.background,
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "900",
                              }}
                            >
                              {c}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                ) : null}
              </>
            )}
          </Card>
        </Body>
      </ScrollView>
    </Container>
  );
}
