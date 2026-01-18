import { styled } from "styled-components/native";

export const CardMaster = styled.View`
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.08);
  elevation: 2;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const HeaderTitle = styled.Text`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.purple};
`;

export const HeaderCount = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.7;
`;

export const RequestsBody = styled.View`
  padding: 6px 2px 8px;
`;

export const Divider = styled.View`
  height: 1px;
  background: rgba(0,0,0,0.06);
  margin-top: 10px;
`;
