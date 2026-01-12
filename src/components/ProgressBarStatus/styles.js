import { styled } from "styled-components/native";

export const BarWrap = styled.View`
  margin-top: 20px;
`;

export const Track = styled.View`
  height: 14px;
  border-radius: 999px;
  background: #eef1f6;
  overflow: visible;
  justify-content: center;
`;

export const GradientFill = styled.View`
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
`;

export const TrackRest = styled.View`
  position: absolute;
  right: 0;
  height: 14px;
  width: 100%;
  border-radius: 999px;
  background: transparent;
`;

export const ThumbOuter = styled.View.attrs({
  style: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
})`
  position: absolute;
  top: 50%;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #ffffff;

  /* centraliza no ponto */
  transform: translate(-18px, -18px);

  align-items: center;
  justify-content: center;
`;


export const ThumbInner = styled.View`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #1e6bff;
`;

export const LabelsRow = styled.View`
  margin-top: 10px;
  flex-direction: row;
  justify-content: space-between;
`;

export const Label = styled.Text`
  font-size: 12px;
  font-weight: 800;
  color: ${({ theme, active }) =>
    active ? theme.colors.purple : theme.colors.textMuted};
`;

export const ChecksRow = styled.View`
  margin-top: 8px;
  flex-direction: row;
  justify-content: space-between;
`;

export const CheckBtn = styled.TouchableOpacity`
  width: 25%;
  align-items: center;
  justify-content: center;
`;

export const CheckText = styled.Text`
  margin-top: 2px;
  font-size: 10px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textMuted};
`;

