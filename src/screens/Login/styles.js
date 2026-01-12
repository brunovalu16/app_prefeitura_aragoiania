
import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "styled-components/native";


export const Container = styled(SafeAreaView)`
  flex: 1;
  background: ${({ theme }) => theme.colors.purple};
  padding: 28px;
  padding-top: 260px;
`;


export const LogoImage = styled.Image.attrs({
  resizeMode: "contain",
})`
  width: 240px;
  padding-top: 140%
`;

export const LogoArea = styled(ImageBackground).attrs({
  resizeMode: "cover",
  imageStyle: {
    opacity: 1,
    top: 100,
    transform: [{ scale: 1 }],
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
})`
  position: absolute;
  top: -190;
  left: 0;
  right: 0;

  height: 140%;
  align-items: center;

  background-color: ${({ theme }) => theme.colors.black};

  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;

  padding-top: 40px;
`;



export const LogoText = styled.Text`
  color: #fff;
  font-size: 28px;
  font-weight: 800;
`;

export const SubText = styled.Text`
  color: #fff;
  margin-top: 10px;
  font-size: 13px;
  opacity: 0.9;
`;

export const Label = styled.Text`
  color: #fff;
  font-size: 13px;
  margin-top: 7px;
  margin-bottom: 1px;
  opacity: 0.9;
`;

export const InputLine = styled.TextInput`
  height: 34px;
  color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.6);
  padding-bottom: 6px;
`;

export const RowLogin = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  margin-top: 68%;
`;

export const RowLoginText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  opacity: 0.9;
  font-size: ${({ theme }) => theme.font.md}px;
`;

export const RowLoginDivider = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  opacity: 0.6;
  margin: 0 10px;
  font-size: ${({ theme }) => theme.font.xl}px;
`;

export const RowLoginLink = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 800;
  text-decoration-line: underline;
  font-size: ${({ theme }) => theme.font.xl}px;
`;

export const Link = styled.TouchableOpacity`
  padding: 2px;
`;

export const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 800;
  font-size: ${({ theme }) => theme.font.xl}px;
`;
