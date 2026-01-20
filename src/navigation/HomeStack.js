import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeHeader from "../components/HomeHeader";

import Areas from "../screens/Areas";
import Home from "../screens/Home";
import Solicitar from "../screens/Solicitar";

import Recebesolicitacoes from "../screens/Recebesolicitacoes";

import Replyiluminacao from "../screens/Replys/Replyiluminacao";

import AdminUserAreas from "../screens/AdminUserAreas";

import CepPreenchido from "../screens/CepPreenchido";
import DocumentCameraScreen from "../screens/DocumentCameraScreen";
import User from "../screens/User";

/** SAÚDE */
import Exameseconsultas from "../screens/Saude/Exameseconsultas";
import RecebeSaude from "../screens/Saude/RecebeSaude";
import ReplyExameseconsultas from "../screens/Saude/ReplyExameseconsultas";
import SolicitarSaude from "../screens/Saude/SolicitarSaude";

/** ADMIN */
import AdminAreas from "../screens/AdminAreas";
import AdminInboxArea from "../screens/AdminInboxArea";
import AdminUsersInbox from "../screens/AdminUsersInbox";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <HomeHeader />, // ✅ header fixo (topo)
      }}
    >
      {/* PRINCIPAL */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Areas" component={Areas} />

      {/* SOLICITAR (geral) */}
      <Stack.Screen name="Solicitar" component={Solicitar} />

      {/* SAÚDE */}
      <Stack.Screen name="SolicitarSaude" component={SolicitarSaude} />
      <Stack.Screen name="Exameseconsultas" component={Exameseconsultas} />
      <Stack.Screen
        name="ReplyExameseconsultas"
        component={ReplyExameseconsultas}
      />
      <Stack.Screen name="RecebeSaude" component={RecebeSaude} />

      {/* LISTAGEM */}
      <Stack.Screen name="Recebesolicitacoes" component={Recebesolicitacoes} />

      {/* REPLYS */}
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />

      {/* OUTROS */}
      <Stack.Screen name="CepPreenchido" component={CepPreenchido} />
      <Stack.Screen name="DocumentCamera" component={DocumentCameraScreen} />
      <Stack.Screen name="User" component={User} />

      {/* ADMIN */}
      <Stack.Screen name="AdminAreas" component={AdminAreas} />
      <Stack.Screen name="AdminInboxArea" component={AdminInboxArea} />
      <Stack.Screen name="AdminUsersInbox" component={AdminUsersInbox} />
      <Stack.Screen name="AdminUserAreas" component={AdminUserAreas} />
    </Stack.Navigator>
  );
}
