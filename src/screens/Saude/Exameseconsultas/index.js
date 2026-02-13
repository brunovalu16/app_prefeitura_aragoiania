import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

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

function CalendarSimple({ dates, selectedDate, onSelectDate, theme }) {
  const availableSet = useMemo(() => new Set(dates), [dates]);

  const baseDate = useMemo(() => {
    const [y, m] = (dates?.[0] || "").split("-").map(Number);
    if (!y || !m) return new Date();
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

  const cells = [];
  for (let i = 0; i < firstDayWeek; i++) {
    cells.push({ empty: true, key: `e-${i}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
                color: theme.colors.textSecondary,
              }}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

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
  doctorName, // aqui agora é "especialidade"
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

      translateY.setValue(screenH);
      backdrop.setValue(0);

      // ABRIR
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 1000, // antes 260
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000, // ✅ mais devagar (antes 260)
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      // FECHAR
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 1400, // antes 200
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenH,
          duration: 1400, // ✅ mais devagar (antes 200)
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
      <View style={{ flex: 1 }} pointerEvents="box-none">
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

export default function Exameseconsultas({ navigation, route }) {
  const theme = useTheme();

  const [transporteDraft, setTransporteDraft] = useState(null);

  const [transporte, setTransporte] = useState("");

  const [openKey, setOpenKey] = useState(null); // "especialidades" | "clinicas" | "exames" | "procedimentos"
  const [loading, setLoading] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRequestId, setSuccessRequestId] = useState(null);

  // ✅ seleção
  const [selectedEspecialidade, setSelectedEspecialidade] = useState(null);
  const [selectedClinica, setSelectedClinica] = useState(null);
  const [selectedExame, setSelectedExame] = useState(null);
  const [selectedProcedimento, setSelectedProcedimento] = useState(null);

  // ✅ sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetEspecialidade, setSheetEspecialidade] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // ✅ agendamento confirmado
  const [especialidadeAgendada, setEspecialidadeAgendada] = useState(null);
  const [dataAgendada, setDataAgendada] = useState(null);
  const [horaAgendada, setHoraAgendada] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const draft = route?.params?.transporteDraft;
      if (draft) {
        setTransporteDraft(draft);

        navigation.setParams({
          transporteDraft: undefined,
          transporteDraftAt: undefined,
        });
      }
    }, [route?.params?.transporteDraftAt, navigation]),
  );

  const especialidades = useMemo(
    () => [
      "Clínica Médica",
      "Pediatria",
      "Ginecologia e Obstetrícia",
      "Cardiologia",
      "Ortopedia e Traumatologia",
      "Dermatologia",
      "Neurologia",
      "Endocrinologia",
      "Psiquiatria",
      "Oftalmologia",
      "Otorrinolaringologia",
      "Urologia",
      "Gastroenterologia",
      "Pneumologia",
      "Reumatologia",
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

  const specialtyAvailability = useMemo(() => {
    return {
      "Clínica Médica": {
        dates: ["2026-01-20", "2026-01-22", "2026-01-25"],
        hoursByDate: {
          "2026-01-20": ["08:00", "09:30", "14:00"],
          "2026-01-22": ["10:00", "15:00"],
          "2026-01-25": ["08:30", "13:30"],
        },
      },
      Pediatria: {
        dates: ["2026-01-21", "2026-01-23"],
        hoursByDate: {
          "2026-01-21": ["07:30", "09:00"],
          "2026-01-23": ["13:00", "16:00"],
        },
      },
    };
  }, []);

  const clinicsBySpecialtySlot = useMemo(() => {
    return {
      "Clínica Médica|2026-01-20|08:00": ["Policlínica Municipal"],
      "Clínica Médica|2026-01-20|09:30": ["Centro Médico Araguaia"],
      "Pediatria|2026-01-21|07:30": ["Centro Médico Araguaia"],
    };
  }, []);

  const clinicasFiltradas = useMemo(() => {
    if (!especialidadeAgendada || !dataAgendada || !horaAgendada) return [];

    const key = `${especialidadeAgendada}|${dataAgendada}|${horaAgendada}`;
    const list = clinicsBySpecialtySlot[key] || [];

    // regra: 1 slot = 1 clínica
    return list.length ? [list[0]] : [];
  }, [
    especialidadeAgendada,
    dataAgendada,
    horaAgendada,
    clinicsBySpecialtySlot,
  ]);

  function openEspecialidadeSheet(especialidade) {
    setSelectedDate(null);
    setSelectedHour(null);
    setSheetEspecialidade(especialidade);
    setSheetOpen(true);
  }

  function closeEspecialidadeSheet() {
    setSheetOpen(false);
  }

  function toggle(key) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  function buildDescricao() {
    const lines = [];

    if (selectedEspecialidade)
      lines.push(`Especialidade: ${selectedEspecialidade}`);
    if (especialidadeAgendada)
      lines.push(`Especialidade: ${especialidadeAgendada}`);
    if (dataAgendada)
      lines.push(`Data: ${dataAgendada} (${formatDateLabel(dataAgendada)})`);
    if (horaAgendada) lines.push(`Horário: ${horaAgendada}`);

    if (selectedClinica) lines.push(`Clínica: ${selectedClinica}`);
    if (selectedExame) lines.push(`Exame: ${selectedExame}`);
    if (selectedProcedimento)
      lines.push(`Procedimento: ${selectedProcedimento}`);

    // ================= TRANSPORTE =================
    if (transporte?.trim())
      lines.push(`Agendamento de Transporte: ${transporte.trim()}`);

    const p = transporteDraft?.provider || null;

    if (p?.label) lines.push(`Transporte: ${p.label}`);

    // ✅ NOVO: salva no TEXTO também (pra você ver no Firestore)
    if (p?.veiculo) lines.push(`Veículo transporte: ${p.veiculo}`);
    if (p?.motorista) lines.push(`Motorista transporte: ${p.motorista}`);
    if (p?.placa) lines.push(`Placa transporte: ${p.placa}`);

    if (transporteDraft?.schedule?.selectedTime) {
      lines.push(
        `Transporte horário: ${transporteDraft.schedule.selectedTime}`,
      );
    }
    if (transporteDraft?.toAddress) {
      lines.push(`Destino transporte: ${transporteDraft.toAddress}`);
    }
    if (transporteDraft?.reason) {
      lines.push(`Motivo transporte: ${transporteDraft.reason}`);
    }

    return lines.join("\n");
  }

  const descricaoFinal = buildDescricao();
  const canSave = !!descricaoFinal.trim() && !loading;

  function buildSaudeData() {
    return {
      especialidadeSelecionada: selectedEspecialidade || null,
      clinicaSelecionada: selectedClinica || null,
      exameSelecionado: selectedExame || null,
      procedimentoSelecionado: selectedProcedimento || null,

      especialidadeAgendada: especialidadeAgendada || null,
      dataAgendada: dataAgendada || null,
      horaAgendada: horaAgendada || null,

      transporteData: transporteDraft || null, // ✅ AQUI

      clinicasDisponiveisNoSlot: Array.isArray(clinicasFiltradas)
        ? clinicasFiltradas
        : [],
      slotKey:
        especialidadeAgendada && dataAgendada && horaAgendada
          ? `${especialidadeAgendada}|${dataAgendada}|${horaAgendada}`
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

      // ✅ pega o draft mais recente direto do route (evita state atrasado)
      const transporteDraftLatest =
        route?.params?.transporteDraft || transporteDraft || null;

      // ✅ monta saudeData garantindo o transporte
      const saudeData = {
        ...buildSaudeData(),
        transporteData: transporteDraftLatest,
      };

      // ✅ se você também quer garantir o texto da descrição com transporte (opcional)
      // (mantém sua buildDescricao atual, mas garante que transporte esteja refletido)
      // const descricaoToSave = descricaoFinal; // mantendo como está

      const { requestId } = await createRequest({
        userId,
        userEmail,
        areaId: "saude",
        areaLabel: "SAÚDE",
        descricao: descricaoFinal,
        saudeData,
        enderecoPoste: "",
        numeroPoste: "",
        images: [],
        location: null,
      });

      setSuccessRequestId(requestId);
      setSuccessOpen(true);
    } catch (e) {
      console.log("❌ SAUDE handleSave:", e?.code, e?.message, e);
      Alert.alert("Erro", "Não foi possível salvar sua solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
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

            {/* ================== ESPECIALIDADES ================== */}
            <OptionRow
              activeOpacity={0.9}
              onPress={() => toggle("especialidades")}
            >
              <OptionLeft>
                <Ionicons
                  name="medkit-outline"
                  size={18}
                  color={theme.colors.cinza}
                />
                <OptionText>Especialidades</OptionText>
              </OptionLeft>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {especialidadeAgendada && dataAgendada && horaAgendada ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {`${especialidadeAgendada} • ${dataAgendada} ${horaAgendada}`}
                    </SelectedPillText>
                  </SelectedPill>
                ) : selectedEspecialidade ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      {selectedEspecialidade}
                    </SelectedPillText>
                  </SelectedPill>
                ) : null}

                <Ionicons
                  name={
                    openKey === "especialidades"
                      ? "caret-up-outline"
                      : "caret-down-outline"
                  }
                  size={18}
                  color={theme.colors.cinza}
                />
              </View>
            </OptionRow>

            {openKey === "especialidades" && (
              <AccordionList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {especialidades.map((name) => {
                  const active = selectedEspecialidade === name;
                  return (
                    <AccordionItem
                      key={name}
                      activeOpacity={0.9}
                      onPress={() => {
                        setSelectedEspecialidade(name);
                        setSelectedClinica(null);
                        openEspecialidadeSheet(name);
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
                ) : !especialidadeAgendada || !dataAgendada || !horaAgendada ? (
                  <SelectedPill>
                    <SelectedPillText numberOfLines={1}>
                      Selecione especialidade/data/hora
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
                {!especialidadeAgendada || !dataAgendada || !horaAgendada ? (
                  <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: theme.colors.textSecondary }}>
                      Para ver as clínicas disponíveis, primeiro escolha uma
                      especialidade e confirme data e hora.
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
                      Nenhuma clínica disponível para essa especialidade neste
                      dia e horário.
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

            {/**============================================================================ */}

            {/* ✅ RESUMO DO TRANSPORTE (CARD GRANDE) */}
            {transporteDraft?.provider?.label ? (
              <View
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: theme.colors.purple,
                  backgroundColor: theme.colors.card || theme.colors.background,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={theme.colors.purple}
                    />
                    <Text
                      style={{ fontWeight: "900", color: theme.colors.purple }}
                    >
                      Transporte confirmado
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      navigation.navigate("Transporte2", {
                        transporteDraft,
                        returnToKey: route.key,
                      })
                    }
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 100,
                      backgroundColor: theme.colors.purple,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.surface,
                        fontWeight: "700",
                        fontSize: 10,
                      }}
                    >
                      Editar
                    </Text>
                  </Pressable>
                </View>

                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "900",
                    marginTop: -30,
                  }}
                ></Text>

                {/* ✅ NOVO: Veículo / Motorista / Placa */}
                {transporteDraft?.provider?.veiculo ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Veículo:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.provider.veiculo}
                    </Text>
                  </Text>
                ) : null}

                {transporteDraft?.provider?.motorista ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Motorista:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.provider.motorista}
                    </Text>
                  </Text>
                ) : null}

                {transporteDraft?.provider?.placa ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Placa:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.provider.placa}
                    </Text>
                  </Text>
                ) : null}

                {transporteDraft?.schedule?.selectedTime ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Horário:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.schedule.selectedTime}
                    </Text>
                  </Text>
                ) : null}

                {transporteDraft?.toAddress ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Destino:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.toAddress}
                    </Text>
                  </Text>
                ) : null}

                {transporteDraft?.reason ? (
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontWeight: "900",
                      marginTop: 6,
                    }}
                  >
                    Motivo:{" "}
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontWeight: "700",
                      }}
                    >
                      {transporteDraft.reason}
                    </Text>
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/**============================================================================ */}

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
                onPress={() =>
                  navigation.navigate("Transporte2", {
                    transporteDraft,
                    returnToKey: route.key,
                  })
                }
                style={{ backgroundColor: theme.colors.purple }}
              >
                <MiniIconBox>
                  <Ionicons
                    name="car-outline"
                    size={28}
                    color={theme.colors.surface}
                  />
                </MiniIconBox>

                <MiniText
                  numberOfLines={2}
                  style={{ color: theme.colors.surface }}
                >
                  Transporte
                </MiniText>
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
        onClose={closeEspecialidadeSheet}
        availability={
          sheetEspecialidade ? specialtyAvailability[sheetEspecialidade] : null
        }
        doctorName={sheetEspecialidade}
        theme={theme}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedHour={selectedHour}
        setSelectedHour={setSelectedHour}
        onConfirm={(payload) => {
          setEspecialidadeAgendada(payload.doctorName);
          setDataAgendada(payload.date);
          setHoraAgendada(payload.hour);
          setSelectedEspecialidade(payload.doctorName);
          closeEspecialidadeSheet();
        }}
      />

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
