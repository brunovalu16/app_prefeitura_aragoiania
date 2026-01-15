import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Areas from "../screens/Areas";
import Cadastro from "../screens/Cadastro";
import Login from "../screens/Login";
import Recebeiluminacao from "../screens/Recebeiluminacao";
import Replyiluminacao from "../screens/Replys/Replyiluminacao";
import User from "./../screens/User";
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  console.log("✅ ROOT NAVIGATOR EM EXECUÇÃO");
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="Areas" component={Areas} />
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />
      <Stack.Screen name="User" component={User} />
      <Stack.Screen name="Recebeiluminacao" component={Recebeiluminacao} />
    </Stack.Navigator>
  );
}