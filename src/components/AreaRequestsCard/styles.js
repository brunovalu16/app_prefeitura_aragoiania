import { styled } from "styled-components/native";


export const CardMaster = styled.View`
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
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
  font-size: 14px;
  font-weight: 700;
  color: #3A0B6C;
`;

export const HeaderCount = styled.Text`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
`;

export const Divider = styled.View`
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 10px 0;
`;

export const Body = styled.View`
  background-color: transparent; /* ✅ SEM fundo */
  padding-left: 6px;
  padding-right: 6px;
  padding-bottom: 12px;
`;

export const RequestsBody = styled.View`
  background-color: transparent;
  padding-left: 6px;
  padding-right: 6px;
  padding-bottom: 12px;
`;


