import { styled } from "styled-components/native";

export const Overlay = styled.View`
  flex: 1;
  background: rgba(0,0,0,0.35);
  align-items: center;
  justify-content: center;
  padding: 18px;
`;

export const Box = styled.View`
  width: 290px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.purple};
  padding: 14px;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Title = styled.Text`
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  width: 230px;
`;

export const Close = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
`;

export const SearchRow = styled.View`
  margin-top: 10px;
  flex-direction: row;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Map = styled.View`
  margin-top: 12px;
  height: 260px;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
`;
