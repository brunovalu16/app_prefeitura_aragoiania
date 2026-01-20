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
  margin-top: 10;
`;

export const AreaTitle = styled.Text`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 10px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const FieldLabel = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 12px;
  margin-bottom: 6px;
`;

export const DescriptionInput = styled.TextInput.attrs({
  multiline: true,
  textAlignVertical: "top", // 👈 aqui é o lugar certo
})`
  height: 150px;
  border-radius: 10px;
  background: #F3F4F6;
  padding: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 15px;
`;



export const Helper = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 6px;
  line-height: 16px;
  margin-bottom: 15;
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
  background: ${({ theme }) => theme.colors.textMuted2};
  padding: 0 12px;
  color: #3A0B6C;
  font-weight: 800;
`;

export const CounterRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 6px;
`;

export const CounterText = styled.Text`
  font-size: 12px;
  color: ${({ theme, error }) => (error ? theme.colors.red : theme.colors.textMuted)};
`;

export const PreviewGrid = styled.View`
  margin-top: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

export const PreviewItem = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

export const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const RemoveBadge = styled.TouchableOpacity`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.55);
  align-items: center;
  justify-content: center;
`;

export const RemoveBadgeText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  margin-top: -2px;
`;



export const AddressRow = styled.View`
  margin-top: 12px;
`;

export const AddressInput = styled.TextInput`
  min-height: 44px;
  border-radius: 10px;
  background: #F3F4F6;
  padding: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 15px;
`;

export const PostNumberInput = styled.TextInput`
  height: 44px;
  border-radius: 10px;
  background: #F3F4F6;
  padding: 0 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 15px;
`;
