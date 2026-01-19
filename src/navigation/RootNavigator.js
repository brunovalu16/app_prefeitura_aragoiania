import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Cadastro from "../screens/Cadastro";
import Login from "../screens/Login";
import AppTabs from "./AppTabs";

/* FALLBACKS / ACESSO DIRETO */
import Recebesolicitacoes from "../screens/Recebesolicitacoes";
import Replyiluminacao from "../screens/Replys/Replyiluminacao";
import Exameseconsultas from "../screens/Saude/Exameseconsultas";
import RecebeSaude from "../screens/Saude/RecebeSaude";
import ReplyExameseconsultas from "../screens/Saude/ReplyExameseconsultas";
import SolicitarSaude from "../screens/Saude/SolicitarSaude";
import User from "../screens/User";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  console.log("✅ ROOT NAVIGATOR EM EXECUÇÃO");

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ================= AUTH ================= */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />

      {/* ================= APP LOGADO ================= */}
      <Stack.Screen name="AppTabs" component={AppTabs} />

      {/* ================= FALLBACKS ================= */}
      {/* ⚠️ usadas apenas quando navegar fora do fluxo */}
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />
      <Stack.Screen
        name="ReplyExameseconsultas"
        component={ReplyExameseconsultas}
      />
      <Stack.Screen name="Recebesolicitacoes" component={Recebesolicitacoes} />
      <Stack.Screen name="RecebeSaude" component={RecebeSaude} />
      <Stack.Screen name="Exameseconsultas" component={Exameseconsultas} />
      <Stack.Screen name="SolicitarSaude" component={SolicitarSaude} />
      <Stack.Screen name="User" component={User} />
    </Stack.Navigator>
  );
}
