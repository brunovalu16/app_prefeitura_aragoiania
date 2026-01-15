import { styled } from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: #000;
`;

export const CameraFill = styled.View`
  flex: 1;
`;

export const PermissionWrap = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #fff;
`;

export const PermissionText = styled.Text`
  color: #111;
  text-align: center;
  margin-bottom: 14px;
`;

export const PermissionBtn = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  background-color: ${({ theme }) => theme.colors.purple};
  padding: 12px 18px;
  border-radius: 10px;
`;

export const PermissionBtnText = styled.Text`
  color: #fff;
  font-weight: 800;
`;

export const TopBar = styled.View`
  position: absolute;
  top: 45px;
  left: 18px;
  right: 18px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const IconBtn = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})``;

export const Spacer = styled.View`
  width: 30px;
`;

export const DocSelectorBtn = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  background-color: rgba(0, 0, 0, 0.55);
  padding: 8px 12px;
  border-radius: 12px;

  flex-direction: row;
  align-items: center;
`;

export const DocSelectorText = styled.Text`
  color: #fff;
  font-weight: 800;
  margin: 0 8px;
`;

export const FrameOverlay = styled.View`
  position: absolute;
  left: 22px;
  right: 22px;

  top: 22%;
  height: 45%;

  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.85);
  border-radius: 14px;

  background-color: rgba(0, 0, 0, 0.12);
`;

export const StepChip = styled.View`
  position: absolute;
  top: 18%;
  align-self: center;

  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 14px;
  border-radius: 999px;
`;

export const StepChipText = styled.Text`
  color: #fff;
  font-weight: 900;
  letter-spacing: 1px;
`;

export const BottomWrap = styled.View`
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 30px;

  align-items: center;
`;

export const BottomHint = styled.Text`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  margin-bottom: 12px;
`;

export const ActionsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const ActionBtn = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  padding: 0 16px;
  height: 46px;
  border-radius: 12px;

  align-items: center;
  justify-content: center;

  margin: 0 6px;
`;

export const RetakeBtn = styled(ActionBtn)`
  background-color: rgba(255, 255, 255, 0.18);
`;

export const PrimaryBtn = styled(ActionBtn)`
  background-color: ${({ theme }) => theme.colors.purple};
`;

export const ActionText = styled.Text`
  color: #fff;
  font-weight: 900;
`;

export const ShutterBtn = styled.TouchableOpacity.attrs({
  activeOpacity: 0.9,
})`
  width: 74px;
  height: 74px;
  border-radius: 37px;

  border-width: 4px;
  border-color: #fff;

  align-items: center;
  justify-content: center;

  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const ShutterInner = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #fff;
`;
