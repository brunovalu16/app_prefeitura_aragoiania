import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
`;

export const HeaderLogo = styled.Text`
  text-align: center;
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 800;
`;

export const Card = styled.View`
  margin: 18px 18px 0 18px;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
`;

export const Label = styled.Text`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 10px;
  margin-bottom: 6px;
`;

export const Input = styled.TextInput`
  height: 34px;
  border-radius: 8px;
  background: #F3F4F6;
  padding: 0 12px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;

export const GridRow = styled.View`
  flex-direction: row;
  margin-top: 10px;
`;

export const Mini = styled.TextInput`
  flex: 1;
  height: 34px;
  border-radius: 8px;
  background: #fff;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding: 0 12px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
`;

export const SendWrap = styled.View`
  align-items: flex-end;
  margin-top: 10px;
`;
