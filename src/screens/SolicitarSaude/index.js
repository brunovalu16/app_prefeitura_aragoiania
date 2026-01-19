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
  const items = [
    {
      id: "telemedicina",
      label: "Saúde digital\ntelemedicina",
      icon: "videocam-outline",
      badge: "24h",
      onPress: () => navigation.navigate("SolicitarSaudeForm"), // ✅ aponte pro seu formulário
    },
    {
      id: "reembolso",
      label: "Solicitar reembolso",
      icon: "cash-outline",
      onPress: () => {},
    },
    {
      id: "clinicas",
      label: "Exames e\nconsultas",
      icon: "location-outline",
      onPress: () => {
        console.log("✅ cliquei em Médicos e Clínicas");
        navigation.navigate("Exameseconsultas");
      },
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
  ];

  return (
    <Container>
      <HeaderTitle>O que você precisa hoje?</HeaderTitle>

      <Grid>
        {items.map((item) => (
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
        ))}
      </Grid>
    </Container>
  );
}
