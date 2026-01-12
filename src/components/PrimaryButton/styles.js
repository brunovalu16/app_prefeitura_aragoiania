import { styled } from "styled-components/native";

export const Btn = styled.TouchableOpacity`
  margin-top: 50px;
  height: 42px;
  max-width: 200px;
  min-width: 200px;
  align-self: center;
  border-radius: 40px;
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.xl}px;
`;


export const Txt = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.md}px;
`;