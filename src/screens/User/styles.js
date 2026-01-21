import { styled } from "styled-components/native";

/* =========================
   CONTAINER GERAL
========================= */
export const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

/* =========================
   CONTROLE DO CAMPO FOTO USER
========================= */
export const TopRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 10;
`;

export const AvatarBtn = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  border-radius: 5px;

  align-items: center;
  justify-content: center;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.cinzaclaro};
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

export const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export const SusBlock = styled.View`
  flex: 1;
`;

/* =========================
   BOTÃO VOLTAR
========================= */
export const TopBack = styled.TouchableOpacity`
  margin-bottom: 16px;
`;

/* =========================
   FORMULÁRIO
========================= */
export const Form = styled.View`
  gap: 10px;
`;

/* =========================
   TEXTOS
========================= */
export const Label = styled.Text`
  font-size: 14px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.cinza};
`;

export const SectionHint = styled.Text`
  font-size: 13px;
  margin-top: 12px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.cinza};
`;

/* =========================
   INPUTS (READ ONLY)
========================= */
export const InputLine = styled.View`
  padding-top: 8px;
  padding-bottom: 8px;
  margin-bottom: 14px;

  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.cinzaclaro};
`;

export const ValueText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

/* =========================
   LINHAS / COLUNAS
========================= */
export const Row2 = styled.View`
  flex-direction: row;
  gap: 12px;
`;

export const Col = styled.View`
  flex: 1;
`;

/* =========================
   AÇÕES DE FOTO (VISUAL)
========================= */
export const PhotoActionsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 6px;
`;

export const PhotoActionBtn = styled.TouchableOpacity`
  flex: 1;
  min-height: 44px;

  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: 6px;
  border-radius: 10px;

  background-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const PhotoActionText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.cinza};
  font-weight: 600;
`;

export const ValueBox = styled.View`
  height: 32px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.cinza};
  justify-content: center;
`;
