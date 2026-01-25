import { styled } from "styled-components/native";

export const Backdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: flex-end;
`;

export const Box = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  overflow: hidden;
  height: 85%;
`;

export const Header = styled.View`
  padding: 14px 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const HeaderTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 700;
`;

export const CloseBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.card};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const SearchRow = styled.View`
  padding: 10px 14px 6px;
  flex-direction: row;
  gap: 10px;
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px;
  border-radius: 12px;
`;

export const SearchAction = styled.TouchableOpacity`
  width: 92px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.purple};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const SearchActionText = styled.Text`
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 12px;
`;

export const AddressLine = styled.View`
  padding: 0px 14px 10px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const AddressText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  opacity: 0.9;
`;

export const MapBox = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.card};
`;

export const PinCenter = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  margin-top: -34px;
  align-items: center;
`;

export const PrimaryBtn = styled.TouchableOpacity`
  margin: 12px 14px 16px;
  background-color: ${({ theme }) => theme.colors.purple};
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const PrimaryBtnText = styled.Text`
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
`;
