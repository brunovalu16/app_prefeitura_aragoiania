import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Top = styled.View`
  padding: 34px 18px 10px 18px;
`;
