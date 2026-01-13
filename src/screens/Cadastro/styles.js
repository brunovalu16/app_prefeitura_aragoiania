import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "styled-components/native";


export const Container = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.textMuted2};
  padding: 22px 26px 28px 26px;
`;

export const TopBack = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

export const LogoArea = styled.View`
  align-items: center;
  margin-bottom: 44px;
`;

export const LogoImage = styled.Image.attrs({
  resizeMode: "contain",
})`
  width: 150px;
  height: 100px;
`;

export const Title = styled.Text`
  margin-top: 12px;
  color: #fff;
  font-size: 14px;
  opacity: 0.95;
`;

export const PhotoRow = styled.View`
  margin-top: -20px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;


export const PhotoBox = styled.View`
  width: 75px;
  height: 75px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.cinza};
  align-items: center;
  justify-content: center;
`;

export const SendPhoto = styled.TouchableOpacity`
  margin-left: 14px;
  padding: 8px 16px;
  border-radius: 5px;
  background: ${({ theme }) => theme.colors.purple};
  align-items: center;
  justify-content: center;
`;

export const SendPhotoText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 800;
  font-size: 10px;
`;

export const Form = styled.View`
  margin-top: 26px;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.cinza};
  font-size: 11px;
  margin-top: 14px;
  margin-bottom: 6px;
`;

export const InputLine = styled.TextInput`
  height: 32px;
  color: ${({ theme }) => theme.colors.cinza};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.cinza};
  padding-bottom: 6px;
`;

export const SpacerLine = styled.View`
  height: 1px;
  background: ${({ theme }) => theme.colors.purple};
  margin-top: 14px;
`;

export const SubmitArea = styled.View`
  margin-top: 28px;
  align-items: center;
`;

export const SubmitBtn = styled.TouchableOpacity`
  width: 240px;
  height: 42px;
  border-radius: 21px;
  background: ${({ theme }) => theme.colors.purple};
  align-items: center;
  justify-content: center;
`;

export const SubmitText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 800;
  font-size: 12px;
`;

export const PasswordRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color:  ${({ theme }) => theme.colors.cinza};
`;

export const PasswordInput = styled.TextInput`
  flex: 1;
  height: 32px;
  color:  ${({ theme }) => theme.colors.cinza};
  padding-bottom: 6px;
`;

export const EyeBtn = styled.TouchableOpacity`
  width: 36px;
  height: 32px;
  align-items: flex-end;
  justify-content: center;
`;

export const Row2 = styled.View`
  margin-top: 0px;
  flex-direction: row;
  gap: 14px;
`;

export const Col = styled.View`
  flex: 1;
`;

export const SectionHint = styled.Text`
  margin-top: 18px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.cinza};
  font-size: 11px;
  font-weight: 700;
`;

export const PhotoActionsRow = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-bottom: 6px;
`;

export const PhotoActionBtn = styled.TouchableOpacity`
  flex: 1;
  height: 42px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.purple};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
`;

export const PhotoActionText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 800;
  font-size: 11px;
`;

export const InputBox = styled.TextInput`
  height: 42px;
  border-radius: 8px;
  padding: 0 12px;

  background: ${({ theme }) => theme.colors.cinza};
  color: ${({ theme }) => theme.colors.surface};

  font-size: 13px;
`;




// ✅ POPUP BLOQUEIO (igual ao print com barra vermelha)
export const AlertOverlay = styled.TouchableOpacity`
  flex: 1;
  background: rgba(0, 0, 0, 0.35);
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

export const AlertCard = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
  style: {
    elevation: 6, // ✅ Android
    shadowColor: "#000", // ✅ iOS
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
})`
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
`;


export const AlertHeader = styled.View`
  height: 42px;
  background: #c62828; /* 🔴 vermelho igual ao print */
  padding: 0 14px;
  justify-content: center;
`;

export const AlertHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const AlertTitle = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
`;

export const AlertBody = styled.View`
  padding: 14px;
`;

export const AlertMessage = styled.Text`
  color: #1f1f1f;
  font-size: 12px;
  line-height: 18px;
`;

export const AlertFooter = styled.View`
  padding: 10px 14px 14px 14px;
  align-items: flex-end;
`;

export const AlertOkBtn = styled.TouchableOpacity`
  padding: 6px 10px;
`;

export const AlertOkText = styled.Text`
  color: #c62828; /* 🔴 mesmo vermelho do header */
  font-size: 14px;
  font-weight: 800;
`;


export const FormLock = styled.View``;



