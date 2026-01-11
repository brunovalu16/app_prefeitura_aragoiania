import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Cadastro from "../screens/Cadastro";
import Login from "../screens/Login";
import AppTabs from "./AppTabs";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  console.log("✅ ROOT NAVIGATOR EM EXECUÇÃO");
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
    </Stack.Navigator>
  );
}