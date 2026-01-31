import { ScrollView, View } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Badge,
  BadgeText,
  Container,
  Grid,
  HeaderTitle,
  Tile,
  TileIcon,
  TileIconIcon,
  TileText,
} from "./styles";

export default function SolicitarSaude({ navigation }) {
  const theme = useTheme();

  const items = [
    {
      id: "telemedicina",
      label: "Saúde digital\ntelemedicina",
      icon: "videocam-outline",
      badge: "24h",
      onPress: () => navigation.navigate("SolicitarSaudeForm"),
    },

    {
      id: "clinicas",
      label: "Exames e\nconsultas",
      icon: "medkit-outline",
      onPress: () => navigation.navigate("Exameseconsultas"),
    },
    {
      id: "agendamento",
      label: "Agendamento\nNovamed",
      icon: "calendar-outline",
      onPress: () => {},
    },
    {
      id: "exames",
      label: "Exames\nlaboratoriais",
      icon: "flask-outline",
      onPress: () => {},
    },
    {
      id: "psicologia",
      label: "Psicologia online",
      icon: "heart-outline",
      onPress: () => {},
    },
    {
      id: "Transporte",
      label: "Transporte",
      icon: "car-outline",
      onPress: () => navigation.navigate("Transporte"),
    },
  ];

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
            paddingBottom: 20,
            alignSelf: "center",
          }}
        >
          <HeaderTitle style={{ color: theme.colors.cinza }}>
            O que você precisa hoje?
          </HeaderTitle>
        </View>

        <Grid>
          {items.map((item) => (
            <Tile
              key={item.id}
              activeOpacity={0.9}
              onPress={item.onPress}
              highlight={item.highlight}
            >
              {item.badge ? (
                <Badge>
                  <BadgeText>{item.badge}</BadgeText>
                </Badge>
              ) : null}

              <TileIcon>
                <TileIconIcon
                  name={item.icon}
                  color={item.highlight ? "#fff" : undefined}
                />
              </TileIcon>

              <TileText
                numberOfLines={2}
                style={{ color: item.highlight ? "#fff" : undefined }}
              >
                {item.label}
              </TileText>
            </Tile>
          ))}
        </Grid>
      </Container>
    </ScrollView>
  );
}
