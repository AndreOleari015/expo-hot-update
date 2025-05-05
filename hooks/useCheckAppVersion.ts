// hooks/useCheckAppVersion.ts
import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import hotUpdate from "react-native-ota-hot-update";

const updateJsonUrl = "https://github.com/AndreOleari015/expo-hot-update/blob/main/update.json";

export default function useCheckAppVersion() {
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    hotUpdate.getCurrentVersion().then(setVersion);
  }, []);

  const onCheckVersion = async () => {
    const res = await fetch(updateJsonUrl);
    const { version: remoteVersion, downloadAndroidUrl, downloadIosUrl } = await res.json();
    if (remoteVersion > version) {
      const url = Platform.OS === "ios" ? downloadIosUrl : downloadAndroidUrl;
      Alert.alert(
        "Há uma nova versão!",
        "Deseja atualizar agora?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Atualizar",
            onPress: () => {
              hotUpdate
                .downloadBundleUri(ReactNativeBlobUtil, url, remoteVersion, {
                  updateSuccess: () => Alert.alert("Atualizado!", "Reinicie o app."),
                  restartAfterInstall: true,
                })
                .catch(e => Alert.alert("Erro ao atualizar", e.message));
            },
          },
        ]
      );
    }
  };

  return { version, onCheckVersion };
}
