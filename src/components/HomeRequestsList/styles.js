import { styled } from "styled-components/native";

export const ListArea = styled.View`
  height: 170px;
  margin-top: -5px;
`;

export const ListScroll = styled.ScrollView.attrs({
  contentContainerStyle: { paddingBottom: 15 },
})`
  flex: 1;
`;
