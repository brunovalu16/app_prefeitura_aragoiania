import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
`;

export const SelectBox = styled.TouchableOpacity`
  margin: 18px 18px 0 18px;
  height: 36px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.purple};
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
`;

export const SelectText = styled.Text`
  margin-left: 10px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.white ?? "#fff"};
  flex: 1;
`;

export const SelectIconArea = styled.View`
  margin-left: 10px;
`;

/* ✅ Dropdown com altura fixa (≈ 8 opções visíveis) */
export const Dropdown = styled.View`
  margin: 6px 18px 0 18px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.white ?? "#fff"};
  padding: 8px 12px;

  max-height: 320px;
`;

export const Option = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
`;

export const OptionText = styled.Text`
  margin-left: 10px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
  flex: 1;
`;
