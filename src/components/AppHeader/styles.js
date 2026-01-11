import { styled } from "styled-components";

export const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
  background: transparent;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

export const Center = styled.View`
  flex: 1;
  align-items: center;
`;

export const Title = styled.Text`
  font-size: ${({ theme }) => theme.font.lg}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;
