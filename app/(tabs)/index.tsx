import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Alert,
  Platform,
  NativeModules,
  NativeEventEmitter,
} from "react-native";
import hotUpdate from "react-native-ota-hot-update";

const { OtaHotUpdate } = NativeModules;

// Cria o emitter só se o módulo nativo existir (iOS exige argumento não-nulo)
const otaEmitter =
  Platform.OS === "ios"
    ? OtaHotUpdate
      ? new NativeEventEmitter(OtaHotUpdate)
      : null
    : new NativeEventEmitter(); // Android permite null

export default function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otaEmitter) {
      const sub = otaEmitter.addListener("HotUpdateEvent", (event) => {
        // Exemplo de evento customizado do módulo nativo, se houver
        console.log("Evento OTA:", event);
      });
      return () => sub.remove();
    }
  }, []);

  const checkUpdate = () => {
    if (!OtaHotUpdate) {
      Alert.alert(
        "Módulo OTA não encontrado",
        "Certifique-se de usar uma build com o plugin nativo instalado."
      );
      return;
    }

    setLoading(true);
    hotUpdate.git.checkForGitUpdate({
      branch: Platform.OS === "ios" ? "main" : "main",
      bundlePath:
        Platform.OS === "ios"
          ? "output/main.jsbundle"
          : "output/index.android.bundle",
      url: "https://andreoleari1@bitbucket.org/hybrid-new-apps/expo-hot-update.git",
      onProgress: (rec, tot) =>
        console.log(`Progress: ${((rec / tot) * 100).toFixed(0)}%`),
      onCloneFailed: (msg) => {
        setLoading(false);
        Alert.alert("Clone falhou", msg);
      },
      onCloneSuccess: () =>
        Alert.alert("Clone OK", "Reinicie para aplicar", [
          { text: "OK", onPress: () => hotUpdate.resetApp() },
        ]),
      onPullFailed: (msg) => {
        setLoading(false);
        Alert.alert("Pull falhou", msg);
      },
      onPullSuccess: () =>
        Alert.alert("Pull OK", "Reinicie para aplicar", [
          { text: "OK", onPress: () => hotUpdate.resetApp() },
        ]),
      onFinishProgress: () => setLoading(false),
    });
  };

  return (
    <View
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Button
        title={loading ? "Carregando…" : "Verificar OTA Update"}
        onPress={checkUpdate}
      />
    </View>
  );
}
