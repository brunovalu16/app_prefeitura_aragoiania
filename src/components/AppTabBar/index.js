import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { Bar, Item, Label } from "./styles";

export default function AppTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Bar style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Ícone vindo do options.tabBarIconName
        const iconName = options.tabBarIconName;

        return (
          <Item key={route.key} activeOpacity={0.9} onPress={onPress}>
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? theme.colors.purple : theme.colors.textMuted}
            />
            {options.tabBarLabel ? (
              <Label active={isFocused}>{options.tabBarLabel}</Label>
            ) : null}
          </Item>
        );
      })}
    </Bar>
  );
}
