import { styled } from "styled-components/native";

export const Card = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  min-height: 70px;
  max-height: 70px;
  justify-content: space-between;
  background: #fff;
  border-radius: 15px;
  padding: 14px 16px;
  margin-bottom: 5px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

export const Left = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

export const Right = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 14px;
  font-weight: 800;
  max-width: 220px;
`;

export const Subtitle = styled.Text`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
`;
