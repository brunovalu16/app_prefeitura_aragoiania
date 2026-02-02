import { ScrollView, View } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Badge,
  BadgeText,
  Container,
  Grid,
  HeaderTitle,
  SectionTitle,
  Tile,
  TileIcon,
  TileIconIcon,
  TileText,
} from "./styles";

export default function Homefinancas({ navigation }) {
  const theme = useTheme();

  const sections = [
    {
      id: "impostos",
      title: "",
      items: [
        {
          id: "iptu",
          label: "Receitas",
          icon: "cash-outline", // ✅ Receitas (💲)
          badge: "Imposto",
          onPress: () => {},
        },
        {
          id: "iss",
          label: "despesas",
          icon: "remove-circle-outline", // ✅ Despesas (➖)
          badge: "Imposto",
          onPress: () => {},
        },
        {
          id: "itbi",
          label: "Contratos",
          icon: "document-outline", // ✅ Contratos (📄)
          badge: "Imposto",
          onPress: () => {},
        },
      ],
    },

    {
      id: "taxas",
      title: "",
      items: [
        {
          id: "tfl",
          label: "Licitações",
          icon: "hammer-outline", // ✅ Licitações (martelo)
          onPress: () => {},
        },
        {
          id: "vigilancia",
          label: "Dúvidas\nNota NF-e",
          icon: "help-circle-outline", // ✅ Dúvidas (?)
          onPress: () => {},
        },
        {
          id: "incendio",
          label: "Folha de\npagamento",
          icon: "person-outline", // ✅ Folha de pagamento (usuário)
          onPress: () => {},
        },
        {
          id: "publicidade",
          label: "Ouvidoria\nmunicipal",
          icon: "headset-outline", // ✅ Ouvidoria (headset)
          onPress: () => {},
        },
        {
          id: "ambiental",
          label: "Carta de\nserviços",
          icon: "ticket-outline", // ✅ Carta de serviços (ticket)
          onPress: () => {},
        },
        {
          id: "solo",
          label: "Concursos",
          icon: "search-outline", // ✅ Concursos (lupa)
          onPress: () => {},
        },
      ],
    },

    {
      id: "servicos",
      title: "",
      items: [
        {
          id: "lixo",
          label: "relatórios",
          icon: "stats-chart-outline", // ✅ Relatórios (gráfico)
          onPress: () => {},
        },
        {
          id: "iluminacao",
          label: "Nota\nfiscal",
          icon: "receipt-outline", // ✅ Nota fiscal (recibo)
          onPress: () => {},
        },
        {
          id: "expediente",
          label: "Consulta de\nprotocolo",
          icon: "link-outline", // ✅ Consulta de protocolo (link)
          onPress: () => {},
        },
        {
          id: "cemiterio",
          label: "Taxa de\nCemitério",
          icon: "document-text-outline", // (extra) se quiser manter algo “documento”
          onPress: () => {},
        },
      ],
    },

    {
      id: "alvaras",
      title: "",
      items: [
        {
          id: "alvara-func",
          label: "Alvará de\nFuncionamento",
          icon: "document-text-outline",
          onPress: () => {},
        },
        {
          id: "alvara-obra",
          label: "Alvará de\nConstrução",
          icon: "document-text-outline",
          onPress: () => {},
        },
        {
          id: "habite",
          label: "Habite-se",
          icon: "document-text-outline",
          onPress: () => {},
        },
        {
          id: "eventos",
          label: "Alvará para\nEventos",
          icon: "document-text-outline",
          onPress: () => {},
        },
        {
          id: "ambulante",
          label: "Comércio\nAmbulante",
          icon: "document-text-outline",
          onPress: () => {},
        },
      ],
    },
  ];

  const renderTile = (item) => (
    <Tile key={item.id} activeOpacity={0.9} onPress={item.onPress}>
      {item.badge ? (
        <Badge>
          <BadgeText>{item.badge}</BadgeText>
        </Badge>
      ) : null}

      <TileIcon>
        <TileIconIcon name={item.icon} />
      </TileIcon>

      <TileText numberOfLines={2}>{item.label}</TileText>
    </Tile>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 10,
            alignSelf: "center",
          }}
        >
          <HeaderTitle style={{ color: theme.colors.cinza }}>
            Escolha o serviço que você deseja.
          </HeaderTitle>
        </View>

        {sections.map((section) => (
          <View key={section.id} style={{ marginBottom: 12 }}>
            <SectionTitle>{section.title}</SectionTitle>

            <Grid>{section.items.map(renderTile)}</Grid>
          </View>
        ))}
      </Container>
    </ScrollView>
  );
}
