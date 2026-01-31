import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  height: 140px;
`;

export const HeaderContent = styled.View`
  flex: 1;
  padding: 18px 16px;
  padding-top: 44px;
  flex-direction: row;
  align-items: center;
`;

export const BackBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-top: -50;
`;

export const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 15px;
  font-weight: 700;
  margin-top: -50;
`;

export const Body = styled.View`
  flex: 1;
  margin-top: -34px;
  padding: 0 14px;
`;

export const Card = styled.View`
  background-color: ${({ theme }) =>
    theme.colors.card || theme.colors.background};
  border-radius: 18px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

/* títulos */
export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
`;

/* opções */
export const OptionRow = styled.TouchableOpacity`
  min-height: 46px;
  height: auto;

  border-radius: 12px;
  border-width: 0.5px;
  border-color: ${({ theme }) => theme.colors.purple};

  padding: 10px 12px;

  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  margin-top: 10px;
`;

export const OptionLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;

  flex: 1;
  padding-right: 10px;
`;

export const OptionText = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 13px;
  font-weight: 700;
`;

export const DividerSpace = styled.View`
  height: 16px;
`;

/* grid serviços */
export const Grid = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const MiniCard = styled.TouchableOpacity`
  width: 23.5%;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.cinzaclaro};
  background-color: ${({ theme }) =>
    theme.colors.card || theme.colors.background};

  padding: 10px 8px;
  align-items: center;
  justify-content: flex-start;

  margin-top: 10px;
`;

export const MiniIconBox = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 10px;

  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

export const MiniText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.cinza};
  font-size: 8px;
  font-weight: 700;
  line-height: 13px;
`;

// accordion

export const SelectedPill = styled.View`
  max-width: 120px;
  padding: 3px 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.cinzaclaro};
`;

export const SelectedPillText = styled.Text`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.cinza};
`;

/**
 * ✅ Accordion com “view de 5 itens” (altura fixa + rolagem vertical)
 * Ajuste fino: 5 itens ~ 5 * 44 = 220px (aprox)
 */
export const AccordionList = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})`
  max-height: 220px;
  margin-top: 8px;
  margin-bottom: 8px;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.cinzaclaro};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const AccordionItem = styled.TouchableOpacity`
  padding: 12px 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.cinzaclaro};
`;

export const AccordionRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const AccordionText = styled.Text`
  margin-left: 10px;
  flex: 1;

  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.cinza};
`;

//AGENDA DE TRANSPORTE

export const FieldLabel = styled.Text`
  margin-top: 10px;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.purple};
`;

export const FieldInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.textSecondary,
}))`
  height: 44px;
  border-radius: 12px;
  padding: 0 12px;
  margin-bottom: 10%;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};

  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const Tile = styled.TouchableOpacity`
  background: ${({ highlight, theme }) =>
    highlight ? theme.colors.purple : theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  align-items: center;
  justify-content: center;
`;
