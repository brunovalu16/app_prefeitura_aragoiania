import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

import {
    CardMaster,
    Divider,
    HeaderCount,
    HeaderLeft,
    HeaderRow,
    HeaderTitle,
    RequestsBody,
} from "./styles";

export default function UserRequestsCard({
  userEmail = "email@usuario.com",
  areas = [], // [{ areaId, areaLabel, requests: [] }]
  defaultOpen = false,
  renderArea, // função pra renderizar cada área (reaproveitar AreaRequestsCard)
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  const total = useMemo(() => {
    return (areas || []).reduce((sum, a) => sum + (a?.requests?.length || 0), 0);
  }, [areas]);

  return (
    <>
      <CardMaster>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen((v) => !v)}>
          <HeaderRow>
            <HeaderLeft>
              <Ionicons name="person-outline" size={18} color={theme.colors.purple} />
              <View style={{ marginLeft: 8 }}>
                <HeaderTitle>{userEmail}</HeaderTitle>
                <HeaderCount>{total} solicitação(ões)</HeaderCount>
              </View>
            </HeaderLeft>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.purple}
            />
          </HeaderRow>
        </TouchableOpacity>
      </CardMaster>

      {open && (
        <RequestsBody>
          <Divider />
          {(areas || []).map((a) => (
            <View key={a.areaId} style={{ marginTop: 10 }}>
              {renderArea?.(a)}
            </View>
          ))}
        </RequestsBody>
      )}
    </>
  );
}
