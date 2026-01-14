import { Ionicons } from "@expo/vector-icons";
import { Images } from "../../assets/images";
import {
  Avatar,
  AvatarImage,
  BackButton,
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
  avatar,
  onLogout,
  onBack, // 👈 nova prop
}) {
  return (
    <>
      <LogoArea>
        <LogoImage source={Images.logo_colorida_aragoiania} />

        {onBack && (
          <BackButton onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back-circle-outline" size={30} color="#777777" />
          </BackButton>
        )}
      </LogoArea>

      <GreetingRow>
        <GreetingLeft>
          <Avatar>
            <AvatarImage source={avatar ?? Images.avatar} />
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
