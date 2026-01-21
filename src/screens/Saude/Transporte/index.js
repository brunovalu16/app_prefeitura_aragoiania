import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
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
} from "./styles";

export default function Transporte({ navigation }) {
  const theme = useTheme();

  // ✅ mock de dados (depois você troca pela sua lista real)
  const items = [
    {
      id: "1",
      categoria: "Remoção",
      nome: "Anjos da Saude Uti Movel",
      endereco: "R Araxa, 0 - Cardoso, Aparecida de Goiania/ GO",
      cep: "CEP 74933 115",
      phones: ["62 3582 7187", "62 3921 3200"],
      km: "7,808 km",
      tags: ["wheelchair", "man", "woman", "man", "accessibility"],
    },
    {
      id: "2",
      categoria: "Remoção",
      nome: "Flashmed Uti Movel",
      endereco: "R C 32, 184 - Jardim America, Goiania/ GO",
      cep: "CEP 74265 220",
      phones: ["62 3093 3100"],
      km: "10,775 km",
      tags: [],
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
      tags: [],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Container>
        {/* 🔎 Barra de localização */}
        <LocationBar>
          <LocationBarLeft>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.purple}
            />
            <LocationBarText numberOfLines={1}>
              R. Paraíso, 4 - Jardim Paraiso, Aparecida de Goiânia - …
            </LocationBarText>
          </LocationBarLeft>

          <LocationBarX onPress={() => {}}>
            <Ionicons name="close" size={18} color={theme.colors.text} />
          </LocationBarX>
        </LocationBar>

        {/* Lista */}
        {items.map((it) => (
          <Card key={it.id}>
            <CardTop>
              <SubtitleText>{it.categoria}</SubtitleText>

              <CardTopRight>
                <FavCol>
                  <FavHeart>
                    <Ionicons
                      name="heart-outline"
                      size={18}
                      color={theme.colors.text}
                    />
                  </FavHeart>
                  <FavLabel>Favoritar</FavLabel>
                </FavCol>
              </CardTopRight>
            </CardTop>

            <CardHeader>
              <CardHeaderLeft>
                <CardTitle numberOfLines={1}>{it.nome}</CardTitle>

                {/* Ícones azuis no print -> roxo do theme */}
                <IconsRow>
                  {/* Você pode trocar os ícones conforme precisar */}
                  <Ionicons
                    name="accessibility-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <Ionicons
                    name="man-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <Ionicons
                    name="woman-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <Ionicons
                    name="walk-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <Ionicons
                    name="wheelchair-outline"
                    size={18}
                    color={theme.colors.purple}
                  />
                  <Ionicons
                    name="medical-outline"
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
                    <PhoneLink key={p} onPress={() => {}}>
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
        ))}

        {/* Paginação */}
        <Pagination>
          <PageBtn>
            <Ionicons
              name="chevron-back"
              size={18}
              color={theme.colors.purple}
            />
          </PageBtn>

          <PageNumberBox>
            <PageNumberText>1</PageNumberText>
          </PageNumberBox>

          <PageBtn>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.purple}
            />
          </PageBtn>
        </Pagination>

        {/* ✅ Botão Salvar */}
        <SaveButton onPress={() => {}}>
          <SaveButtonText>Salvar</SaveButtonText>
        </SaveButton>
      </Container>
    </ScrollView>
  );
}

// helper simples (pra não poluir o styles)
function ViewSpace() {
  return <></>;
}
