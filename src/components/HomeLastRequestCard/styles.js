import { Platform } from "react-native";
import { styled } from "styled-components/native";

export const CardRow = styled.View`
  padding: 0 18px;
  margin-top: 18px;
`;

export const SmallCard = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 14px;
  padding: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${Platform.OS === "android" &&
  `
    elevation: 2;
  `}
`;



export const SmallIconLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const SmallInfo = styled.View`
  align-items: flex-start;
  margin-left: 10px;
`;

export const SmallTitle = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
`;

export const SmallSub = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
`;
