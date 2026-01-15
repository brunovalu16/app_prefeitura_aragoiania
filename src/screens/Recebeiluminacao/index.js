import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";

import HomeRequestsList from "../../components/HomeRequestsList";
import { subscribeRequests } from "../../services/requests";
import { getUserId } from "../../services/userId";

import { Container } from "./styles";

export default function Recebeiluminacao({ navigation }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    let unsub;

    (async () => {
      const userId = await getUserId();

    

      unsub = subscribeRequests({
        userId,
        areaId: "iluminacao",
        max: 50,
        onChange: (list) => {
          setRequests(list || []);
        },
      });
    })();

    return () => unsub?.();
  }, []);

  const items = useMemo(() => {
    return (requests || []).map((r) => ({
      id: r.id,
      title: "MINHAS SOLICITAÇÕES",
      subtitle: r.requestTitle,
      raw: r,
    }));
  }, [requests]);

  useEffect(() => {
    // ✅ DEBUG (depois remove)
    console.log("TOTAL REQUESTS:", requests?.length);
  }, [requests]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Container style={{ flex: 1 }}>
          <HomeRequestsList
            items={items}
            onPressItem={(item) =>
              navigation.navigate("Replyiluminacao", { requestId: item.id })
            }
            onMenuPressItem={() => {}}
          />
        </Container>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
