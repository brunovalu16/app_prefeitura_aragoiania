import { styled } from "styled-components/native";

export const Bar = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  background-color: ${({ theme }) => theme.colors.textMuted2};

  padding-top: 8px;
  border-top-width: 1px;
  border-top-color: transparent;
`;

export const Item = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
`;
