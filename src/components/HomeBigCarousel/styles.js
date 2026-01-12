import { styled } from "styled-components/native";

export const BigCarousel = styled.View`
  margin-top: 8px;
  margin-bottom: 10;
`;

export const DotsRow = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 10px;
`;

export const Dot = styled.View`
  width: ${({ active }) => (active ? 10 : 8)}px;
  height: ${({ active }) => (active ? 10 : 8)}px;
  border-radius: 999px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.purple : theme.colors.textMuted};
  margin: 0 4px;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
`;
