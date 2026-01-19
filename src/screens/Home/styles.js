import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Top = styled.View`
  padding: 34px 18px 10px 18px;
`;

/* ✅ área que limita quantos cards aparecem */
export const ListArea = styled.View`
  height: 170px; /* ~2 cards (ajuste fino se precisar) */
  margin-top: -5px;
`;

/* ✅ Scroll só da lista */
export const ListScroll = styled.ScrollView.attrs({
  contentContainerStyle: { paddingBottom: 15 },
})`
  flex: 1;
`;
