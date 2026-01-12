import { Ionicons } from "@expo/vector-icons";
import { Modal } from "react-native";
import PrimaryButtonareas from "../PrimaryButtonareas";
import {
  Box,
  Close,
  Footer,
  Map,
  Overlay,
  SearchInput,
  SearchRow,
  Title,
  TopRow,
} from "./styles";

export default function MapModal({ visible, onClose, onSelectLocation }) {
  function handleConfirm() {
    // ✅ MOCK: depois troca pelo ponto real selecionado no mapa
    onSelectLocation?.({
      latitude: -16.6869,
      longitude: -49.2648,
    });

    onClose?.();
  }

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

          <Footer>
            <PrimaryButtonareas title="CONFIRMAR LOCALIZAÇÃO" onPress={handleConfirm} />
          </Footer>
        </Box>
      </Overlay>
    </Modal>
  );
}
