import React from "react";
import { View, Text, Button } from "react-native";
import useCheckAppVersion from "../../hooks/useCheckAppVersion";

export default function Home() {
  const { version, onCheckVersion } = useCheckAppVersion();
  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <Text>Versão atual: {version}</Text>
      <Button title="Atualização" onPress={onCheckVersion} />
    </View>
  );
}
