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

export const Banner = styled.View`
  margin: 18px 18px 10px 18px;
  height: 36px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.purple};
  flex-direction: row;
  align-items: center;
  padding: 0 12px;
`;

export const BannerText = styled.Text`
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  margin-left: 10px;
`;

export const Card = styled.View`
  margin: 0 18px;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
`;

export const Item = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 0;
`;

export const ItemText = styled.Text`
  margin-left: 10px;
  color: ${({ theme, red }) => (red ? theme.colors.red : theme.colors.textMuted)};
  font-weight: ${({ red }) => (red ? 800 : 700)};
  font-size: 12px;
`;
