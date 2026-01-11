import { Images } from "../../assets/images";
import {
  Avatar,
  AvatarImage,
  GreetingLeft,
  GreetingRow,
  LogoArea,
  LogoImage,
  LogoutButton,
  LogoutText,
  Name,
  UserInfo,
  Welcome,
} from "./styles";

export default function HomeGreeting({
  welcomeText = "Seja Bem-Vindo(a)",
  name,
  avatar,     // 👈 foto do usuário
  onLogout,
}) {
  return (
    <>
      <LogoArea>
        <LogoImage source={Images.logo_colorida_aragoiania} />
      </LogoArea>

      <GreetingRow>
        <GreetingLeft>
          <Avatar>
            <AvatarImage
              source={avatar ?? Images.avatar}
            />
          </Avatar>

          <UserInfo>
            <Welcome>{welcomeText}</Welcome>
            <Name>{name}</Name>
          </UserInfo>
        </GreetingLeft>

        <LogoutButton activeOpacity={0.9} onPress={onLogout}>
          <LogoutText>LOGOUT</LogoutText>
        </LogoutButton>
      </GreetingRow>
    </>
  );
}
