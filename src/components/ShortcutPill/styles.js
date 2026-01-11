import { styled } from "styled-components/native";

export const Pill = styled.TouchableOpacity`
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  background: ${({ active }) => (active ? "#ffffff" : "#F2F4FF")};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

export const Label = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 600;
`;
