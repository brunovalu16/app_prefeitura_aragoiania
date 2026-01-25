import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "styled-components/native";

import {
  AddressLine,
  AddressText,
  Backdrop,
  Box,
  CloseBtn,
  Header,
  HeaderTitle,
  MapBox,
  PinCenter,
  PrimaryBtn,
  PrimaryBtnText,
  SearchAction,
  SearchActionText,
  SearchInput,
  SearchRow,
} from "./styles";

export default function MapModal({ visible, onClose, onSelectLocation }) {
  const theme = useTheme();
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [region, setRegion] = useState(null);
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [sessionToken, setSessionToken] = useState(String(Date.now()));

  const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

  const initialRegion = useMemo(
    () => ({
      latitude: -16.9086,
      longitude: -49.4536,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [],
  );

  const busy = loading || searching || confirming;

  function animateTo(r) {
    try {
      mapRef.current?.animateToRegion(r, 350);
    } catch {}
  }

  async function reverseToAddress(lat, lng) {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      const a = res?.[0];
      if (!a) return "";

      const line1 =
        [a.street, a.streetNumber].filter(Boolean).join(", ") || a.name || "";
      const line2 = [a.district, a.city, a.region].filter(Boolean).join(" - ");
      const line3 = [a.postalCode].filter(Boolean).join("");

      return [line1, line2, line3].filter(Boolean).join(" • ");
    } catch {
      return "";
    }
  }

  async function fetchSuggestions(text) {
    const q = String(text || "").trim();

    if (!PLACES_KEY) {
      console.log("❌ Sem PLACES_KEY (EXPO_PUBLIC_GOOGLE_PLACES_KEY)");
      setSuggestions([]);
      return;
    }

    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": PLACES_KEY,
            // FieldMask controla o que volta na resposta
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
          },
          body: JSON.stringify({
            input: q,
            languageCode: "pt-BR",
            regionCode: "BR",
            // opcional: ajuda a “puxar” pra perto de Aragoiânia
            locationBias: {
              circle: {
                center: { latitude: -16.9086, longitude: -49.4536 },
                radius: 50000, // 50km
              },
            },
            sessionToken,
          }),
        },
      );

      const json = await res.json();

      const status = json?.error?.status || "OK";
      console.log("PLACES v1 status:", status);

      const list =
        (json?.suggestions || [])
          .map((s) => s?.placePrediction)
          .filter(Boolean)
          .map((p) => ({
            placeId: p.placeId,
            description: p?.text?.text || "",
          })) || [];

      console.log("predictions:", list.length);
      setSuggestions(list);
    } catch (e) {
      console.log("❌ fetchSuggestions v1 error:", e?.message || e);
      setSuggestions([]);
    }
  }

  // ✅ debounce enquanto digita
  useEffect(() => {
    if (!visible) return;

    const t = setTimeout(() => {
      fetchSuggestions(query);
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, visible, sessionToken, PLACES_KEY]);

  async function selectSuggestion(item) {
    if (!PLACES_KEY) return;

    try {
      Keyboard.dismiss();
      setSuggestions([]);

      const url = `https://places.googleapis.com/v1/places/${item.placeId}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": PLACES_KEY,
          "X-Goog-FieldMask": "id,formattedAddress,location",
        },
      });

      const json = await res.json();

      const loc = json?.location; // { latitude, longitude }
      const addr = json?.formattedAddress || item.description || "";

      if (!loc?.latitude || !loc?.longitude) return;

      setQuery(addr);
      setAddress(addr);

      const r = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(r);
      animateTo(r);

      setSessionToken(String(Date.now()));
    } catch (e) {
      console.log("❌ selectSuggestion v1 error:", e?.message || e);
    }
  }

  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        setLoading(true);
        setAddress("");
        setQuery("");
        setSuggestions([]);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setRegion(initialRegion);
          animateTo(initialRegion);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const r = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(r);
        animateTo(r);

        const addr = await reverseToAddress(r.latitude, r.longitude);
        setAddress(addr);
      } catch {
        setRegion(initialRegion);
        animateTo(initialRegion);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function handleMapPress(e) {
    const c = e?.nativeEvent?.coordinate;
    if (!c) return;

    const r = {
      latitude: c.latitude,
      longitude: c.longitude,
      latitudeDelta: (region || initialRegion).latitudeDelta,
      longitudeDelta: (region || initialRegion).longitudeDelta,
    };

    setRegion(r);
    animateTo(r);
  }

  async function handleSearch() {
    const q = String(query || "").trim();
    if (!q) return;

    try {
      Keyboard.dismiss();
      setSearching(true);
      setSuggestions([]);

      const res = await Location.geocodeAsync(q);
      const first = res?.[0];
      if (!first) {
        setAddress("Endereço não encontrado. Tente ser mais específico.");
        return;
      }

      const r = {
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(r);
      animateTo(r);

      const addr = await reverseToAddress(r.latitude, r.longitude);
      setAddress(addr || "Local encontrado.");
    } catch {
      setAddress("Não foi possível buscar esse endereço agora.");
    } finally {
      setSearching(false);
    }
  }

  async function handleConfirm() {
    if (busy) return;

    try {
      setConfirming(true);

      const r = region || initialRegion;

      const addr = await reverseToAddress(r.latitude, r.longitude);
      setAddress(addr);

      onSelectLocation?.({
        latitude: r.latitude,
        longitude: r.longitude,
        address: addr || "",
      });

      onClose?.();
    } finally {
      setConfirming(false);
    }
  }

  useEffect(() => {
    console.log(
      "PLACES_KEY exists?",
      !!PLACES_KEY,
      "len:",
      (PLACES_KEY || "").length,
    );
  }, [PLACES_KEY]);

  return (
    <Modal visible={!!visible} animationType="slide" transparent>
      <Backdrop>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <Box>
          <Header>
            <HeaderTitle>Selecionar localização</HeaderTitle>

            <CloseBtn onPress={onClose} disabled={busy}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </CloseBtn>
          </Header>

          <SearchRow>
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Digite um endereço (rua, bairro, cidade...)"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              editable={!busy}
            />

            <SearchAction onPress={handleSearch} disabled={busy}>
              {searching ? (
                <ActivityIndicator />
              ) : (
                <SearchActionText>BUSCAR</SearchActionText>
              )}
            </SearchAction>
          </SearchRow>

          {!!suggestions.length && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 180, paddingHorizontal: 14 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => selectSuggestion(item)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    marginBottom: 8,
                    backgroundColor: theme.colors.card,
                  }}
                >
                  <AddressText numberOfLines={2}>
                    {item.description}
                  </AddressText>
                </Pressable>
              )}
            />
          )}

          {!!address && (
            <AddressLine>
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.purple}
              />
              <AddressText numberOfLines={2}>{address}</AddressText>
            </AddressLine>
          )}

          <MapBox>
            {!region && loading ? (
              <ActivityIndicator style={{ marginTop: 24 }} />
            ) : (
              <>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={region || initialRegion}
                  onRegionChangeComplete={(r) => setRegion(r)}
                  onPress={handleMapPress}
                  showsUserLocation
                  showsMyLocationButton
                />

                <PinCenter pointerEvents="none">
                  <Ionicons
                    name="location-sharp"
                    size={34}
                    color={theme.colors.purple}
                  />
                </PinCenter>
              </>
            )}
          </MapBox>

          <PrimaryBtn onPress={handleConfirm} disabled={busy || !region}>
            {confirming ? (
              <ActivityIndicator />
            ) : (
              <PrimaryBtnText>
                {busy ? "AGUARDE..." : "CONFIRMAR LOCAL"}
              </PrimaryBtnText>
            )}
          </PrimaryBtn>
        </Box>
      </Backdrop>
    </Modal>
  );
}
