import { Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native";
import { useTheme } from "styled-components/native";

import {
  Card,
  Footer,
  HeaderRow,
  Message,
  OkBtn,
  OkText,
  Overlay,
  Title,
  TopBar,
} from "./styles";

export default function AppAlert({
  visible,
  variant = "success", // "success" | "error" | "warning"
  title,
  message,
  onClose,
  okText = "OK",
}) {
  const theme = useTheme();

  const cfg = {
    success: {
      bar: theme.colors.success ?? "#22C55E",
      icon: "checkmark-circle",
      iconColor: "#fff",
      defaultTitle: "Sucesso",
    },
    error: {
      bar: theme.colors.error ?? "#EF4444",
      icon: "alert-circle",
      iconColor: "#fff",
      defaultTitle: "Erro",
    },
    warning: {
      bar: theme.colors.warning ?? "#F59E0B",
      icon: "warning",
      iconColor: "#fff",
      defaultTitle: "Atenção",
    },
  }[variant] || {};

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Overlay activeOpacity={1} onPress={onClose}>
        <Card activeOpacity={1}>
          <TopBar style={{ backgroundColor: cfg.bar, height: "40" }} />
          <HeaderRow style={{  height: "5" }}>
            <Ionicons name={cfg.icon} size={18} color={cfg.iconColor} />
            <Title>{title || cfg.defaultTitle}</Title>
          </HeaderRow>

          {!!message && <Message>{message}</Message>}

          <Footer>
            <OkBtn activeOpacity={0.9} onPress={onClose}>
              <OkText>{okText}</OkText>
            </OkBtn>
          </Footer>
        </Card>
      </Overlay>
    </Modal>
  );
}
