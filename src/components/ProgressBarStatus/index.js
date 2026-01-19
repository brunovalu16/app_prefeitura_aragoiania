import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import {
  BarWrap,
  CheckBtn,
  ChecksRow,
  CheckText,
  GradientFill,
  Label,
  LabelsRow,
  ThumbInner,
  ThumbOuter,
  Track,
  TrackRest,
} from "./styles";

const STEPS = ["analise", "pendente", "execucao", "concluida"];

const STATUS = {
  analise: 0,
  pendente: 0.33,
  execucao: 0.66,
  concluida: 1,
};

const LABELS = {
  analise: "Análise",
  pendente: "Pendente",
  execucao: "Em execução",
  concluida: "Concluída",
};

export default function ProgressBarStatus({
  status = "analise",
  isAdmin = true,
  onChangeStatus, // opcional: para salvar no backend futuramente
}) {
  const [localStatus, setLocalStatus] = useState(status);

  // se quiser sempre controlar de fora, pode remover localStatus
  const current = localStatus;

  const progress = useMemo(() => STATUS[current] ?? 0, [current]);
  const leftPercent = progress * 100;

  function setStatus(next) {
    setLocalStatus(next);
    if (onChangeStatus) onChangeStatus(next);
  }

  function handleToggleStep(step) {
    // ✅ regra: admin "avança" a etapa para esse step
    setStatus(step);
  }

  function isChecked(step) {
    // tudo até o status atual fica marcado
    return STEPS.indexOf(step) <= STEPS.indexOf(current);
  }

  //faz parte da verificação do usuario logado
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  return (
    <View>
      <BarWrap>
        <Track>
          <GradientFill style={{ width: `${leftPercent}%` }}>
            <LinearGradient
              colors={["#D600FF", "#1E6BFF"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1, borderRadius: 999 }}
            />
          </GradientFill>

          <TrackRest />

          <ThumbOuter style={{ left: `${leftPercent}%` }}>
            <ThumbInner />
          </ThumbOuter>
        </Track>
      </BarWrap>

      <LabelsRow>
        {STEPS.map((step) => (
          <Label key={step} active={current === step}>
            {LABELS[step]}
          </Label>
        ))}
      </LabelsRow>

      {/* ✅ Checks só para admin */}
      {isAdmin && (
        <ChecksRow>
          {STEPS.map((step) => {
            const checked = isChecked(step);

            return (
              <CheckBtn key={step} onPress={() => handleToggleStep(step)}>
                <Ionicons
                  name={checked ? "checkbox" : "square-outline"}
                  size={18}
                  color={checked ? "#1E6BFF" : "#9CA3AF"}
                />
                <CheckText>{checked ? "OK" : ""}</CheckText>
              </CheckBtn>
            );
          })}
        </ChecksRow>
      )}
    </View>
  );
}
