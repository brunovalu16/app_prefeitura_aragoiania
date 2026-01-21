import { styled } from "styled-components/native";

export const LogoArea = styled.View`
  align-items: center;
  margin-bottom: 12px;
  position: relative; /* 🔑 base para o botão absoluto */
`;

export const LogoImage = styled.Image.attrs({
  resizeMode: "contain",
})`
  width: 150px;
  height: 80px;
`;

export const BackButton = styled.TouchableOpacity`
  position: absolute;
  right: 0;
  transform: translateY(-11px);
  padding: 6px;
`;

export const GreetingRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const GreetingLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const Avatar = styled.View`
  width: 70px;
  height: 70px;
  border-radius: 10px;
  border-width: 2;
  border-color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.border};
  margin-right: 10px;
`;

export const AvatarImage = styled.Image.attrs({
  resizeMode: "cover",
})`
  width: 100%;
  height: 100%;
`;

export const UserInfo = styled.View`
  flex-shrink: 1;
`;

export const Welcome = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: -5%;
`;

export const Name = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 24px;
  font-weight: 800;
  margin-top: 2px;
`;

export const LogoutButton = styled.TouchableOpacity`
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.colors.purple};
  border-radius: 5px;
`;

export const LogoutText = styled.Text`
  color: ${({ theme }) => theme.colors.surface};
  font-size: 12px;
  font-weight: 700;
`;
