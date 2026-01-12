import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AppTabBar from "../components/AppTabBar";
import HomeStack from "./HomeStack";

// placeholders
import Home from "../screens/Home";

const Tab = createBottomTabNavigator();

function PlaceholderScreen(props) {
  return <Home {...props} />; // ✅ passa navigation/route
}


export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ tabBarIconName: "home" }}
      />
      <Tab.Screen
        name="Agenda"
        component={PlaceholderScreen}
        options={{ tabBarIconName: "calendar-outline" }}
      />
      <Tab.Screen
        name="Notificacoes"
        component={PlaceholderScreen}
        options={{ tabBarIconName: "notifications-outline" }}
      />
      <Tab.Screen
        name="Busca"
        component={PlaceholderScreen}
        options={{ tabBarIconName: "search-outline" }}
      />
    </Tab.Navigator>
  );
}
