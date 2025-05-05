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

  // lê a versão atual armazenada pelo plugin
  useEffect(() => {
    hotUpdate.getCurrentVersion().then(setVersion);
  }, []);

  const onCheckVersion = async () => {
    setLoading(true);

    try {
      const res = await fetch(UPDATE_JSON_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const {
        version: remoteVersion,
        downloadAndroidUrl,
        downloadIosUrl,
      } = await res.json();
      console.log(remoteVersion)
      if (remoteVersion <= version) {
        Alert.alert("Já está atualizado", `Versão atual: ${version}`);
        setLoading(false);
        return;
      }

      const downloadUrl =
        Platform.OS === "ios" ? downloadIosUrl : downloadAndroidUrl;

      Alert.alert(
        "Nova versão disponível",
        `Atualização v${remoteVersion} encontrada.\nDeseja baixar agora?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setLoading(false),
          },
          {
            text: "Atualizar",
            onPress: () => {
              hotUpdate.downloadBundleUri(
                ReactNativeBlobUtil,
                downloadUrl,
                remoteVersion,
                {
                  // disparado após aplicar o bundle com sucesso
                  updateSuccess: () => {
                    setLoading(false);
                    Alert.alert("Atualizado!", "Reinicie o app.");
                  },
                  // disparado em caso de falha no download/unzip
                  updateFail: (message: string) => {
                    setLoading(false);
                    Alert.alert("Erro ao atualizar", message);
                  },
                  // reinicia automaticamente após instalar
                  restartAfterInstall: true,
                  // callback de progresso do download
                  progress: (received, total) =>
                    console.log(
                      `Download progress: ${((received / total) * 100).toFixed(0)}%`
                    ),
                  // headers, extensionBundle, restartDelay, etc. também podem ser configurados aqui
                }
              );
            },
          },
        ]
      );
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Erro ao verificar atualização", e.message);
    }
  };

  return { version, loading, onCheckVersion };
}
