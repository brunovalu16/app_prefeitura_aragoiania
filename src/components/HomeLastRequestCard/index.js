import { Ionicons } from "@expo/vector-icons";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  CardRow,
  LeftBarSmall,
  SmallCard,
  SmallIconLeft,
  SmallInfo,
  SmallSub,
  SmallTitle,
} from "./styles";

export default function HomeLastRequestCard({
  title = "MINHAS SOLICITAÇÕES",
  subtitle = "ILUMINAÇÃO PÚBLICA",
  status = "",
  onPress,
  onMenuPress,

  // ✅ DELETE (opcional)
  canDelete,
  onDeletePress,
}) {
  const theme = useTheme();

  // ✅ só mostra o ícone se existir handler de delete OU canDelete foi definido
  const showDelete =
    typeof onDeletePress === "function" || typeof canDelete === "boolean";

  function handlePressDelete() {
    // ✅ se não pode deletar, mostra alerta e não deleta
    if (canDelete === false) {
      Alert.alert(
        "Não permitido",
        "Essa solicitação não pode ser deletada pois está em andamento.",
      );
      return;
    }

    // ✅ se pode deletar, chama o handler real
    onDeletePress?.();
  }

  return (
    <CardRow>
      <SmallCard activeOpacity={0.9} onPress={onPress}>
        <LeftBarSmall />
        <SmallIconLeft>
          <View
            style={{
              backgroundColor: theme.colors.purple,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="document-text-outline" size={18} color="#fff" />
          </View>

          <SmallInfo>
            <SmallTitle>{title}</SmallTitle>
            <SmallSub>{subtitle}</SmallSub>

            {!!status && (
              <SmallSub style={{ marginTop: 2 }}>Status: {status}</SmallSub>
            )}
          </SmallInfo>
        </SmallIconLeft>

        {/* ✅ AÇÕES DIREITA */}
        <SmallIconLeft style={{ gap: 10 }}>
          {showDelete && (
            <Ionicons
              name="trash-outline"
              size={18}
              color="#E11D48"
              onPress={handlePressDelete}
            />
          )}

          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={theme.colors.purple}
            onPress={onMenuPress}
          />
        </SmallIconLeft>
      </SmallCard>
    </CardRow>
  );
}
