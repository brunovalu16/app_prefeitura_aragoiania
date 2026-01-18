import { styled } from "styled-components/native";

export const Card = styled.TouchableOpacity`
  background-color: #fff;
  border-radius: 14px;
  padding: 14px 14px;
  margin-bottom: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  elevation: 2;
`;

export const Left = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  gap: 10px;
`;

export const Title = styled.Text`
  font-size: 14px;
  font-weight: 800;
  color: #3a0b6c;
  flex: 1;
`;

export const Subtitle = styled.Text`
  font-size: 12px;
  color: #6b7280;
`;
