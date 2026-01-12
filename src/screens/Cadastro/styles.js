import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "styled-components/native";


export const Container = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.purple};
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
  background: #fff;
  align-items: center;
  justify-content: center;
`;

export const SendPhoto = styled.TouchableOpacity`
  margin-left: 14px;
  padding: 8px 16px;
  border-radius: 5px;
  background: #fff;
  align-items: center;
  justify-content: center;
`;

export const SendPhotoText = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 800;
  font-size: 10px;
`;

export const Form = styled.View`
  margin-top: 26px;
`;

export const Label = styled.Text`
  color: rgba(255,255,255,0.9);
  font-size: 11px;
  margin-top: 14px;
  margin-bottom: 6px;
`;

export const InputLine = styled.TextInput`
  height: 32px;
  color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: rgba(255,255,255,0.65);
  padding-bottom: 6px;
`;

export const SpacerLine = styled.View`
  height: 1px;
  background: rgba(255,255,255,0.65);
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
  background: #fff;
  align-items: center;
  justify-content: center;
`;

export const SubmitText = styled.Text`
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 800;
  font-size: 12px;
`;

export const PasswordRow = styled.View`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.65);
`;

export const PasswordInput = styled.TextInput`
  flex: 1;
  height: 32px;
  color: #fff;
  padding-bottom: 6px;
`;

export const EyeBtn = styled.TouchableOpacity`
  width: 36px;
  height: 32px;
  align-items: flex-end;
  justify-content: center;
`;

