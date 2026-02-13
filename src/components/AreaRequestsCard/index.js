import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

import HomeLastRequestCard from "../HomeLastRequestCard";

import {
  CardMaster,
  Divider,
  HeaderCount,
  HeaderLeft,
  HeaderRow,
  HeaderTitle,
  LeftBar,
  RequestsBody,
} from "./styles";

export default function AreaRequestsCard({
  areaLabel = "ÁREA",
  requests = [],
  onPressRequest,
  onDeleteRequest,
  defaultOpen = false,
  visibleCards = 3,
  peekRatio = 0.25,
  minListHeight = 180,
  maxListHeight = 380,
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  const countText = useMemo(
    () => `${requests.length} solicitação(ões)`,
    [requests],
  );

  const [cardH, setCardH] = useState(0);

  const targetHeight = useMemo(() => {
    if (!cardH) return minListHeight;
    const h = cardH * (visibleCards + peekRatio);
    return Math.max(minListHeight, Math.min(maxListHeight, h));
  }, [cardH, visibleCards, peekRatio, minListHeight, maxListHeight]);

  return (
    <>
      <CardMaster>
        <LeftBar />
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setOpen((v) => !v)}
        >
          <HeaderRow>
            <HeaderLeft>
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
                <Ionicons name="folder-outline" size={18} color="#fff" />
              </View>

              <View style={{ marginLeft: 8 }}>
                <HeaderTitle>{areaLabel}</HeaderTitle>
                <HeaderCount>{countText}</HeaderCount>
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

          <ScrollView
            style={{ maxHeight: targetHeight }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {requests.map((r, idx) => {
              const statusLower = (r?.status || "").toLowerCase();
              const canDelete = statusLower === "analise";

              return (
                <View
                  key={r.id}
                  onLayout={(e) => {
                    if (idx === 0 && !cardH) {
                      setCardH(e.nativeEvent.layout.height);
                    }
                  }}
                >
                  <HomeLastRequestCard
                    title="MINHAS SOLICITAÇÕES"
                    subtitle={r.requestTitle}
                    status={r.status || "execucao"}
                    onPress={() => onPressRequest?.(r)}
                    onMenuPress={() => {}}
                    canDelete={canDelete} // ✅ habilita só em analise
                    onDeletePress={() => onDeleteRequest?.(r)} // ✅ sempre passa (UI controla)
                  />
                </View>
              );
            })}
          </ScrollView>
        </RequestsBody>
      )}
    </>
  );
}
