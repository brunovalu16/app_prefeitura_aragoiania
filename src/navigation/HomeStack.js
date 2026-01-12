import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeHeader from "../components/HomeHeader";
import Areas from "../screens/Areas";
import CepPreenchido from "../screens/CepPreenchido";
import Home from "../screens/Home";
import Replyiluminacao from "../screens/Replys/Replyiluminacao";
import Solicitar from "../screens/Solicitar";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <HomeHeader />, // ✅ header fixo
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Areas" component={Areas} />
      <Stack.Screen name="Solicitar" component={Solicitar} />
      <Stack.Screen name="CepPreenchido" component={CepPreenchido} />
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />
    </Stack.Navigator>
  );
}
