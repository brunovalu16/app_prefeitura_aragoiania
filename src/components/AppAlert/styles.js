import { styled } from "styled-components/native";

export const Overlay = styled.TouchableOpacity`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: center;
  padding: 18px;
`;

export const Card = styled.TouchableOpacity`
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
`;

export const TopBar = styled.View`
  height: 10px;
  width: 100%;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 6px 16px;
`;

export const Title = styled.Text`
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
  margin-top: -20%;
`;

export const Message = styled.Text`
  font-size: 17px;
  color: #2b3036;
  padding: 0px 16px 12px 16px;
  line-height: 20px;
`;

export const Footer = styled.View`
  padding: 0px 16px 14px 16px;
  align-items: flex-end;
`;

export const OkBtn = styled.TouchableOpacity`
  padding: 8px 10px;
`;

export const OkText = styled.Text`
  color: #22C55E;
  font-weight: 700;
  font-size: 14px;
`;
