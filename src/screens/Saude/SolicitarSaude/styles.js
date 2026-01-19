import { Ionicons } from "@expo/vector-icons";
import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
  padding-top: 22px;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.cinza};
  margin-bottom: 14px;
`;

export const Grid = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const Tile = styled.TouchableOpacity.attrs({
  style: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
})`
  width: 31.5%;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1.7px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;

  padding: 12px 10px;
  margin-bottom: 12px;

  align-items: flex-start;
  justify-content: flex-start;
`;

export const TileText = styled.Text`
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.cinza};
`;

export const Badge = styled.View`
  position: absolute;
  top: -8px;
  left: 60px;

  background-color: ${({ theme }) => theme.colors.red};
  padding: 3px 8px;
  border-radius: 99px;
`;

export const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 11px;
  font-weight: 800;
`;

//icone
export const TileIcon = styled.View.attrs({
  pointerEvents: "none",
})`
  width: 34px;
  height: 34px;
  border-radius: 10px;

  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

export const TileIconIcon = styled(Ionicons).attrs({
  size: 26,
  pointerEvents: "none",
})`
  color: ${({ theme }) => theme.colors.purple};
`;
