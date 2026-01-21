import { Platform } from "react-native";
import { styled } from "styled-components/native";

export const Container = styled.View`
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.background};
`;

/* Barra de localização */
export const LocationBar = styled.View`
  background-color: ${({ theme }) => theme.colors.card ?? theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border ?? "rgba(0,0,0,0.08)"};
  border-radius: 10px;
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
`;

export const LocationBarLeft = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const LocationBarText = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  opacity: 0.8;
`;

export const LocationBarX = styled.TouchableOpacity`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

/* Cards */

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.card ?? theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border ?? "rgba(0,0,0,0.08)"};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;

  ${Platform.OS === "ios"
    ? `
    shadowColor: #000;
    shadowOpacity: 0.06;
    shadowRadius: 10px;
    shadowOffset: 0px 4px;
  `
    : `
    elevation: 2;
  `}
`;

export const PhoneText = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 700;
  font-size: 13px;
`;

export const CardTop = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
`;

export const CardTopRight = styled.View`
  align-items: flex-end;
`;

export const FavCol = styled.View`
  align-items: center;
  gap: 2px;
`;

export const FavHeart = styled.View`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  align-items: center;
  justify-content: center;
`;

export const FavLabel = styled.Text`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

export const CardHeaderLeft = styled.View`
  flex: 1;
  gap: 6px;
`;

export const CardTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 700;
`;

export const IconsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
`;

export const DividerLine = styled.View`
  height: 1px;
  background: ${({ theme }) => theme.colors.border ?? "rgba(0,0,0,0.08)"};
  margin: 10px 0;
`;

export const CardBody = styled.View``;

export const SubtitleText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  opacity: 0.7;
`;

export const CepText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
`;

export const PhonesCol = styled.View`
  flex: 1;
`;

export const PhoneLink = styled.TouchableOpacity`
  margin-top: 8px;
`;

export const RowBetween = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
`;

export const DistanceRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const DistanceText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  opacity: 0.75;
`;

/* Paginação */
export const Pagination = styled.View`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

export const PageBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.purple};
  align-items: center;
  justify-content: center;
`;

export const PageNumberBox = styled.View`
  min-width: 40px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.purple};
  align-items: center;
  justify-content: center;
`;

export const PageNumberText = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 700;
`;

export const SaveButton = styled.TouchableOpacity`
  margin-top: 24px;
  max-width: 50%;
  min-width: 50%;
  background-color: ${({ theme }) => theme.colors.purple};
  border-radius: 40px;
  height: 48px;
  align-items: center;
  justify-content: center;
  align-self: center;
`;

export const SaveButtonText = styled.Text`
  color: #fff;
  font-size: 15px;
  font-weight: 700;
`;
