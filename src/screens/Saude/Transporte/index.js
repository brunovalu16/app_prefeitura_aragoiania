import { Ionicons } from "@expo/vector-icons";
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

import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderLeft,
  CardTitle,
  CardTop,
  CardTopRight,
  Container,
  DividerLine,
  FavCol,
  FavLabel,
  IconsRow,
  LocationBar,
  LocationBarLeft,
  LocationBarText,
  LocationBarX,
  RowBetween,
  SaveButton,
  SaveButtonText,
  SubtitleText,
  ViewSpace,
} from "./styles";

import {
  subscribeRequests,
  updateRequestTransport,
} from "../../../services/requests";
import { getAuthUserId } from "../../../services/userId";
import { getUserAddress } from "../../../services/userProfile";

function formatCreatedAt(createdAt) {
  try {
    const ms =
      createdAt?.toMillis?.() ??
      (typeof createdAt === "number" ? createdAt : null) ??
      Date.now();
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} ${hh}:${mi}`;
  } catch {
    return "";
  }
}

export default function Transporte({ navigation }) {
  const theme = useTheme();

  // ✅ opções de veículos (accordion)
  const vehicleOptions = useMemo(
    () => [
      { id: "ambulancia", label: "Ambulância" },
      { id: "pequeno", label: "Veículo pequeno" },
      { id: "pcd", label: "Veículo para deficiente físico" },
      { id: "van", label: "Van" },
    ],
    [],
  );

  // ✅ horários mockados por tipo de veículo
  // ✅ horários mockados (5 horários a partir de 05:00) - para TODOS
  const vehicleTimeOptions = useMemo(
    () => ({
      ambulancia: ["05:00", "06:00", "07:00", "08:00", "09:00"],
      pequeno: ["05:00", "06:00", "07:00", "08:00", "09:00"],
      pcd: ["05:00", "06:00", "07:00", "08:00", "09:00"],
      van: ["05:00", "06:00", "07:00", "08:00", "09:00"],
    }),
    [],
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // ✅ accordion de horários (aparece só quando tiver card selecionado)
  const [timeAccordionOpen, setTimeAccordionOpen] = useState(false);

  // ✅ horário selecionado
  const [selectedTime, setSelectedTime] = useState(null);

  // ✅ lista de horários do veículo selecionado
  const availableTimes = selectedVehicleId
    ? vehicleTimeOptions[selectedVehicleId] || []
    : [];

  useEffect(() => {
    setSelectedTime(null);
    setTimeAccordionOpen(false);
  }, [selectedVehicleId]);

  // ✅ dados fictícios por tipo de veículo (motorista + infos)
  const vehicleMockData = useMemo(
    () => ({
      ambulancia: {
        vehicleName: "Ambulância Municipal 01",
        driverName: "Carlos Henrique",
        plate: "QWE-1A23",
      },
      pequeno: {
        vehicleName: "Veículo Pequeno 02",
        driverName: "João Pedro",
        plate: "ABC-4D56",
      },
      pcd: {
        vehicleName: "PCD Adaptado 01",
        driverName: "Mariana Souza",
        plate: "PCD-7F89",
      },
      van: {
        vehicleName: "Van Municipal 03",
        driverName: "Rafael Lima",
        plate: "VAN-0H12",
      },
    }),
    [],
  );

  // ✅ endereço do cadastro (users/{uid}.endereco)
  const [userId, setUserId] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);

  // ✅ inputs
  const [toAddress, setToAddress] = useState("");
  const [reason, setReason] = useState("");

  // ✅ solicitações SAÚDE (accordion)
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [healthRequests, setHealthRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // ✅ accordion do veículo
  const [vehicleAccordionOpen, setVehicleAccordionOpen] = useState(false);

  // ✅ veículo selecionado

  const selectedVehicleInfo = selectedVehicleId
    ? vehicleMockData[selectedVehicleId]
    : null;

  useEffect(() => {
    const uid = getAuthUserId();
    setUserId(uid || null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAddress() {
      try {
        setLoadingAddress(true);
        if (!userId) return;

        const addr = await getUserAddress(userId);
        if (!mounted) return;
        setUserAddress(addr || "");
      } catch (e) {
        console.log("❌ getUserAddress:", e?.message);
      } finally {
        if (mounted) setLoadingAddress(false);
      }
    }

    loadAddress();
    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoadingRequests(false);
      setHealthRequests([]);
      return;
    }

    setLoadingRequests(true);

    const unsub = subscribeRequests({
      userId,
      max: 200,
      onChange: (list) => {
        const all = Array.isArray(list) ? list : [];

        const onlySaude = all
          .filter((r) => r?.areaId === "saude")
          .filter((r) => r?.isHidden !== true);

        setHealthRequests(onlySaude);
        setLoadingRequests(false);

        // se a request selecionada sumiu, limpa
        if (
          selectedRequestId &&
          !onlySaude.some((r) => r.id === selectedRequestId)
        ) {
          setSelectedRequestId(null);
        }
      },
    });

    return () => unsub?.();
  }, [userId, selectedRequestId]);

  async function handleSave() {
    try {
      if (!userId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      if (!selectedRequestId) {
        Alert.alert("Atenção", "Selecione uma solicitação de Saúde.");
        return;
      }

      if (!selectedVehicleId) {
        Alert.alert("Atenção", "Selecione um tipo de veículo.");
        return;
      }

      if (!String(toAddress || "").trim()) {
        Alert.alert("Atenção", "Preencha o campo “Para qual endereço”.");
        return;
      }

      if (!String(reason || "").trim()) {
        Alert.alert("Atenção", "Preencha o campo “Motivo”.");
        return;
      }

      const info = vehicleMockData[selectedVehicleId];
      if (!info) {
        Alert.alert("Erro", "Veículo selecionado inválido.");
        return;
      }
      if (!selectedTime) {
        Alert.alert("Atenção", "Selecione um horário disponível.");
        return;
      }

      const payload = {
        fromAddress: userAddress || "",
        toAddress: String(toAddress || "").trim(),
        reason: String(reason || "").trim(),
        provider: {
          id: selectedVehicleId,
          tipo: selectedVehicleId,
          label:
            vehicleOptions.find((v) => v.id === selectedVehicleId)?.label ||
            "Veículo",
          veiculo: info.vehicleName,
          motorista: info.driverName,
          placa: info.plate,
        },
        schedule: {
          selectedTime,
          availableTimes,
        },
        createdAtMs: Date.now(),
      };

      await updateRequestTransport({
        requestId: selectedRequestId,
        transporteData: payload,
      });

      Alert.alert("Salvo!", "Transporte vinculado com sucesso.");

      // ✅ reseta a navegação para Recebesolicitacoes
      navigation.reset({
        index: 0,
        routes: [{ name: "Recebesolicitacoes" }],
      });
    } catch (e) {
      console.log("❌ handleSave Transporte:", e?.code, e?.message);
      Alert.alert("Erro", "Não foi possível salvar o transporte.");
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        {/* 🔎 Barra de localização (endereço do cadastro) */}
        <LocationBar>
          <LocationBarLeft>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.purple}
            />
            <LocationBarText numberOfLines={1}>
              {loadingAddress
                ? "Carregando endereço..."
                : userAddress || "Endereço não encontrado no cadastro"}
            </LocationBarText>
          </LocationBarLeft>

          <LocationBarX
            onPress={() => {
              setToAddress("");
              setReason("");
            }}
          >
            <Ionicons name="close" size={18} color={theme.colors.text} />
          </LocationBarX>
        </LocationBar>

        {/* ✅ Campos */}
        <View
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            backgroundColor: theme.colors.card || theme.colors.background,
            padding: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.cinza,
              fontWeight: "900",
              marginBottom: 8,
            }}
          >
            Qual o endereço de destino?
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
              value={toAddress}
              onChangeText={setToAddress}
              placeholder="Digite o destino..."
              placeholderTextColor={theme.colors.textSecondary}
              style={{ color: theme.colors.text, fontWeight: "700" }}
            />
          </View>

          <View style={{ height: 10 }} />

          <Text
            style={{
              color: theme.colors.cinza,
              fontWeight: "900",
              marginBottom: 8,
            }}
          >
            Motivo
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
              value={reason}
              onChangeText={setReason}
              placeholder="Ex: consulta, exame, retorno..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={{
                minHeight: 56,
                color: theme.colors.text,
                fontWeight: "700",
              }}
            />
          </View>
        </View>

        {/* ✅ Accordion - Minhas solicitações de Saúde */}
        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setAccordionOpen((v) => !v)}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: theme.colors.card || theme.colors.purple,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons
                name="medkit-outline"
                size={18}
                color={theme.colors.surface}
              />

              <Text style={{ color: theme.colors.surface, fontWeight: "900" }}>
                Esse transporte é para qual solicitação?
              </Text>
            </View>

            <Ionicons
              name={accordionOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.surface}
            />
          </TouchableOpacity>

          {accordionOpen ? (
            <View
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: theme.colors.purpleclaro,
              }}
            >
              {loadingRequests ? (
                <View style={{ padding: 14, alignItems: "center", gap: 10 }}>
                  <ActivityIndicator />
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Carregando solicitações...
                  </Text>
                </View>
              ) : !healthRequests.length ? (
                <View style={{ padding: 14 }}>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Você ainda não tem solicitações de Saúde.
                  </Text>
                </View>
              ) : (
                healthRequests.map((r) => {
                  const selected = selectedRequestId === r.id;

                  const title = r?.requestTitle || "SOLICITAÇÃO SAÚDE";
                  const status = String(r?.status || "analise").toUpperCase();
                  const when = formatCreatedAt(r?.createdAt);

                  const medico =
                    r?.saudeData?.medicoAgendado ||
                    r?.saudeData?.medicoSelecionado ||
                    r?.data?.medicoAgendado ||
                    r?.data?.medicoSelecionado ||
                    "";

                  const exame =
                    r?.saudeData?.exameSelecionado ||
                    r?.data?.exameSelecionado ||
                    "";

                  return (
                    <TouchableOpacity
                      key={r.id}
                      activeOpacity={0.9}
                      onPress={() =>
                        setSelectedRequestId((prev) =>
                          prev === r.id ? null : r.id,
                        )
                      }
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: selected
                          ? theme.colors.purple + "12"
                          : "transparent",
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={{
                            color: theme.colors.surface,
                            fontWeight: "900",
                          }}
                          numberOfLines={1}
                        >
                          {title}
                        </Text>

                        <Text
                          style={{
                            color: theme.colors.cinzaclaro,
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {status} • {when}
                        </Text>

                        {medico || exame ? (
                          <Text
                            style={{
                              color: theme.colors.textSecondary,
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {medico
                              ? `Médico: ${String(medico).split(" (")[0]}`
                              : ""}
                            {medico && exame ? " • " : ""}
                            {exame ? `Exame: ${exame}` : ""}
                          </Text>
                        ) : null}
                      </View>

                      <Ionicons
                        name={selected ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={theme.colors.cinzaclaro}
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : null}
        </View>

        {/* ✅ Accordion - Qual veículo? */}
        <View style={{ marginTop: 12, marginBottom: 12 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setVehicleAccordionOpen((v) => !v)}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              padding: 12,
              backgroundColor: theme.colors.card || theme.colors.purple,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons
                name="car-outline"
                size={18}
                color={theme.colors.surface}
              />

              <Text style={{ color: theme.colors.surface, fontWeight: "900" }}>
                Qual veículo você precisa?
              </Text>
            </View>

            <Ionicons
              name={vehicleAccordionOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.surface}
            />
          </TouchableOpacity>

          {vehicleAccordionOpen ? (
            <View
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: theme.colors.purpleclaro,
              }}
            >
              {vehicleOptions.map((opt) => {
                const selected = selectedVehicleId === opt.id;

                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      setSelectedVehicleId((prev) =>
                        prev === opt.id ? null : opt.id,
                      )
                    }
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: selected
                        ? theme.colors.purple + "12"
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{ color: theme.colors.surface, fontWeight: "900" }}
                    >
                      {opt.label}
                    </Text>

                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={theme.colors.cinzaclaro}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* ✅ Card aparece após escolher veículo */}
        {selectedVehicleInfo ? (
          <View style={{ marginTop: 4, marginBottom: 12 }}>
            <Card
              style={{
                borderWidth: 2,
                borderColor: theme.colors.purple,
              }}
            >
              <CardTop>
                <SubtitleText>Veículo selecionado</SubtitleText>

                <CardTopRight>
                  <FavCol>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.colors.purple}
                    />
                    <FavLabel>Confirmado</FavLabel>
                  </FavCol>
                </CardTopRight>
              </CardTop>

              <CardHeader>
                <CardHeaderLeft>
                  <CardTitle
                    numberOfLines={1}
                    style={{ color: theme.colors.purple }}
                  >
                    {selectedVehicleInfo.vehicleName}
                  </CardTitle>

                  <IconsRow>
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
                  </IconsRow>
                </CardHeaderLeft>
              </CardHeader>

              <DividerLine />

              <CardBody>
                <RowBetween>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Motorista:{" "}
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontWeight: "700",
                        }}
                      >
                        {selectedVehicleInfo.driverName}
                      </Text>
                    </Text>

                    <ViewSpace />

                    <Text
                      style={{ color: theme.colors.text, fontWeight: "800" }}
                    >
                      Placa:{" "}
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontWeight: "700",
                        }}
                      >
                        {selectedVehicleInfo.plate}
                      </Text>
                    </Text>
                  </View>
                </RowBetween>
              </CardBody>
            </Card>

            {/* ✅ Accordion - Horários disponíveis (só aparece após escolher veículo) */}
            {selectedVehicleInfo ? (
              <View style={{ marginTop: 0, marginBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setTimeAccordionOpen((v) => !v)}
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: theme.colors.card || theme.colors.purple,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                      name="time-outline"
                      size={18}
                      color={theme.colors.surface}
                    />
                    <Text
                      style={{ color: theme.colors.surface, fontWeight: "900" }}
                    >
                      Veja horários disponíveis
                    </Text>
                  </View>

                  <Ionicons
                    name={timeAccordionOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.colors.surface}
                  />
                </TouchableOpacity>

                {timeAccordionOpen ? (
                  <View
                    style={{
                      marginTop: 10,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: theme.colors.purpleclaro,
                    }}
                  >
                    {/* rolagem vertical dentro do accordion */}
                    <ScrollView
                      style={{ maxHeight: 220 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {!availableTimes.length ? (
                        <View style={{ padding: 14 }}>
                          <Text style={{ color: theme.colors.textSecondary }}>
                            Nenhum horário disponível no momento.
                          </Text>
                        </View>
                      ) : (
                        availableTimes.map((t) => {
                          const selected = selectedTime === t;

                          return (
                            <TouchableOpacity
                              key={t}
                              activeOpacity={0.9}
                              onPress={() =>
                                setSelectedTime((prev) =>
                                  prev === t ? null : t,
                                )
                              }
                              style={{
                                paddingVertical: 12,
                                paddingHorizontal: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: theme.colors.border,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: selected
                                  ? theme.colors.purple + "12"
                                  : "transparent",
                              }}
                            >
                              <Text
                                style={{
                                  color: theme.colors.surface,
                                  fontWeight: "900",
                                }}
                              >
                                {t}
                              </Text>

                              <Ionicons
                                name={
                                  selected
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                                }
                                size={20}
                                color={theme.colors.cinzaclaro}
                              />
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ✅ Botão Salvar */}
        <SaveButton onPress={handleSave}>
          <SaveButtonText>Salvar</SaveButtonText>
        </SaveButton>
      </Container>
    </ScrollView>
  );
}
