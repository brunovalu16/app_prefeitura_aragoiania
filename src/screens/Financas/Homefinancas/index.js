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
    // 1️⃣ IMPOSTOS (primeiro)
    {
      id: "impostos",
      title: "Impostos",
      items: [
        {
          id: "iptu",
          label: "IPTU",
          icon: "home-outline",
          badge: "Imposto",
          onPress: () => {},
        },
        {
          id: "iss",
          label: "ISS / ISSQN",
          icon: "briefcase-outline",
          badge: "Imposto",
          onPress: () => {},
        },
        {
          id: "itbi",
          label: "ITBI",
          icon: "swap-horizontal-outline",
          badge: "Imposto",
          onPress: () => {},
        },
      ],
    },

    // 2️⃣ TAXAS
    {
      id: "taxas",
      title: "Taxas",
      items: [
        {
          id: "tfl",
          label: "TFL / TFLF\nFuncionamento",
          icon: "business-outline",
          onPress: () => {},
        },
        {
          id: "vigilancia",
          label: "Vigilância\nSanitária",
          icon: "medkit-outline",
          onPress: () => {},
        },
        {
          id: "incendio",
          label: "Taxa de\nIncêndio",
          icon: "flame-outline",
          onPress: () => {},
        },
        {
          id: "publicidade",
          label: "Publicidade /\nLetreiros",
          icon: "megaphone-outline",
          onPress: () => {},
        },
        {
          id: "ambiental",
          label: "Licenciamento\nAmbiental",
          icon: "leaf-outline",
          onPress: () => {},
        },
        {
          id: "solo",
          label: "Uso de Solo /\nEspaço Público",
          icon: "map-outline",
          onPress: () => {},
        },
      ],
    },

    // 3️⃣ SERVIÇOS
    {
      id: "servicos",
      title: "Serviços",
      items: [
        {
          id: "lixo",
          label: "TRSD\nTaxa de Lixo",
          icon: "trash-outline",
          onPress: () => {},
        },
        {
          id: "iluminacao",
          label: "Iluminação\nPública",
          icon: "bulb-outline",
          onPress: () => {},
        },
        {
          id: "expediente",
          label: "Taxa de\nExpediente",
          icon: "document-text-outline",
          onPress: () => {},
        },
        {
          id: "cemiterio",
          label: "Taxa de\nCemitério",
          icon: "skull-outline",
          onPress: () => {},
        },
      ],
    },

    // 4️⃣ ALVARÁS
    {
      id: "alvaras",
      title: "Alvarás",
      items: [
        {
          id: "alvara-func",
          label: "Alvará de\nFuncionamento",
          icon: "checkmark-circle-outline",
          onPress: () => {},
        },
        {
          id: "alvara-obra",
          label: "Alvará de\nConstrução",
          icon: "construct-outline",
          onPress: () => {},
        },
        {
          id: "habite",
          label: "Habite-se",
          icon: "home-outline",
          onPress: () => {},
        },
        {
          id: "eventos",
          label: "Alvará para\nEventos",
          icon: "calendar-outline",
          onPress: () => {},
        },
        {
          id: "ambulante",
          label: "Comércio\nAmbulante",
          icon: "storefront-outline",
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
