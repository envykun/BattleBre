import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-elements";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import AddButton from "../components/FAB/AddButton";
import { getForce } from "../utils/DataExtractor";

interface Props {
  navigation: any;
}

const HomeScreen = ({ navigation }: Props) => {
  const [battlescribeData, setBattlescribeData] = useState<
    string | undefined
  >();
  const [fileName, setFileName] = useState<string | undefined>();

  async function pickFile() {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === "cancel") {
      return;
    }
    setFileName(result.name);
    let content = await FileSystem.readAsStringAsync(result.uri);
    setBattlescribeData(content);
  }

  function handleDelete() {
    setFileName(undefined);
    setBattlescribeData(undefined);
  }

  function handleProcess() {
    battlescribeData && getForce(battlescribeData);

    navigation.navigate("Root");
  }

  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <View style={{ flex: 1, justifyContent: "center" }}>
        {fileName ? (
          <View>
            <Text>{fileName}</Text>
            <Button
              onPress={() => handleDelete()}
              title="Delete"
              type="solid"
            />
          </View>
        ) : (
          <View>
            <AddButton
              title="Add Battlescribe file"
              onPress={() => pickFile()}
            />
            <Text>Add a File</Text>
          </View>
        )}
      </View>
      <Button
        onPress={() => handleProcess()}
        title="Process"
        disabled={battlescribeData ? false : true}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
  },
});
