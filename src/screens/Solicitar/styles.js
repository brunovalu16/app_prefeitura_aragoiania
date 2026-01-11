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

export const AreaTitle = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 10px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const FieldLabel = styled.Text`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 12px;
  margin-bottom: 6px;
`;

export const Box = styled.View`
  height: 68px;
  border-radius: 10px;
  background: #F3F4F6;
`;

export const Helper = styled.Text`
  font-size: 9px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px;
  line-height: 12px;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  margin-top: 10px;
  justify-content: space-between;
`;

export const SmallAction = styled.TouchableOpacity`
  flex: 1;
  height: 34px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.purple};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const SmallActionText = styled.Text`
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  margin-left: 8px;
`;

export const CepRow = styled.View`
  margin-top: 12px;
`;

export const CepInput = styled.TextInput`
  height: 34px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.red};
  padding: 0 12px;
  color: #fff;
  font-weight: 800;
`;
