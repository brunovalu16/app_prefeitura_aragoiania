import { Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native";
import { Box, Close, Map, Overlay, SearchInput, SearchRow, Title, TopRow } from "./styles";

export default function MapModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Overlay>
        <Box>
          <TopRow>
            <Title>Endereço não atendido pela Prefeitura de Aragoiânia</Title>
            <Close onPress={onClose}>
              <Ionicons name="close" size={18} color="#fff" />
            </Close>
          </TopRow>

          <SearchRow>
            <Ionicons name="search" size={18} color="#6B7280" />
            <SearchInput placeholder=" " placeholderTextColor="#9CA3AF" />
          </SearchRow>

          <Map />
        </Box>
      </Overlay>
    </Modal>
  );
}
