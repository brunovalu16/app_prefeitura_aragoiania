import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeHeader from "../components/HomeHeader";

import Areas from "../screens/Areas";
import Home from "../screens/Home";
import Solicitar from "../screens/Solicitar";
import SolicitarSaude from "../screens/SolicitarSaude";

import Recebeiluminacao from "../screens/Recebeiluminacao";

import Replyiluminacao from "../screens/Replys/Replyiluminacao";
import ReplySaude from "../screens/Replys/ReplySaude";

import CepPreenchido from "../screens/CepPreenchido";
import DocumentCameraScreen from "../screens/DocumentCameraScreen";
import Exameseconsultas from "../screens/Exameseconsultas";
import User from "../screens/User";

import AdminAreas from "../screens/AdminAreas";
import AdminInboxArea from "../screens/AdminInboxArea";
import AdminUserAreas from "../screens/AdminUserAreas";
import AdminUsersInbox from "../screens/AdminUsersInbox";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <HomeHeader />, // ✅ header fixo
      }}
    >
      {/* PRINCIPAL */}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Areas" component={Areas} />

      {/* SOLICITAÇÕES */}
      <Stack.Screen name="Solicitar" component={Solicitar} />
      <Stack.Screen name="SolicitarSaude" component={SolicitarSaude} />

      {/* LISTAGEM */}
      <Stack.Screen name="Recebeiluminacao" component={Recebeiluminacao} />
      <Stack.Screen name="Exameseconsultas" component={Exameseconsultas} />

      {/* REPLYS */}
      <Stack.Screen name="Replyiluminacao" component={Replyiluminacao} />
      <Stack.Screen name="ReplySaude" component={ReplySaude} />

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
