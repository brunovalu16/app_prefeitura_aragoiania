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
  RequestsBody,
} from "./styles";

export default function AreaRequestsCard({
  areaLabel = "ÁREA",
  requests = [],
  onPressRequest,
  defaultOpen = false,
  visibleCards = 3,     // ✅ quantos cards completos
  peekRatio = 0.25,     // ✅ quanto do próximo card aparece (0.2~0.35 fica bom)
  minListHeight = 180,  // ✅ fallback mínimo
  maxListHeight = 380,  // ✅ trava pra não ficar gigante
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  const countText = useMemo(
    () => `${requests.length} solicitação(ões)`,
    [requests]
  );

  // ✅ mede 1 card (altura real)
  const [cardH, setCardH] = useState(0);

  // ✅ altura alvo: 3 cards + “um pouco” do próximo
  const targetHeight = useMemo(() => {
    if (!cardH) return minListHeight;
    const h = cardH * (visibleCards + peekRatio);
    return Math.max(minListHeight, Math.min(maxListHeight, h));
  }, [cardH, visibleCards, peekRatio, minListHeight, maxListHeight]);

  return (
    <>
      {/* ✅ CARD MESTRE (BRANCO) */}
      <CardMaster>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setOpen((v) => !v)}
        >
          <HeaderRow>
            <HeaderLeft>
              <Ionicons
                name="folder-outline"
                size={18}
                color={theme.colors.purple}
              />
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

      {/* ✅ LISTA INTERNA (SEM FUNDO) + SCROLL + ALTURA LIMITADA */}
      {open && (
        <RequestsBody>
          <Divider />

          <ScrollView
            style={{ maxHeight: targetHeight }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {requests.map((r, idx) => (
              <View
                key={r.id}
                onLayout={(e) => {
                  // ✅ mede somente o 1º card (evita recalcular toda hora)
                  if (idx === 0 && !cardH) {
                    setCardH(e.nativeEvent.layout.height);
                  }
                }}
              >
                <HomeLastRequestCard
                  title="MINHAS SOLICITAÇÕES"
                  subtitle={r.requestTitle}
                  onPress={() => onPressRequest?.(r)}
                  onMenuPress={() => {}}
                />
              </View>
            ))}
          </ScrollView>
        </RequestsBody>
      )}
    </>
  );
}
