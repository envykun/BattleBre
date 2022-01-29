import React, { useContext, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { Button, Icon } from "react-native-elements";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import { getForce } from "../utils/DataExtractor";
import Colors, { setCodexColor } from "../constants/Colors";
import { DataContext, DataContextValueType } from "../hooks/DataContext";

interface Props {
  navigation: any;
}

const HomeScreen = ({ navigation }: Props) => {
  const [battlescribeData, setBattlescribeData] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const { setContext } = useContext(DataContext);

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
    const newData = battlescribeData && getForce(battlescribeData);
    let newContext = newData;
    newContext.fileName = fileName?.replace(".rosz", "").replace(".ros", "");

    setContext(newData);
    (global as any).rosterName = fileName;
    setCodexColor(newData.rosterCost.faction);

    navigation.navigate("Root");
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%", backgroundColor: Colors.light.primary }}
        source={require("../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.4 }}
      >
        <View style={styles.description}>
          <Text style={styles.descText}>Welcome to the inofficial Warhammer 40.000 Army List Helper.</Text>
          <Text style={styles.descText}>
            To start select a <Text style={{ fontWeight: "bold" }}>*.ros/*.rosz</Text> file from your device down below.
          </Text>
          <Text style={styles.descText}>
            These files are your typical battlescribe rosters and are stored on your device in the respective folder.
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={{ height: 300, justifyContent: "center" }}>
          {fileName ? (
            <View>
              <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <Icon type="ant-design" name="file1" size={128} color={"#00bb2f"} />
                <Text style={{ fontSize: 18, marginTop: 8 }}>{fileName}</Text>
              </View>
              <Button
                title="DELETE"
                icon={{
                  name: "delete",
                  type: "ant-design",
                  size: 14,
                  color: "white",
                }}
                iconRight
                iconContainerStyle={{ marginLeft: 10 }}
                titleStyle={{ fontWeight: "700" }}
                buttonStyle={{
                  backgroundColor: "#a10000",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 30,
                }}
                containerStyle={{
                  width: 180,
                  alignSelf: "center",
                }}
                onPress={() => handleDelete()}
              />
            </View>
          ) : (
            <View>
              <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <Icon type="ant-design" name="unknowfile1" size={128} color={"#a10000"} />
                <Text style={{ fontSize: 18, marginTop: 8 }}>No file selected.</Text>
              </View>
              <Button
                title="ADD FILE"
                icon={{
                  name: "addfile",
                  type: "ant-design",
                  size: 14,
                  color: "white",
                }}
                iconRight
                iconContainerStyle={{ marginLeft: 10 }}
                titleStyle={{ fontWeight: "700" }}
                buttonStyle={{
                  backgroundColor: "#000000",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 30,
                }}
                containerStyle={{
                  width: 180,
                  alignSelf: "center",
                }}
                onPress={() => pickFile()}
              />
            </View>
          )}
        </View>
        <View style={styles.separator} />
        <View style={styles.bottomView}>
          <Button
            onPress={() => handleProcess()}
            title="START PROCESS"
            disabled={battlescribeData ? false : true}
            titleStyle={{ fontWeight: "700" }}
            icon={{
              name: "rightcircleo",
              type: "ant-design",
              size: 16,
              color: "white",
            }}
            iconRight
            iconContainerStyle={{ marginLeft: 10 }}
            buttonStyle={{
              backgroundColor: "#000000",
              borderColor: "transparent",
              borderWidth: 0,
              borderRadius: 30,
            }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
            }}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  descText: {
    paddingVertical: 4,
  },
  separator: {
    alignSelf: "center",
    height: 1,
    width: "80%",
    backgroundColor: Colors.light.text,
  },
  bottomView: {
    flex: 1,
    justifyContent: "center",
  },
});
