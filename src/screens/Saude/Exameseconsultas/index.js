import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";

import { getAuth } from "firebase/auth";
import AppAlert from "../../../components/AppAlert";
import { createRequest } from "../../../services/requests";
import { getAuthUserId } from "../../../services/userId";

import PrimaryButtonenviarareas from "../../../components/PrimaryButtonenviarareas";

import {
  AccordionItem,
  AccordionList,
  AccordionRow,
  AccordionText,
  BackBtn,
  Body,
  Card,
  Container,
  DividerSpace,
  Grid,
  Header,
  HeaderContent,
  HeaderTitle,
  MiniCard,
  MiniIconBox,
  MiniText,
  OptionLeft,
  OptionRow,
  OptionText,
  SectionTitle,
  SelectedPill,
  SelectedPillText,
} from "./styles";

function formatDateLabel(iso) {
  const [y, m, d] = (iso || "").split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;

  const dt = new Date(y, m - 1, d);
  const week = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dt.getDay()];
  return `${week} • ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

//==========================================================================================
function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(y, m, d) {
  // m: 1..12
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function monthNamePt(idx) {
  return [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ][idx];
}

function CalendarSimple({ dates, selectedDate, onSelectDate, theme }) {
  // transforma array de datas em Set pra lookup rápido
  const availableSet = useMemo(() => new Set(dates), [dates]);

  // usa o mês da primeira data disponível
  const baseDate = useMemo(() => {
    const [y, m] = dates[0].split("-").map(Number);
    return new Date(y, m - 1, 1);
  }, [dates]);

  const year = baseDate.getFullYear();
  const monthIndex = baseDate.getMonth();

  const monthLabel = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ][monthIndex];

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayWeek = new Date(year, monthIndex, 1).getDay(); // 0..6

  const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  // monta grid simples
  const cells = [];
  for (let i = 0; i < firstDayWeek; i++) {
    cells.push({ empty: true, key: `e-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
      d,
    ).padStart(2, "0")}`;

    cells.push({
      day: d,
      iso,
      available: availableSet.has(iso),
      selected: selectedDate === iso,
      key: iso,
    });
  }

  return (
    <View style={{ marginBottom: 12 }}>
      {/* TÍTULO DO MÊS */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "900",
          color: theme.colors.purple,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {monthLabel} {year}
      </Text>

      {/* DIAS DA SEMANA */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {weekLabels.map((w, idx) => (
          <View
            key={`${w}-${idx}`}
            style={{ width: "14.28%", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: theme.colors.textSecondary, // cinza
              }}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* GRID */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((c) =>
          c.empty ? (
            <View key={c.key} style={{ width: "14.28%", height: 38 }} />
          ) : (
            <View key={c.key} style={{ width: "14.28%", padding: 3 }}>
              <Pressable
                disabled={!c.available}
                onPress={() => onSelectDate(c.iso)}
                style={{
                  height: 36,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: c.selected
                    ? theme.colors.purple
                    : theme.colors.background,
                  borderWidth: 1,
                  borderColor: c.available
                    ? theme.colors.purple
                    : theme.colors.border,
                  opacity: c.available ? 1 : 0.3,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: c.selected
                      ? theme.colors.surface
                      : c.available
                        ? theme.colors.purple
                        : theme.colors.textSecondary,
                  }}
                >
                  {c.day}
                </Text>
              </Pressable>
            </View>
          ),
        )}
      </View>
    </View>
  );
}
//==========================================================================================

const DoctorScheduleSheet = React.memo(function DoctorScheduleSheet({
  visible,
  onClose,
  doctorName,
  theme,
  availability,
  selectedDate,
  setSelectedDate,
  selectedHour,
  setSelectedHour,
  onConfirm,
}) {
  const screenH = Dimensions.get("window").height;

  const translateY = useRef(new Animated.Value(screenH)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);

      // ✅ garante que abre sempre de baixo, mas só quando ABRE
      translateY.setValue(screenH);
      backdrop.setValue(0);

      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 1500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenH,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, screenH, translateY, backdrop]);

  const dates = useMemo(() => availability?.dates || [], [availability]);
  const hours = useMemo(
    () => (selectedDate ? availability?.hoursByDate?.[selectedDate] || [] : []),
    [availability, selectedDate],
  );

  if (!mounted && !visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible || mounted}
      statusBarTranslucent
    >
      {/* ✅ camada raiz (evita backdrop “roubar” clique do sheet) */}
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {/* BACKDROP (fica atrás) */}
        <Pressable
          onPress={onClose}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              opacity: backdrop,
            }}
          />
        </Pressable>

        {/* SHEET */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateY }],
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.card || theme.colors.background,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 16,
              paddingBottom: 18,
              borderTopWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {/* topo */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 46,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: theme.colors.border,
                  marginBottom: 10,
                }}
              />

              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: theme.colors.text,
                    }}
                    numberOfLines={2}
                  >
                    {doctorName || "Escolha a especialidade"}
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={18} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: theme.colors.text,
                marginBottom: 10,
              }}
            >
              Datas disponíveis
            </Text>

            {dates.length ? (
              <CalendarSimple
                dates={dates}
                selectedDate={selectedDate}
                onSelectDate={(iso) => {
                  setSelectedDate(iso);
                  setSelectedHour(null);
                }}
                theme={theme}
              />
            ) : (
              <Text style={{ color: theme.colors.textSecondary }}>
                Nenhuma data cadastrada.
              </Text>
            )}

            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: theme.colors.text,
                marginTop: 8,
                marginBottom: 10,
              }}
            >
              Horários disponíveis
            </Text>

            {!selectedDate ? (
              <Text style={{ color: theme.colors.textSecondary }}>
                Selecione uma data acima.
              </Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {hours.length ? (
                  hours.map((h) => {
                    const active = selectedHour === h;
                    return (
                      <Pressable
                        key={h}
                        onPress={() => setSelectedHour(h)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          backgroundColor: active
                            ? theme.colors.purple
                            : theme.colors.background,
                          borderWidth: 1,
                          borderColor: active
                            ? theme.colors.purple
                            : theme.colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "900",
                            color: active
                              ? theme.colors.surface
                              : theme.colors.text,
                          }}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Nenhum horário para esse dia.
                  </Text>
                )}
              </View>
            )}

            <View style={{ height: 14 }} />

            <Pressable
              disabled={!selectedDate || !selectedHour}
              onPress={() => {
                if (!selectedDate || !selectedHour) return;
                onConfirm?.({
                  doctorName,
                  date: selectedDate,
                  hour: selectedHour,
                });
              }}
              style={{
                height: 46,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  selectedDate && selectedHour
                    ? theme.colors.purple
                    : theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "900",
                  color:
                    selectedDate && selectedHour
                      ? theme.colors.surface
                      : theme.colors.textSecondary,
                }}
              >
                CONFIRMAR
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default function Exameseconsultas({ navigation }) {
  function formatDateLabel(iso) {
    // iso "YYYY-MM-DD"
    const [y, m, d] = (iso || "").split("-").map((x) => Number(x));
    if (!y || !m || !d) return iso;

    const dt = new Date(y, m - 1, d);
    const week = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dt.getDay()];
    return `${week} • ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  }

  const theme = useTheme();

  const [transporte, setTransporte] = useState("");

  const [openKey, setOpenKey] = useState(null); // "medicos" | "clinicas" | "exames" | "procedimentos"
  const [loading, setLoading] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState(null);

  // ✅ seleção (1 por seção, simples e direto)
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [selectedClinica, setSelectedClinica] = useState(null);
  const [selectedExame, setSelectedExame] = useState(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetDoctor, setSheetDoctor] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  const [medicoAgendado, setMedicoAgendado] = useState(null);
  const [dataAgendada, setDataAgendada] = useState(null);
  const [horaAgendada, setHoraAgendada] = useState(null);

  const [agModalOpen, setAgModalOpen] = useState(false);

  const medicos = useMemo(
    () => [
      "Dra. Ana Souza (Clínico Geral)",
      "Dr. Paulo Lima (Cardiologista)",
      "Dra. Camila Rocha (Pediatra)",
      "Dr. Bruno Martins (Ortopedista)",
      "Dra. Fernanda Alves (Ginecologista)",
      "Dr. Ricardo Nunes (Dermatologista)",
      "Dra. Juliana Mota (Endocrinologista)",
      "Dr. Felipe Barros (Neurologista)",
    ],
    [],
  );

  const clinicas = useMemo(
    () => [
      "Clínica Vida Mais",
      "Centro Médico Araguaia",
      "Clínica Santa Luzia",
      "Policlínica Municipal",
      "Clínica Bem Estar",
      "Clínica Saúde Total",
      "Centro Médico Primavera",
    ],
    [],
  );

  const exames = useMemo(
    () => [
      "Hemograma completo",
      "Glicemia em jejum",
      "Colesterol e triglicerídeos",
      "Raio-X",
      "Ultrassom",
      "Eletrocardiograma",
      "Teste ergométrico",
      "Ressonância magnética",
    ],
    [],
  );

  const procedimentos = useMemo(
    () => [
      "Curativo",
      "Retirada de pontos",
      "Nebulização",
      "Aplicação de medicação",
      "Sutura simples",
      "Coleta de material",
      "Pequenos procedimentos",
    ],
    [],
  );

  const doctorAvailability = useMemo(() => {
    // keys = nome do medico
    return {
      "Dra. Ana Souza (Clínico Geral)": {
        dates: ["2026-01-20", "2026-01-22", "2026-01-25", "2026-01-28"],
        hoursByDate: {
          "2026-01-20": ["08:00", "09:30", "14:00", "16:30"],
          "2026-01-22": ["10:00", "11:00", "15:00"],
          "2026-01-25": ["08:30", "13:30", "17:00"],
          "2026-01-28": ["09:00", "12:00", "16:00"],
        },
      },
      "Dr. Paulo Lima (Cardiologista)": {
        dates: ["2026-01-21", "2026-01-23", "2026-01-29"],
        hoursByDate: {
          "2026-01-21": ["07:30", "09:00", "10:30"],
          "2026-01-23": ["13:00", "14:30", "16:00"],
          "2026-01-29": ["08:00", "11:00", "15:30"],
        },
      },
    };
  }, []);

  //mockup clinicas

  const clinicsByDoctorSlot = useMemo(() => {
    // chave: `${doctor}|${date}|${hour}`
    return {
      "Dra. Ana Souza (Clínico Geral)|2026-01-20|08:00": [
        "Policlínica Municipal",
      ],
      "Dra. Ana Souza (Clínico Geral)|2026-01-20|09:30": [
        "Centro Médico Araguaia",
      ],
      "Dra. Ana Souza (Clínico Geral)|2026-01-22|10:00": [
        "Clínica Saúde Total",
      ],

      "Dr. Paulo Lima (Cardiologista)|2026-01-21|07:30": [
        "Centro Médico Araguaia",
      ],
      "Dr. Paulo Lima (Cardiologista)|2026-01-23|14:30": ["Clínica Vida Mais"],
    };
  }, []);

  const clinicasFiltradas = useMemo(() => {
    if (!medicoAgendado || !dataAgendada || !horaAgendada) return [];

    const key = `${medicoAgendado}|${dataAgendada}|${horaAgendada}`;
    const list = clinicsByDoctorSlot[key] || [];

    // ✅ regra: 1 médico no slot = 1 clínica
    return list.length ? [list[0]] : [];
  }, [medicoAgendado, dataAgendada, horaAgendada, clinicsByDoctorSlot]);

  function openDoctorSheet(doctorName) {
    setSelectedDate(null);
    setSelectedHour(null);

    setSheetDoctor(doctorName);
    setSheetOpen(true);
  }

  function closeDoctorSheet() {
    setSheetOpen(false);
    // mantém sheetDoctor se quiser mostrar animação fechando sem piscar
  }

  function toggle(key) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  function buildDescricao() {
    const lines = [];

    if (selectedMedico) lines.push(`Médico: ${selectedMedico}`);
    if (selectedClinica) lines.push(`Clínica: ${selectedClinica}`);
    if (selectedExame) lines.push(`Exame: ${selectedExame}`);
    if (selectedProcedimento)
      lines.push(`Procedimento: ${selectedProcedimento}`);
    if (transporte?.trim())
      lines.push(`Agendamento de Transporte: ${transporte.trim()}`);
    if (medicoAgendado) lines.push(`Médico: ${medicoAgendado}`);
    if (dataAgendada) lines.push(`Data: ${dataAgendada}`);
    if (horaAgendada) lines.push(`Horário: ${horaAgendada}`);

    return lines.join("\n");
  }

  const descricaoFinal = buildDescricao();
  const canSave = !!descricaoFinal.trim() && !loading;

  // FUNÇÃO QUE CRIA O OBJETO COM OS DADOS

  function buildSaudeData() {
    return {
      // seleção principal
      medicoSelecionado: selectedMedico || null,
      clinicaSelecionada: selectedClinica || null,
      exameSelecionado: selectedExame || null,
      procedimentoSelecionado: selectedProcedimento || null,

      // agendamento confirmado (sheet)
      medicoAgendado: medicoAgendado || null,
      dataAgendada: dataAgendada || null,
      horaAgendada: horaAgendada || null,

      // input
      transporte: (transporte || "").trim() || null,

      // info útil p/ auditoria/debug
      clinicasDisponiveisNoSlot: Array.isArray(clinicasFiltradas)
        ? clinicasFiltradas
        : [],

      // para no futuro ligar com admin
      slotKey:
        medicoAgendado && dataAgendada && horaAgendada
          ? `${medicoAgendado}|${dataAgendada}|${horaAgendada}`
          : null,
    };
  }

  async function handleSave() {
    if (loading) return;

    try {
      if (!descricaoFinal.trim()) {
        Alert.alert("Atenção", "Selecione pelo menos uma opção para salvar.");
        return;
      }

      setLoading(true);

      const userId = await getAuthUserId();
      if (!userId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const auth = getAuth();
      const userEmail = (auth.currentUser?.email || "").trim().toLowerCase();

      const saudeData = buildSaudeData();

      const { requestId } = await createRequest({
        userId,
        userEmail,
        areaId: "saude",
        areaLabel: "SAÚDE",

        // continua compatível com o seu Reply, etc
        descricao: descricaoFinal,

        // ✅ NOVO: salva estruturado
        saudeData,

        // mantendo compatibilidade com seu schema atual:
        enderecoPoste: "",
        numeroPoste: "",
        images: [],
        location: null,
      });

      setSuccessRequestId(requestId);
      setSuccessOpen(true);
    } catch (e) {
      console.log("❌ SAUDE handleSave:", e?.code, e?.message);
      Alert.alert("Erro", "Não foi possível salvar sua solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      {/* HEADER GRADIENTE */}

      {/* ✅ ROLAGEM VERTICAL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header>
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

              <HeaderTitle>Solicitar Exames, Consultas e Clínicas</HeaderTitle>
            </HeaderContent>
          </LinearGradient>
        </Header>

        <Body>
          <Card>
            <SectionTitle>O que você quer encontrar?</SectionTitle>

            {/* ================== MÉDICOS ================== */}
            <OptionRow activeOpacity={0.9} onPress={() => toggle("medicos")}>
              <OptionLeft>
                <Ionicons
                  name="medkit-outline"
                  size={18}
                  color={theme.colors.cinza}
                />
                <OptionText>Médicos</OptionText>
              </OptionLeft>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {medicoAgendado && dataAgendada && horaAgendada ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {`${medicoAgendado.split(" (")[0]} • ${dataAgendada} ${horaAgendada}`}
                    </SelectedPillText>
                  </SelectedPill>
                ) : selectedMedico ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {selectedMedico.split(" (")[0]}
                    </SelectedPillText>
                  </SelectedPill>
                ) : null}

                <Ionicons
                  name={
                    openKey === "medicos"
                      ? "caret-up-outline"
                      : "caret-down-outline"
                  }
                  size={18}
                  color={theme.colors.cinza}
                />
              </View>
            </OptionRow>

            {openKey === "medicos" && (
              <AccordionList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {medicos.map((name) => {
                  const active = selectedMedico === name;
                  return (
                    <AccordionItem
                      key={name}
                      activeOpacity={0.9}
                      onPress={() => {
                        setSelectedMedico(name);
                        setSelectedClinica(null); // ✅ limpa clínica antiga
                        openDoctorSheet(name); // ✅ abre o sheet com datas/horários
                      }}
                    >
                      <AccordionRow>
                        <Ionicons
                          name={active ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={
                            active ? theme.colors.purple : theme.colors.cinza
                          }
                        />
                        <AccordionText numberOfLines={2}>{name}</AccordionText>
                      </AccordionRow>
                    </AccordionItem>
                  );
                })}
              </AccordionList>
            )}

            {/* ================== CLÍNICAS ================== */}
            <OptionRow activeOpacity={0.9} onPress={() => toggle("clinicas")}>
              <OptionLeft>
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={theme.colors.cinza}
                />
                <OptionText>Clínicas</OptionText>
              </OptionLeft>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {selectedClinica ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {selectedClinica}
                    </SelectedPillText>
                  </SelectedPill>
                ) : !medicoAgendado || !dataAgendada || !horaAgendada ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      Selecione médico/data/hora
                    </SelectedPillText>
                  </SelectedPill>
                ) : null}

                <Ionicons
                  name={
                    openKey === "clinicas"
                      ? "caret-up-outline"
                      : "caret-down-outline"
                  }
                  size={18}
                  color={theme.colors.cinza}
                />
              </View>
            </OptionRow>

            {openKey === "clinicas" && (
              <AccordionList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {!medicoAgendado || !dataAgendada || !horaAgendada ? (
                  <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: theme.colors.textSecondary }}>
                      Para ver as clínicas disponíveis, primeiro escolha um
                      médico e confirme data e hora.
                    </Text>
                  </View>
                ) : clinicasFiltradas.length ? (
                  clinicasFiltradas.map((name) => {
                    const active = selectedClinica === name;
                    return (
                      <AccordionItem
                        key={name}
                        activeOpacity={0.9}
                        onPress={() => setSelectedClinica(name)}
                      >
                        <AccordionRow>
                          <Ionicons
                            name={
                              active ? "checkmark-circle" : "ellipse-outline"
                            }
                            size={18}
                            color={
                              active ? theme.colors.purple : theme.colors.cinza
                            }
                          />
                          <AccordionText numberOfLines={2}>
                            {name}
                          </AccordionText>
                        </AccordionRow>
                      </AccordionItem>
                    );
                  })
                ) : (
                  <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: theme.colors.textSecondary }}>
                      Nenhuma clínica disponível para esse médico neste dia e
                      horário.
                    </Text>
                  </View>
                )}
              </AccordionList>
            )}

            {/* ================== EXAMES ================== */}
            <OptionRow activeOpacity={0.9} onPress={() => toggle("exames")}>
              <OptionLeft>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={theme.colors.cinza}
                />
                <OptionText>Exames</OptionText>
              </OptionLeft>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {selectedExame ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {selectedExame}
                    </SelectedPillText>
                  </SelectedPill>
                ) : null}

                <Ionicons
                  name={
                    openKey === "exames"
                      ? "caret-up-outline"
                      : "caret-down-outline"
                  }
                  size={18}
                  color={theme.colors.cinza}
                />
              </View>
            </OptionRow>

            {openKey === "exames" && (
              <AccordionList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {exames.map((name) => {
                  const active = selectedExame === name;
                  return (
                    <AccordionItem
                      key={name}
                      activeOpacity={0.9}
                      onPress={() => setSelectedExame(name)}
                    >
                      <AccordionRow>
                        <Ionicons
                          name={active ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={
                            active ? theme.colors.purple : theme.colors.cinza
                          }
                        />
                        <AccordionText numberOfLines={2}>{name}</AccordionText>
                      </AccordionRow>
                    </AccordionItem>
                  );
                })}
              </AccordionList>
            )}

            {/* ================== PROCEDIMENTOS ================== */}
            <OptionRow
              activeOpacity={0.9}
              onPress={() => toggle("procedimentos")}
            >
              <OptionLeft>
                <Ionicons
                  name="fitness-outline"
                  size={18}
                  color={theme.colors.cinza}
                />
                <OptionText>Procedimentos</OptionText>
              </OptionLeft>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {selectedProcedimento ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {selectedProcedimento}
                    </SelectedPillText>
                  </SelectedPill>
                ) : null}

                <Ionicons
                  name={
                    openKey === "procedimentos"
                      ? "caret-up-outline"
                      : "caret-down-outline"
                  }
                  size={18}
                  color={theme.colors.cinza}
                />
              </View>
            </OptionRow>

            {openKey === "procedimentos" && (
              <AccordionList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {procedimentos.map((name) => {
                  const active = selectedProcedimento === name;
                  return (
                    <AccordionItem
                      key={name}
                      activeOpacity={0.9}
                      onPress={() => setSelectedProcedimento(name)}
                    >
                      <AccordionRow>
                        <Ionicons
                          name={active ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={
                            active ? theme.colors.purple : theme.colors.cinza
                          }
                        />
                        <AccordionText numberOfLines={2}>{name}</AccordionText>
                      </AccordionRow>
                    </AccordionItem>
                  );
                })}
              </AccordionList>
            )}

            <DividerSpace />

            {/* ================== AGENDAMENTO ================== */}

            <SectionTitle>Serviços emergenciais</SectionTitle>

            <Grid>
              <MiniCard activeOpacity={0.9} onPress={() => {}}>
                <MiniIconBox>
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={theme.colors.purple}
                  />
                </MiniIconBox>
                <MiniText numberOfLines={2}>
                  Pronto-socorro{"\n"}e emergências
                </MiniText>
              </MiniCard>

              <MiniCard activeOpacity={0.9} onPress={() => {}}>
                <MiniIconBox>
                  <Ionicons
                    name="document-attach-outline"
                    size={20}
                    color={theme.colors.purple}
                  />
                </MiniIconBox>
                <MiniText numberOfLines={2}>
                  Internação{"\n"}hospitalar
                </MiniText>
              </MiniCard>

              <MiniCard
                activeOpacity={0.9}
                onPress={() => navigation.navigate("Transporte")}
              >
                <MiniIconBox>
                  <Ionicons
                    name="car-outline"
                    size={20}
                    color={theme.colors.purple}
                  />
                </MiniIconBox>
                <MiniText numberOfLines={2}>Transporte</MiniText>
              </MiniCard>

              <MiniCard activeOpacity={0.9} onPress={() => {}}>
                <MiniIconBox>
                  <Ionicons
                    name="home-outline"
                    size={20}
                    color={theme.colors.purple}
                  />
                </MiniIconBox>
                <MiniText numberOfLines={2}>Hospital{"\n"}isolado</MiniText>
              </MiniCard>
            </Grid>

            {/* ✅ BOTÃO SALVAR */}
            <PrimaryButtonenviarareas
              title={loading ? "SALVANDO..." : "SALVAR"}
              onPress={handleSave}
              disabled={!canSave}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Body>
      </ScrollView>

      <DoctorScheduleSheet
        visible={sheetOpen}
        onClose={closeDoctorSheet}
        doctorName={sheetDoctor}
        theme={theme}
        availability={sheetDoctor ? doctorAvailability[sheetDoctor] : null}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        onConfirm={(payload) => {
          setMedicoAgendado(payload.doctorName);
          setDataAgendada(payload.date);
          setHoraAgendada(payload.hour);
          setSelectedMedico(payload.doctorName);
          closeDoctorSheet();
        }}
      />

      {/* ✅ SUCESSO */}
      <AppAlert
        visible={successOpen}
        variant="success"
        title="Solicitação salva"
        message="Sua solicitação foi registrada com sucesso."
        onClose={() => {
          setSuccessOpen(false);
          if (successRequestId) {
            navigation.navigate("ReplyExameseconsultas", {
              requestId: successRequestId,
            });
          }
        }}
      />
    </Container>
  );
}
