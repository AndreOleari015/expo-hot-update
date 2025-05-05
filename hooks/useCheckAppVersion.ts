// hooks/useCheckAppVersion.ts
import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import hotUpdate from "react-native-ota-hot-update";

const UPDATE_JSON_URL =
  "https://raw.githubusercontent.com/AndreOleari015/expo-hot-update/main/update.json";

export default function useCheckAppVersion() {
  const [version, setVersion] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // lê a versão atual (retornada pelo plugin após último update)
  useEffect(() => {
    hotUpdate.getCurrentVersion().then(setVersion);
  }, []);

  const onCheckVersion = async () => {
    setLoading(true);
    try {
      const res = await fetch(UPDATE_JSON_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const update = await res.json();

      const remoteVersion = update.version as number;
      if (remoteVersion <= version) {
        Alert.alert("Já está atualizado", `Versão atual: ${version}`);
        setLoading(false);
        return;
      }

      const downloadUrl =
        Platform.OS === "ios"
          ? update.downloadIosUrl
          : update.downloadAndroidUrl;

      Alert.alert(
        "Nova versão disponível",
        `Atualização v${remoteVersion} encontrada.\nDeseja baixar agora?`,
        [
          { text: "Cancelar", style: "cancel", onPress: () => setLoading(false) },
          {
            text: "Atualizar",
            onPress: () => {
              hotUpdate
                .downloadBundleUri(
                  ReactNativeBlobUtil,
                  downloadUrl,
                  remoteVersion,
                  {
                    updateSuccess: () =>
                      Alert.alert("Atualizado!", "Reinicie o app."),
                    restartAfterInstall: true,
                  }
                )
                .catch((e) =>
                  Alert.alert("Erro ao atualizar", e.message)
                )
                .finally(() => setLoading(false));
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert("Erro ao verificar atualização", e.message);
      setLoading(false);
    }
  };

  return { version, loading, onCheckVersion };
}
