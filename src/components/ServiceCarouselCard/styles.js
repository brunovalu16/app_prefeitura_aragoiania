import { styled } from "styled-components/native";

export const Card = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.purple};
  border-radius: 18px;
  height: 340px;
  min-width: 280;
  padding: 20px;
  justify-content: space-between;
`;

export const LogoWrap = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const Logo = styled.Image.attrs({
  resizeMode: "contain",
})`
  width: 140px;
  height: 140px;
  margin-bottom: -45
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 20px;
  font-weight: 500;
  text-transform: uppercase;
  line-height: 25px;
  text-align: center;
  padding-bottom: 45;
`;
