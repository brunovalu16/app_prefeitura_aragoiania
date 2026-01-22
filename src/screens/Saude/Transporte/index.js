import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  CepText,
  Container,
  DistanceRow,
  DistanceText,
  DividerLine,
  FavCol,
  FavHeart,
  FavLabel,
  IconsRow,
  LocationBar,
  LocationBarLeft,
  LocationBarText,
  LocationBarX,
  PageBtn,
  PageNumberBox,
  PageNumberText,
  Pagination,
  PhoneLink,
  PhonesCol,
  PhoneText,
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

  // ✅ cards (fictício por enquanto)
  const items = useMemo(
    () => [
      {
        id: "1",
        categoria: "Remoção",
        nome: "Anjos da Saude Uti Movel",
        endereco: "R Araxa, 0 - Cardoso, Aparecida de Goiania/ GO",
        cep: "CEP 74933 115",
        phones: ["62 3582 7187", "62 3921 3200"],
        km: "7,808 km",
      },
      {
        id: "2",
        categoria: "Remoção",
        nome: "Flashmed Uti Movel",
        endereco: "R C 32, 184 - Jardim America, Goiania/ GO",
        cep: "CEP 74265 220",
        phones: ["62 3093 3100"],
        km: "10,775 km",
      },
      {
        id: "3",
        categoria: "Remoção",
        nome: "Lideranca Uti Movel",
        endereco:
          "R Sr 1, 308 - Residencial Santa Rita - 4a Etapa, Aparecida de Goiania/ GO",
        cep: "CEP 74370 764",
        phones: ["62 3921 3200", "62 98108 2000"],
        km: "12,350 km",
      },
    ],
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

  // ✅ seleção do card
  const [selectedTransportId, setSelectedTransportId] = useState(null);

  // paginação simples (mock)
  const PAGE_SIZE = 2;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  function callPhone(phone) {
    const digits = String(phone).replace(/\D/g, "");
    if (!digits) return;
    Linking.openURL(`tel:${digits}`).catch(() =>
      Alert.alert("Ops", "Não foi possível abrir o discador."),
    );
  }

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

      if (!selectedTransportId) {
        Alert.alert("Atenção", "Selecione um transporte (card).");
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

      const provider = items.find((x) => x.id === selectedTransportId);
      if (!provider) {
        Alert.alert("Erro", "Transporte selecionado inválido.");
        return;
      }

      const payload = {
        fromAddress: userAddress || "",
        toAddress: String(toAddress || "").trim(),
        reason: String(reason || "").trim(),
        provider: {
          id: provider.id,
          categoria: provider.categoria,
          nome: provider.nome,
          endereco: provider.endereco,
          cep: provider.cep,
          phones: provider.phones,
          km: provider.km,
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
                        color={
                          selected
                            ? theme.colors.cinzaclaro
                            : theme.colors.cinzaclaro
                        }
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : null}
        </View>

        {/* Lista de cards (selecionável) */}
        {/* ✅ Texto antes dos cards */}
        <Text
          style={{
            color: theme.colors.cinza,
            fontWeight: "800",
            marginTop: 6,
            marginBottom: 10,
            alignSelf: "center",
          }}
        >
          Escolha o transporte mais próximo do seu endereço.
        </Text>

        {/* Lista de cards (clicável no card inteiro) */}
        {pageItems.map((it) => {
          const active = selectedTransportId === it.id;

          return (
            <TouchableOpacity
              key={it.id}
              activeOpacity={0.9}
              onPress={() =>
                setSelectedTransportId((prev) =>
                  prev === it.id ? null : it.id,
                )
              } // ✅ também permite desmarcar o card
              style={{ marginBottom: 12 }}
            >
              <Card
                style={{
                  borderWidth: active ? 2 : 0,
                  borderColor: active ? theme.colors.purple : "transparent",
                }}
              >
                <CardTop>
                  <SubtitleText>{it.categoria}</SubtitleText>

                  <CardTopRight>
                    <FavCol>
                      {/* ✅ Ícone continua funcionando, mas agora é opcional */}
                      <FavHeart
                        onPress={() =>
                          setSelectedTransportId((prev) =>
                            prev === it.id ? null : it.id,
                          )
                        }
                      >
                        <Ionicons
                          name={active ? "checkmark-circle" : "ellipse-outline"}
                          size={18}
                          color={
                            active ? theme.colors.purple : theme.colors.text
                          }
                        />
                      </FavHeart>
                      <FavLabel>
                        {active ? "Selecionado" : "Selecionar"}
                      </FavLabel>
                    </FavCol>
                  </CardTopRight>
                </CardTop>

                <CardHeader>
                  <CardHeaderLeft>
                    <CardTitle
                      numberOfLines={1}
                      style={{ color: theme.colors.purple }}
                    >
                      {it.nome}
                    </CardTitle>

                    <IconsRow>
                      <Ionicons
                        name="medical-outline"
                        size={18}
                        color={theme.colors.purple}
                      />
                      <Ionicons
                        name="car-outline"
                        size={18}
                        color={theme.colors.purple}
                      />
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={theme.colors.purple}
                      />
                    </IconsRow>
                  </CardHeaderLeft>
                </CardHeader>

                <DividerLine />

                <CardBody>
                  <RowBetween>
                    <PhonesCol>
                      <SubtitleText style={{ marginBottom: 6 }}>
                        {it.endereco}
                      </SubtitleText>

                      <CepText>{it.cep}</CepText>

                      <ViewSpace />

                      {it.phones.map((p) => (
                        <PhoneLink
                          key={p}
                          onPress={() => callPhone(p)}
                          // ✅ impede o clique do telefone de "marcar/desmarcar" o card
                          onPressIn={(e) => e.stopPropagation?.()}
                        >
                          <PhoneText>{p}</PhoneText>
                        </PhoneLink>
                      ))}
                    </PhonesCol>

                    <DistanceRow>
                      <Ionicons
                        name="location"
                        size={16}
                        color={theme.colors.purple}
                      />
                      <DistanceText>{it.km}</DistanceText>
                    </DistanceRow>
                  </RowBetween>
                </CardBody>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Paginação */}
        <Pagination>
          <PageBtn
            onPress={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={theme.colors.purple}
            />
          </PageBtn>

          <PageNumberBox>
            <PageNumberText>
              {page} / {totalPages}
            </PageNumberText>
          </PageNumberBox>

          <PageBtn
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.purple}
            />
          </PageBtn>
        </Pagination>

        {/* ✅ Botão Salvar */}
        <SaveButton onPress={handleSave}>
          <SaveButtonText>Salvar</SaveButtonText>
        </SaveButton>
      </Container>
    </ScrollView>
  );
}
