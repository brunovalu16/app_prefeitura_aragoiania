import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Cadastro from "../screens/Cadastro";
import Login from "../screens/Login";
import AppTabs from "./AppTabs";

// telas que podem ser acessadas fora do fluxo principal
import Exameseconsultas from "../screens/Exameseconsultas";
import Recebeiluminacao from "../screens/Recebeiluminacao";
import Replyiluminacao from "../screens/Replys/Replyiluminacao";
import ReplySaude from "../screens/Replys/ReplySaude";
import User from "../screens/User";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  console.log("✅ ROOT NAVIGATOR EM EXECUÇÃO");

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* AUTH */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />

      {/* APP LOGADO */}
      <Stack.Screen name="AppTabs" component={AppTabs} />

      {/* FALLBACKS / ACESSO DIRETO */}
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />
      <Stack.Screen name="ReplySaude" component={ReplySaude} />
      <Stack.Screen name="Recebeiluminacao" component={Recebeiluminacao} />
      <Stack.Screen name="User" component={User} />
      <Stack.Screen name="Exameseconsultas" component={Exameseconsultas} />
    </Stack.Navigator>
  );
}
