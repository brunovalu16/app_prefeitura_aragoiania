import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase"; // ajuste o caminho se necessário

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
  const raw = String(descricaoRaw || "");

  // 1) Mantém linhas. Se vier tudo em uma linha (casos antigos),
  //    injeta \n antes dos labels conhecidos para ajudar o parse.
  const withLines = raw.includes("\n")
    ? raw
    : raw.replace(
        /\s+(Especialidade|Médico|Medico|Clínica|Clinica|Exame|Procedimento|Data|Horário|Horario|Transporte horário|Transporte horario|Destino transporte|Motivo transporte|Veiculo transporte|Veículo transporte|Motorista transporte|Placa transporte|Transporte)\s*:/gi,
        "\n$1:",
      );

  // 2) Normaliza chave (remove acento + lower)
  const normalizeKey = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // remove acentos

  const map = {};
  const lines = withLines
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 3) Parse linha a linha: "chave: valor"
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const k = normalizeKey(line.slice(0, idx));
    const v = String(line.slice(idx + 1)).trim();

    if (k && v) map[k] = v;
  }

  return {
    especialidade: map["especialidade"] || "",
    medico: map["medico"] || "",
    clinica: map["clinica"] || "",
    exame: map["exame"] || "",
    procedimento: map["procedimento"] || "",
    data: map["data"] || "",
    horario: map["horario"] || "",

    transporte: map["transporte"] || "",
    transporteHorario: map["transporte horario"] || "",
    destinoTransporte: map["destino transporte"] || "",
    motivoTransporte: map["motivo transporte"] || "",
    motoristaTransporte: map["motorista transporte"] || "",
    placaTransporte: map["placa transporte"] || "",
    veiculoTransporte: map["veiculo transporte"] || "",

    lines,
    rawMap: map,
  };
}

function parseTransporteFromDescricao(descricaoRaw) {
  const raw = String(descricaoRaw || "");

  const tipo =
    raw
      .match(/Transporte:\s*([^\n\r]+?)(?=\s+[A-Za-zÀ-ÿ ]+:\s*|$)/i)?.[1]
      ?.trim() || "";

  const horario =
    raw.match(/Transporte horário:\s*([0-9]{2}:[0-9]{2})/i)?.[1]?.trim() || "";

  const destino =
    raw
      .match(
        /Destino transporte:\s*([^\n\r]+?)(?=\s+[A-Za-zÀ-ÿ ]+:\s*|$)/i,
      )?.[1]
      ?.trim() || "";

  const motivo =
    raw
      .match(/Motivo transporte:\s*([^\n\r]+?)(?=\s+[A-Za-zÀ-ÿ ]+:\s*|$)/i)?.[1]
      ?.trim() || "";

  if (!tipo && !horario && !destino && !motivo) return null;

  return {
    provider: {
      veiculo: tipo || "—",
      nome: tipo || "—",
      label: tipo || "Transporte",
      motorista: "",
      placa: "",
    },
    schedule: {
      selectedTime: horario || "",
    },
    toAddress: destino || "",
    reason: motivo || "",
  };
}

async function getUserNomeByUid(uid) {
  try {
    if (!uid) return "";
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return "";
    const u = snap.data() || {};
    return String(
      u?.nome || u?.name || u?.displayName || u?.fullName || "",
    ).trim();
  } catch (e) {
    console.log("❌ getUserNomeByUid:", e?.message);
    return "";
  }
}

export default function ReplyExameseconsultas({ navigation, route }) {
  const theme = useTheme();
  const { requestId } = route?.params || {};

  const auth = getAuth();
  const userEmail = (auth.currentUser?.email || "").toLowerCase();
  const adminScope = getAdminScopeByEmail(userEmail);
  const isAdmin = !!adminScope;

  // ✅ garante que só admin de SAÚDE edite essa tela
  const canEditThisArea = useMemo(() => {
    const areaIds = adminScope?.areaIds || [];
    return areaIds.includes("saude");
  }, [adminScope]);

  const canAdminEdit = isAdmin && canEditThisArea;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusDraft, setStatusDraft] = useState(null);

  // =========================================================================
  const [responsavelUid, setResponsavelUid] = useState("");
  const [responsavelNome, setResponsavelNome] = useState("");
  const [loadingResponsavel, setLoadingResponsavel] = useState(false);

  const responsavelSalvo = useMemo(() => {
    const r =
      data?.responsavelLiberacao ||
      data?.saudeData?.responsavelLiberacao ||
      data?.data?.responsavelLiberacao ||
      null;

    return {
      uid: String(r?.uid || "").trim(),
      nome: String(r?.nome || "").trim(),
      area: String(r?.area || "").trim(),
    };
  }, [data]);

  const responsavelSalvoNome = responsavelSalvo.nome;
  const responsavelSalvoUid = responsavelSalvo.uid;

  const shouldShowResponsavelToUser = !!responsavelSalvoNome; // usuário só vê se admin salvou

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

  const statusOptions = parecerOptions; // status = parecer

  function formatarDataBR(value) {
    if (!value) return "";

    if (value?.toDate) {
      const d = value.toDate();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    }

    if (typeof value === "number") {
      const d = new Date(value);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    }

    const s = String(value).trim();

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [a, b, c] = s.split("/");
      const dd = String(a).padStart(2, "0");
      const mm = String(b).padStart(2, "0");
      return `${dd}/${mm}/${c}`;
    }

    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

    const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s|$)/);
    if (us) {
      const mm = String(us[1]).padStart(2, "0");
      const dd = String(us[2]).padStart(2, "0");
      return `${dd}/${mm}/${us[3]}`;
    }

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    }

    return s;
  }

  useEffect(() => {
    let mounted = true;

    async function loadResponsavel() {
      try {
        if (!canAdminEdit) return;

        setLoadingResponsavel(true);

        const uid = auth.currentUser?.uid || (await getAuthUserId());
        const nomeFromAuth = String(auth.currentUser?.displayName || "").trim();

        let nome = nomeFromAuth;
        if (!nome) {
          nome = await getUserNomeByUid(uid); // ✅ busca no users/{uid}
        }

        if (!mounted) return;

        setResponsavelUid(uid || "");
        setResponsavelNome(String(nome || "").trim());
      } finally {
        if (mounted) setLoadingResponsavel(false);
      }
    }

    loadResponsavel();
    return () => {
      mounted = false;
    };
  }, [canAdminEdit, auth]);

  useEffect(() => {
    if (!data) return;
    setParecerDraft(String(data?.parecer || "analise").toLowerCase());
    setJustificativaDraft(String(data?.justificativa || ""));
  }, [data]);

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

  const saudeData = data?.saudeData || data?.data || null;

  const transporteData =
    saudeData?.transporteData ||
    data?.transporteData ||
    data?.data?.transporteData ||
    parseTransporteFromDescricao(data?.data?.descricao || data?.descricao) ||
    null;

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

  // ✅ TRANSPORTE (fallback seguro)
  const transporteVeiculo = String(
    parsed.veiculoTransporte ||
      transporteData?.provider?.veiculo ||
      transporteData?.provider?.label ||
      transporteData?.provider?.nome ||
      transporteData?.vehicleName ||
      parsed.transporte ||
      "",
  ).trim();

  const transporteMotorista = String(
    transporteData?.provider?.motorista ||
      transporteData?.driverName ||
      parsed.motoristaTransporte ||
      "",
  ).trim();

  const transportePlaca = String(
    transporteData?.provider?.placa ||
      transporteData?.plate ||
      parsed.placaTransporte ||
      "",
  ).trim();

  const transporteHorario = String(
    transporteData?.schedule?.selectedTime || parsed.transporteHorario || "",
  ).trim();

  const transporteDestino = String(
    transporteData?.toAddress || parsed.destinoTransporte || "",
  ).trim();

  const transporteMotivo = String(
    transporteData?.reason || parsed.motivoTransporte || "",
  ).trim();

  const shouldShowTransporte = !!(
    transporteVeiculo ||
    transporteMotorista ||
    transportePlaca ||
    transporteHorario ||
    transporteDestino ||
    transporteMotivo
  );

  // ===== Campos do resumo =====
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

  // ✅ statusInfo (necessário pro draftInfo)
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

  // ✅ ESPECIALIDADE
  const especialidadeLabel = useMemo(() => {
    const espAgendada = String(saudeData?.especialidadeAgendada || "").trim();
    const dataAg = String(saudeData?.dataAgendada || "").trim();
    const horaAg = String(saudeData?.horaAgendada || "").trim();

    const espFromDescricao = String(
      saudeData?.especialidadeSelecionada || parsed.especialidade || "",
    ).trim();

    if (espAgendada && dataAg && horaAg)
      return `${espAgendada} • ${formatarDataBR(dataAg)} ${horaAg}`;

    if (espFromDescricao && parsed.data && parsed.horario) {
      return `${espFromDescricao} • ${formatarDataBR(parsed.data)} ${parsed.horario}`;
    }

    if (espFromDescricao) return espFromDescricao;

    return "";
  }, [saudeData, parsed.especialidade, parsed.data, parsed.horario]);

  // ✅ detecta se precisa salvar o responsavel mesmo sem mexer em nada
  const needsResponsavelSave = useMemo(() => {
    if (!canAdminEdit) return false;
    if (!responsavelUid || !responsavelNome) return false;

    return (
      String(responsavelSalvoUid || "").trim() !==
        String(responsavelUid || "").trim() ||
      String(responsavelSalvoNome || "").trim() !==
        String(responsavelNome || "").trim()
    );
  }, [
    canAdminEdit,
    responsavelUid,
    responsavelNome,
    responsavelSalvoUid,
    responsavelSalvoNome,
  ]);

  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(() => {
    if (!canAdminEdit) return false;

    const statusChanged =
      !!statusDraft && statusDraft !== String(data?.status || "").toLowerCase();

    const parecerChanged =
      !!parecerDraft &&
      parecerDraft !== String(data?.parecer || "analise").toLowerCase();

    const justificativaChanged =
      String(justificativaDraft || "") !== String(data?.justificativa || "");

    return (
      statusChanged ||
      parecerChanged ||
      justificativaChanged ||
      needsResponsavelSave
    );
  }, [
    canAdminEdit,
    statusDraft,
    data?.status,
    parecerDraft,
    data?.parecer,
    justificativaDraft,
    data?.justificativa,
    needsResponsavelSave,
  ]);

  useEffect(() => {
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

      const uid =
        responsavelUid || auth.currentUser?.uid || (await getAuthUserId());
      const nome = String(responsavelNome || "").trim();

      if (!uid || !nome) {
        Alert.alert(
          "Atenção",
          "Não foi possível identificar o responsável pela liberação. Verifique se o admin possui nome no cadastro (users).",
        );
        return;
      }

      const responsavelPayload = {
        uid,
        nome,
        area: "saude",
        savedAtMs: Date.now(),
      };

      await updateRequestStatus({
        requestId,
        userId: uid, // ✅ aqui é o UID do admin (quem está salvando)

        parecer: parecerLower,
        justificativa: justificativaDraft,

        status: isConcluido
          ? null
          : String(statusDraft || "analise").toLowerCase(),
        isHidden: isConcluido,

        responsavelLiberacao: responsavelPayload, // ✅ AGORA VAI SALVAR
      });

      Alert.alert("Sucesso", "Alterações salvas!");
    } catch (e) {
      console.log("❌ Erro ao salvar:", e);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

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

                {/* ESPECIALIDADE */}
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
                      size={15}
                      color={theme.colors.cinza}
                    />

                    <View style={{ marginLeft: 6 }}>
                      <OptionText>Especialidades</OptionText>

                      {especialidadeLabel ? (
                        <SelectedPillText
                          numberOfLines={1}
                          style={{ fontSize: 8.8 }}
                        >
                          {especialidadeLabel}
                        </SelectedPillText>
                      ) : (
                        <Text style={{ color: theme.colors.textSecondary }}>
                          —
                        </Text>
                      )}
                    </View>
                  </OptionLeft>
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

                {/* TRANSPORTE */}
                {shouldShowTransporte ? (
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
                        {transporteVeiculo || "—"}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 8,
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

                      <View style={{ marginTop: 6 }}>
                        {transporteMotorista ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                            }}
                          >
                            Motorista:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteMotorista}
                            </Text>
                          </Text>
                        ) : null}

                        {transportePlaca ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Placa:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transportePlaca}
                            </Text>
                          </Text>
                        ) : null}

                        {transporteHorario ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Horário:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteHorario}
                            </Text>
                          </Text>
                        ) : null}

                        {transporteDestino ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Destino:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteDestino}
                            </Text>
                          </Text>
                        ) : null}

                        {transporteMotivo ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                              marginTop: 4,
                            }}
                          >
                            Motivo:{" "}
                            <Text style={{ fontWeight: "700" }}>
                              {transporteMotivo}
                            </Text>
                          </Text>
                        ) : null}
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

                    <View style={{ marginTop: 12 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "900",
                          color: theme.colors.text,
                          marginBottom: 8,
                        }}
                      >
                        Responsável pela liberação da solicitação
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
                        {loadingResponsavel ? (
                          <Text
                            style={{
                              color: theme.colors.textSecondary,
                              fontWeight: "700",
                            }}
                          >
                            Carregando responsável...
                          </Text>
                        ) : responsavelNome ? (
                          <Text
                            style={{
                              color: theme.colors.text,
                              fontWeight: "900",
                            }}
                          >
                            {responsavelNome}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: theme.colors.textSecondary,
                              fontWeight: "700",
                            }}
                          >
                            Nome não encontrado no cadastro.
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ) : null}

                {/* ✅ USER: justificativa (se existir) */}
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

                {/* ✅ USER: responsável (independente da justificativa) */}
                {!canAdminEdit && shouldShowResponsavelToUser ? (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "900",
                        color: theme.colors.text,
                        marginBottom: 8,
                      }}
                    >
                      Responsável pela liberação da solicitação
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
                        style={{ color: theme.colors.text, fontWeight: "900" }}
                      >
                        {responsavelSalvoNome}
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
                  disabled={saving || !hasChanges}
                  onPress={handleSaveAll}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      saving || !hasChanges
                        ? theme.colors.border
                        : theme.colors.purple,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "900" }}>
                      SALVAR ALTERAÇÕES
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Mensagens de ajuda */}
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
                ) : needsResponsavelSave ? (
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Salve para registrar o responsável e liberar a visualização
                    ao usuário.
                  </Text>
                ) : (
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Existem alterações não salvas.
                  </Text>
                )}
              </View>
            ) : null}
          </Card>
        </Body>
      </ScrollView>
    </Container>
  );
}
