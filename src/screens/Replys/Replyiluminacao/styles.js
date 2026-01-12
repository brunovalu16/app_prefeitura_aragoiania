import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
`;

export const Card = styled.View`
  margin: 10px 18px 0 18px;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const AreaTitle = styled.Text`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 10px;
`;

export const Divider = styled.View`
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 12px 0;
`;

export const SectionTitle = styled.Text`
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 6px;
  margin-top: 12px;
`;

export const ValueText = styled.Text`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 20px;
`;

export const Chip = styled.View`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  background: ${({ theme }) => theme.colors.purple};
  padding: 8px 10px;
  border-radius: 999px;
`;

export const ChipText = styled.Text`
  color: #fff;
  font-weight: 800;
  margin-left: 6px;
  font-size: 12px;
`;

export const FooterHint = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PreviewGrid = styled.View`
  margin-top: 10px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

export const PreviewItem = styled.View`
  width: 84px;
  height: 84px;
  border-radius: 12px;
  overflow: hidden;
`;

export const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  margin-top: 10px;
  gap: 10px;
`;

export const SmallAction = styled.TouchableOpacity`
  flex: 1;
  height: 32px;          /* 👈 menor */
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
  margin-left: 6px;
`;
