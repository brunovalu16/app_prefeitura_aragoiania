import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";

import { getAuth } from "firebase/auth";
import {
  subscribeRequestById,
  updateRequestStatus,
} from "../../../services/requests";

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

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState(null);

  const statusOptions = useMemo(
    () => [
      { value: "analise", label: "EM ANÁLISE", color: "#ebb105" },
      { value: "pendente", label: "PENDENTE", color: "#EB5757" },
      { value: "execucao", label: "AGUARDANDO", color: "#27AE60" },
      { value: "concluida", label: "CONCLUÍDA", color: "#2D9CDB" },
    ],
    [],
  );

  const [saving, setSaving] = useState(false);

  const auth = getAuth();
  const isAdmin =
    (auth.currentUser?.email || "").toLowerCase() ===
    "brunovalu16@gmail.com".toLowerCase();

  const currentStatus = String(data?.status || "analise").toLowerCase();
  const hasChanges = !!(
    isAdmin &&
    statusDraft &&
    statusDraft !== currentStatus
  );

  async function handleSaveAll() {
    try {
      if (!requestId) return;
      if (!isAdmin) return;

      setSaving(true);

      // ✅ aqui você coloca tudo que quiser salvar no futuro (notes, etc.)
      await updateRequestStatus({
        requestId,
        status: statusDraft,
        userId: auth.currentUser?.uid,
        // notes: { ... } // quando você adicionar
      });

      setStatusOpen(false);
    } catch (e) {
      console.log("❌ Erro ao salvar:", e);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  // quando carregar do banco, sincroniza o draft
  useEffect(() => {
    if (!data?.status) return;
    setStatusDraft(String(data.status).toLowerCase());
  }, [data?.status]);

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

  const clinicasDisponiveisNoSlot = Array.isArray(
    saudeData?.clinicasDisponiveisNoSlot,
  )
    ? saudeData.clinicasDisponiveisNoSlot
    : [];

  const requestTitle =
    data?.requestTitle || "SOLICITAÇÃO SAÚDE - EXAMES E CONSULTAS";

  const statusInfo = useMemo(() => {
    const current = String(data?.status || "analise").toLowerCase();
    return (
      statusOptions.find((o) => o.value === current) || {
        value: current,
        label: String(data?.status || "—").toUpperCase(),
        color: "#828282",
      }
    );
  }, [data?.status, statusOptions]);

  const draftInfo = useMemo(() => {
    const v = String(
      statusDraft || statusInfo.value || "analise",
    ).toLowerCase();
    return statusOptions.find((o) => o.value === v) || statusInfo;
  }, [statusDraft, statusInfo, statusOptions]);

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
                <OptionRow
                  activeOpacity={isAdmin ? 0.85 : 1}
                  onPress={() => {
                    if (!isAdmin) return;
                    setStatusOpen((v) => !v);
                  }}
                >
                  <OptionLeft>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={draftInfo.color}
                    />
                    <OptionText>Status</OptionText>
                  </OptionLeft>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <SelectedPill
                      style={{
                        backgroundColor: draftInfo.color + "22",
                        borderWidth: 1,
                        borderColor: draftInfo.color,

                        // ✅ deixa caber "PENDENTE", "EM ANÁLISE", "AGUARDANDO" inteiro
                        maxWidth: 180,
                        minWidth: 120,
                        flexShrink: 0, // ✅ não deixa encolher e cortar
                      }}
                    >
                      <SelectedPillText
                        numberOfLines={1}
                        style={{ color: draftInfo.color }}
                      >
                        {draftInfo.label}
                      </SelectedPillText>
                    </SelectedPill>

                    {isAdmin ? (
                      <Ionicons
                        name={statusOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={theme.colors.cinza}
                      />
                    ) : null}
                  </View>
                </OptionRow>

                {/* ✅ ACCORDION (apenas admin) */}
                {isAdmin && statusOpen ? (
                  <View
                    style={{
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 12,
                      backgroundColor: theme.colors.background,
                      overflow: "hidden",
                    }}
                  >
                    {statusOptions.map((opt) => {
                      const selected = statusDraft === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          activeOpacity={0.85}
                          onPress={() => setStatusDraft(opt.value)}
                          style={{
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.border,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              flexShrink: 0,
                            }}
                          >
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 99,
                                backgroundColor: opt.color,
                              }}
                            />
                            <Text
                              style={{
                                color: theme.colors.text,
                                fontWeight: "800",
                              }}
                            >
                              {opt.label}
                            </Text>
                          </View>

                          <Ionicons
                            name={
                              selected ? "checkmark-circle" : "ellipse-outline"
                            }
                            size={20}
                            color={
                              selected ? opt.color : theme.colors.textSecondary
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}

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
                <View style={{ marginTop: 2 }}></View>

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

            {/* ✅ BOTÃO SALVAR (GERAL) */}
            {isAdmin ? (
              <View style={{ padding: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={!hasChanges || saving}
                  onPress={handleSaveAll}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      !hasChanges || saving
                        ? theme.colors.border
                        : theme.colors.purple,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "900" }}>
                      SALVAR ALTERAÇÕES
                    </Text>
                  )}
                </TouchableOpacity>

                {!hasChanges ? (
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Nenhuma alteração pendente.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </Card>
        </Body>
      </ScrollView>
    </Container>
  );
}
