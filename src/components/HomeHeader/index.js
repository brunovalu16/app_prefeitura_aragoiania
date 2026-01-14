import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeGreeting from "../HomeGreeting";
import HomeShortcuts from "../HomeShortcuts";
import { Container } from "./styles";

export default function HomeHeader() {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={["top"]}>
      <Container>
       <HomeGreeting
        name="Bruno Valú"
        onBack={() => navigation.goBack()}
        onLogout={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }}
      />


        <HomeShortcuts initialActiveLabel="SERVIÇOS" />
      </Container>
    </SafeAreaView>
  );
}
