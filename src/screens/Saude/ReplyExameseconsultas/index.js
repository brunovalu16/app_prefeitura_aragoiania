import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";

import { getAuth } from "firebase/auth";
import {
  subscribeRequestById,
  updateRequestStatus,
} from "../../../services/requests";

import { getAdminScopeByEmail } from "../../../services/adminScope"; // ✅ ADD
import { getAuthUserId } from "../../../services/userId"; // ✅ ADD (fallback)

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

    if (k && v) map[k] = v;
  }

  return {
    medico: map["médico"] || map["medico"] || "",
    clinica: map["clínica"] || map["clinica"] || "",
    exame: map["exame"] || "",
    procedimento: map["procedimento"] || "",
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

  const [statusDraft, setStatusDraft] = useState(null);

  // =========================================================================

  const [parecerOpen, setParecerOpen] = useState(false);
  const [parecerDraft, setParecerDraft] = useState(null); // analise|pendente|recusado|liberado|concluido
  const [justificativaDraft, setJustificativaDraft] = useState("");

  const parecerOptions = useMemo(
    () => [
      { value: "analise", label: "ANÁLISE", color: "#ebb105" },
      { value: "pendente", label: "PENDENTE", color: "#EB5757" },
      { value: "recusado", label: "RECUSADO", color: "#B00020" },
      { value: "liberado", label: "LIBERADO", color: "#27AE60" },
      { value: "concluido", label: "CONCLUÍDO" },
    ],
    [],
  );

  // ✅ auth/admin (agora suporta adminsaude@..., adminiluminacao@..., etc)
  const auth = getAuth();
  const userEmail = (auth.currentUser?.email || "").toLowerCase();
  const adminScope = getAdminScopeByEmail(userEmail);
  const isAdmin = !!adminScope;

  // ✅ (RECOMENDADO) garante que só admin de SAÚDE edite essa tela
  const canEditThisArea = useMemo(() => {
    const areaIds = adminScope?.areaIds || [];
    return areaIds.includes("saude"); // se seu id for outro, ajusta aqui
  }, [adminScope]);

  const canAdminEdit = isAdmin && canEditThisArea;

  useEffect(() => {
    if (!data) return;

    setParecerDraft(String(data?.parecer || "analise").toLowerCase());
    setJustificativaDraft(String(data?.justificativa || ""));
  }, [data]);

  const transporteData = data?.transporteData || null;

  const parecerInfo = useMemo(() => {
    const v = String(parecerDraft || data?.parecer || "analise").toLowerCase();
    return (
      parecerOptions.find((o) => o.value === v) || {
        value: v,
        label: v.toUpperCase(),
        color: theme.colors.textSecondary,
      }
    );
  }, [parecerDraft, data?.parecer, parecerOptions, theme.colors.textSecondary]);

  const bolinhaColor = parecerInfo.color;

  // =========================================================================

  const statusOptions = parecerOptions; // status = parecer
  const [saving, setSaving] = useState(false);

  const hasChanges = !!(
    canAdminEdit &&
    ((statusDraft &&
      statusDraft !== String(data?.status || "").toLowerCase()) ||
      (parecerDraft &&
        parecerDraft !== String(data?.parecer || "analise").toLowerCase()) ||
      String(justificativaDraft || "") !== String(data?.justificativa || ""))
  );

  useEffect(() => {
    // status acompanha parecer, exceto "concluido"
    if (!parecerDraft) return;

    const p = String(parecerDraft).toLowerCase();
    if (p === "concluido") return;

    setStatusDraft(p);
  }, [parecerDraft]);

  async function handleSaveAll() {
    try {
      if (!requestId) return;

      if (!canAdminEdit) {
        return Alert.alert(
          "Acesso negado",
          "Somente o admin responsável pela área de SAÚDE pode salvar aqui.",
        );
      }

      setSaving(true);

      const parecerLower = String(parecerDraft || "").toLowerCase();
      const isConcluido = parecerLower === "concluido";

      const userId = auth.currentUser?.uid || (await getAuthUserId());

      await updateRequestStatus({
        requestId,
        userId,

        parecer: parecerLower,
        justificativa: justificativaDraft,

        // só atualiza status quando NÃO for "concluido"
        status: isConcluido
          ? null
          : String(statusDraft || "analise").toLowerCase(),

        // concluiu = some do app
        isHidden: isConcluido,
      });

      Alert.alert("Sucesso", "Alterações salvas!");
    } catch (e) {
      console.log("❌ Erro ao salvar:", e);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

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

  const medicoAgendado = saudeData?.medicoAgendado || "";
  const dataAgendada = saudeData?.dataAgendada || "";
  const horaAgendada = saudeData?.horaAgendada || "";

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
    const current = String(
      statusDraft || data?.status || "analise",
    ).toLowerCase();

    return (
      statusOptions.find((o) => o.value === current) || {
        value: current,
        label: current.toUpperCase(),
        color: theme.colors.textSecondary,
      }
    );
  }, [statusDraft, data?.status, statusOptions, theme.colors.textSecondary]);

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
                        maxWidth: 180,
                        minWidth: 120,
                        flexShrink: 0,
                      }}
                    >
                      <SelectedPillText
                        numberOfLines={1}
                        style={{ color: draftInfo.color }}
                      >
                        {draftInfo.label}
                      </SelectedPillText>
                    </SelectedPill>
                  </View>
                </OptionRow>

                <DividerSpace />

                {/* MÉDICO */}
                <OptionRow activeOpacity={1}>
                  <OptionLeft>
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 99,
                        backgroundColor: bolinhaColor,
                      }}
                    />
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
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 99,
                        backgroundColor: bolinhaColor,
                      }}
                    />
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
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 99,
                        backgroundColor: bolinhaColor,
                      }}
                    />
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
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 99,
                        backgroundColor: bolinhaColor,
                      }}
                    />
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

                {transporteData ? (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "900",
                        color: theme.colors.purple,
                        marginBottom: 8,
                      }}
                    >
                      Transporte vinculado
                    </Text>

                    <View
                      style={{
                        borderWidth: 2,
                        borderColor: theme.colors.purple,
                        borderRadius: 14,
                        backgroundColor:
                          theme.colors.card || theme.colors.background,
                        padding: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          Veículo selecionado
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={theme.colors.purple}
                          />
                          <Text
                            style={{
                              color: theme.colors.textSecondary,
                              fontSize: 12,
                              fontWeight: "700",
                            }}
                          >
                            Confirmado
                          </Text>
                        </View>
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: theme.colors.purple,
                          fontSize: 16,
                          fontWeight: "900",
                          marginBottom: 8,
                        }}
                      >
                        {transporteData?.provider?.veiculo ||
                          transporteData?.provider?.nome ||
                          "—"}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={theme.colors.purple}
                        />
                        <Ionicons
                          name="car-outline"
                          size={18}
                          color={theme.colors.purple}
                        />
                      </View>

                      <View
                        style={{
                          height: 1,
                          backgroundColor: theme.colors.border,
                          marginVertical: 10,
                        }}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <View style={{ marginTop: 6 }}>
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                            }}
                          >
                            Motorista:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteData?.provider?.motorista || "—"}
                            </Text>
                          </Text>

                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Placa:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteData?.provider?.placa || "—"}
                            </Text>
                          </Text>

                          {/* ✅ AGORA SIM, EM BAIXO */}
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Horário:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteData?.schedule?.selectedTime || "—"}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}

                <DividerSpace />

                {/* ADMIN: parecer + justificativa */}
                {canAdminEdit ? (
                  <View style={{ marginTop: 12 }}>
                    <OptionRow
                      activeOpacity={0.85}
                      onPress={() => setParecerOpen((v) => !v)}
                    >
                      <OptionLeft>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={18}
                          color={parecerInfo.color}
                        />
                        <OptionText>Parecer</OptionText>
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
                            backgroundColor: parecerInfo.color + "22",
                            borderWidth: 1,
                            borderColor: parecerInfo.color,
                            maxWidth: 180,
                            minWidth: 120,
                            flexShrink: 0,
                          }}
                        >
                          <SelectedPillText
                            numberOfLines={1}
                            style={{ color: parecerInfo.color }}
                          >
                            {parecerInfo.label}
                          </SelectedPillText>
                        </SelectedPill>

                        <Ionicons
                          name={parecerOpen ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.colors.cinza}
                        />
                      </View>
                    </OptionRow>

                    {parecerOpen ? (
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
                        {parecerOptions.map((opt) => {
                          const selected =
                            String(parecerDraft || "").toLowerCase() ===
                            opt.value;

                          const optColor =
                            opt.color || theme.colors.textSecondary;

                          return (
                            <TouchableOpacity
                              key={opt.value}
                              activeOpacity={0.85}
                              onPress={() => setParecerDraft(opt.value)}
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
                                }}
                              >
                                <View
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 99,
                                    backgroundColor: opt.color
                                      ? opt.color
                                      : "transparent",
                                    borderWidth: opt.color ? 0 : 1,
                                    borderColor: theme.colors.border,
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
                                  selected
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                                }
                                size={20}
                                color={
                                  selected
                                    ? optColor
                                    : theme.colors.textSecondary
                                }
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}

                    <View style={{ marginTop: 12 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "900",
                          color: theme.colors.text,
                          marginBottom: 8,
                        }}
                      >
                        Justificativa
                      </Text>

                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          borderRadius: 12,
                          backgroundColor: theme.colors.background,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                        }}
                      >
                        <TextInput
                          value={justificativaDraft}
                          onChangeText={setJustificativaDraft}
                          placeholder="Digite o motivo / orientação para o usuário..."
                          placeholderTextColor={theme.colors.textSecondary}
                          multiline
                          style={{
                            minHeight: 80,
                            color: theme.colors.text,
                            fontWeight: "700",
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* USER: justificativa */}
                {!canAdminEdit && (data?.justificativa || "").trim() ? (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "900",
                        color: theme.colors.text,
                        marginBottom: 8,
                      }}
                    >
                      Justificativa da Prefeitura
                    </Text>

                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 12,
                        backgroundColor: theme.colors.background,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                      }}
                    >
                      <Text
                        style={{ color: theme.colors.text, fontWeight: "700" }}
                      >
                        {String(data?.justificativa || "")}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <DividerSpace />

                {canAdminEdit ? (
                  <>
                    <DividerSpace />
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

            {/* BOTÃO SALVAR */}
            {canAdminEdit ? (
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
