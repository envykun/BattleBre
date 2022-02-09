import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, Image, StyleSheet, Text, View, Platform } from "react-native";
import { Avatar, FAB, Icon, ListItem } from "react-native-elements";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import { checkIfValid, getForce } from "../utils/DataExtractor";
import Colors, { setCodexColor } from "../constants/Colors";
import { DataContext, DataContextValueType, DataExtractorType } from "../hooks/DataContext";
import Constants from "expo-constants";
import { useIsFocused } from "@react-navigation/native";
import { useFetchStratagemData } from "../hooks/useFetchStratagemData";

interface Props {
  navigation: any;
}

const HomeScreen = ({ navigation }: Props) => {
  const [battlescribeData, setBattlescribeData] = useState<string | undefined>();
  const [battlescribeData2, setBattlescribeData2] = useState<string | undefined>();
  const [battlescribeData3, setBattlescribeData3] = useState<string | undefined>();
  const [battlescribeData4, setBattlescribeData4] = useState<string | undefined>();
  const [indexArray, setIndexArray] = useState<Array<number>>([]);
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileName2, setFileName2] = useState<string | undefined>();
  const [fileName3, setFileName3] = useState<string | undefined>();
  const [fileName4, setFileName4] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const [loading4, setLoading4] = useState(true);
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [error3, setError3] = useState(false);
  const [error4, setError4] = useState(false);

  const [loadingStratagems, setLoadingStratagems] = useState(false);

  const { setContext } = useContext(DataContext);
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : Constants.statusBarHeight;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setCodexColor("default");
    }
  }, [isFocused]);

  async function pickFile() {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === "cancel") {
      return;
    }
    console.log(result.mimeType);
    if (!indexArray.includes(1)) {
      setFileName(result.name);
      setIndexArray([...indexArray, 1]);
      await FileSystem.readAsStringAsync(result.uri, { encoding: "utf8" })
        .then((data) => {
          checkIfValid(data)
            .then(() => {
              setBattlescribeData(data);
            })
            .catch((e) => {
              setError(true);
            });
        })
        .catch((e) => setError(true));
      setLoading(false);
    } else if (!indexArray.includes(2)) {
      setFileName2(result.name);
      setIndexArray([...indexArray, 2]);
      await FileSystem.readAsStringAsync(result.uri)
        .then((data) => {
          checkIfValid(data)
            .then(() => {
              setBattlescribeData2(data);
            })
            .catch((e) => {
              setError2(true);
            });
        })
        .catch((e) => setError2(true));
      setLoading2(false);
    } else if (!indexArray.includes(3)) {
      setFileName3(result.name);
      setIndexArray([...indexArray, 3]);
      await FileSystem.readAsStringAsync(result.uri)
        .then((data) => {
          checkIfValid(data)
            .then(() => {
              setBattlescribeData3(data);
            })
            .catch((e) => {
              setError3(true);
            });
        })
        .catch((e) => setError3(true));
      setLoading3(false);
    } else {
      setFileName4(result.name);
      if (!indexArray.includes(4)) {
        setIndexArray([...indexArray, 4]);
      }
      await FileSystem.readAsStringAsync(result.uri)
        .then((data) => {
          checkIfValid(data)
            .then(() => {
              setBattlescribeData4(data);
            })
            .catch((e) => {
              setError4(true);
            });
        })
        .catch((e) => setError4(true));
      setLoading4(false);
    }
  }

  function handleDelete(num: string) {
    switch (num) {
      case "1":
        setFileName(undefined);
        setBattlescribeData(undefined);
        setError(false);
        setLoading(true);
        setIndexArray((prev) => prev.filter((i: number) => i !== 1));
        break;
      case "2":
        setFileName2(undefined);
        setBattlescribeData2(undefined);
        setError2(false);
        setLoading2(true);
        setIndexArray((prev) => prev.filter((i: number) => i !== 2));
        break;
      case "3":
        setFileName3(undefined);
        setBattlescribeData3(undefined);
        setError3(false);
        setLoading3(true);
        setIndexArray((prev) => prev.filter((i: number) => i !== 3));
        break;
      case "4":
        setFileName4(undefined);
        setBattlescribeData4(undefined);
        setError4(false);
        setLoading4(true);
        setIndexArray((prev) => prev.filter((i: number) => i !== 4));
      default:
        break;
    }
  }

  function handleProcess(index: number) {
    let newData: DataExtractorType;
    let newContext: DataContextValueType | undefined = undefined;
    setLoadingStratagems(true);
    try {
      switch (index) {
        case 1:
          if (battlescribeData) {
            const isZip = fileName?.includes(".rosz") || false;
            newData = getForce(battlescribeData, isZip);
            useFetchStratagemData(newData.rosterCost.faction)
              .then((res) => {
                newContext = { fileName: fileName?.replace(".rosz", "").replace(".ros", "") || "", stratagems: res, ...newData };
                setContext(newContext);
                setCodexColor(newContext.rosterCost.faction);
                setLoadingStratagems(false);
                navigation.navigate("Root");
              })
              .catch((e) => {
                console.log(e);
                setLoadingStratagems(false);
              });
          }
          break;
        case 2:
          if (battlescribeData2) {
            const isZip = fileName2?.includes(".rosz") || false;
            newData = getForce(battlescribeData2, isZip);
            useFetchStratagemData(newData.rosterCost.faction)
              .then((res) => {
                newContext = { fileName: fileName?.replace(".rosz", "").replace(".ros", "") || "", stratagems: res, ...newData };
                setContext(newContext);
                setCodexColor(newContext.rosterCost.faction);
                setLoadingStratagems(false);
                navigation.navigate("Root");
              })
              .catch((e) => {
                console.log(e);
                setLoadingStratagems(false);
              });
          }
          break;
        case 3:
          if (battlescribeData3) {
            const isZip = fileName3?.includes(".rosz") || false;
            newData = getForce(battlescribeData3, isZip);
            useFetchStratagemData(newData.rosterCost.faction)
              .then((res) => {
                newContext = { fileName: fileName?.replace(".rosz", "").replace(".ros", "") || "", stratagems: res, ...newData };
                setContext(newContext);
                setCodexColor(newContext.rosterCost.faction);
                setLoadingStratagems(false);
                navigation.navigate("Root");
              })
              .catch((e) => {
                console.log(e);
                setLoadingStratagems(false);
              });
          }
          break;
        case 4:
          if (battlescribeData4) {
            const isZip = fileName4?.includes(".rosz") || false;
            newData = getForce(battlescribeData4, isZip);
            useFetchStratagemData(newData.rosterCost.faction)
              .then((res) => {
                newContext = { fileName: fileName?.replace(".rosz", "").replace(".ros", "") || "", stratagems: res, ...newData };
                setContext(newContext);
                setCodexColor(newContext.rosterCost.faction);
                setLoadingStratagems(false);
                navigation.navigate("Root");
              })
              .catch((e) => {
                console.log(e);
                setLoadingStratagems(false);
              });
          }
          break;
        default:
          break;
      }
    } catch (e) {
      console.log("ERROR", e);
    }
  }

  const SwipeToDelete = (index: string) => {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7D5D4" }}>
        <FAB
          onPress={() => handleDelete(index)}
          color="#F7D5D4"
          size="small"
          icon={{ name: "delete", type: "material-icons", color: "#D33736" }}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { marginTop: STATUSBAR_HEIGHT }]}>
      <ImageBackground
        style={{ width: "100%", height: "40%", overflow: "hidden" }}
        source={require("../assets/images/emperor.png")}
        imageStyle={{ height: 560, bottom: undefined, top: 0 }}
      ></ImageBackground>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.2 }}
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
        <View style={{ height: 300, paddingVertical: 18 }}>
          <View>
            {fileName && (
              <View>
                <ListItem.Swipeable
                  onPress={() => handleProcess(1)}
                  topDivider
                  bottomDivider
                  rightContent={<View style={{ flex: 1 }}>{SwipeToDelete("1")}</View>}
                  containerStyle={{ backgroundColor: Colors.dark.secondary, padding: 6, paddingLeft: 12 }}
                  disabled={error}
                >
                  <Avatar size={48} rounded icon={{ name: "file-code-outline", type: "material-community", size: 32, color: "black" }} />
                  <ListItem.Content>
                    <ListItem.Title>{fileName}</ListItem.Title>
                  </ListItem.Content>
                  {loading ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Avatar
                      size={24}
                      rounded
                      icon={
                        error
                          ? { name: "alert-circle-outline", type: "material-community", size: 24, color: "red" }
                          : { name: "check-circle-outline", type: "material", size: 24, color: "green" }
                      }
                    />
                  )}
                  <ListItem.Chevron />
                </ListItem.Swipeable>
              </View>
            )}
            {fileName2 && (
              <View>
                <ListItem.Swipeable
                  onPress={() => handleProcess(2)}
                  bottomDivider
                  rightContent={<View style={{ flex: 1 }}>{SwipeToDelete("2")}</View>}
                  containerStyle={{ backgroundColor: Colors.dark.secondary, padding: 6, paddingLeft: 12 }}
                  disabled={error2}
                >
                  <Avatar size={48} rounded icon={{ name: "file-code-outline", type: "material-community", size: 32, color: "black" }} />
                  <ListItem.Content>
                    <ListItem.Title>{fileName2}</ListItem.Title>
                  </ListItem.Content>
                  {loading2 ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Avatar
                      size={24}
                      rounded
                      icon={
                        error2
                          ? { name: "alert-circle-outline", type: "material-community", size: 24, color: "red" }
                          : { name: "check-circle-outline", type: "material", size: 24, color: "green" }
                      }
                    />
                  )}
                  <ListItem.Chevron />
                </ListItem.Swipeable>
              </View>
            )}
            {fileName3 && (
              <View>
                <ListItem.Swipeable
                  onPress={() => handleProcess(3)}
                  bottomDivider
                  rightContent={<View style={{ flex: 1 }}>{SwipeToDelete("3")}</View>}
                  containerStyle={{ backgroundColor: Colors.dark.secondary, padding: 6, paddingLeft: 12 }}
                  disabled={error3}
                >
                  <Avatar size={48} rounded icon={{ name: "file-code-outline", type: "material-community", size: 32, color: "black" }} />
                  <ListItem.Content>
                    <ListItem.Title>{fileName3}</ListItem.Title>
                  </ListItem.Content>
                  {loading3 ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Avatar
                      size={24}
                      rounded
                      icon={
                        error3
                          ? { name: "alert-circle-outline", type: "material-community", size: 24, color: "red" }
                          : { name: "check-circle-outline", type: "material", size: 24, color: "green" }
                      }
                    />
                  )}
                  <ListItem.Chevron />
                </ListItem.Swipeable>
              </View>
            )}
            {fileName4 && (
              <View>
                <ListItem.Swipeable
                  onPress={() => handleProcess(4)}
                  bottomDivider
                  rightContent={<View style={{ flex: 1 }}>{SwipeToDelete("4")}</View>}
                  containerStyle={{ backgroundColor: Colors.dark.secondary, padding: 6, paddingLeft: 12 }}
                  disabled={error4}
                >
                  <Avatar size={48} rounded icon={{ name: "file-code-outline", type: "material-community", size: 32, color: "black" }} />
                  <ListItem.Content>
                    <ListItem.Title>{fileName4}</ListItem.Title>
                  </ListItem.Content>
                  {loading4 ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Avatar
                      size={24}
                      rounded
                      icon={
                        error4
                          ? { name: "alert-circle-outline", type: "material-community", size: 24, color: "red" }
                          : { name: "check-circle-outline", type: "material", size: 24, color: "green" }
                      }
                    />
                  )}
                  <ListItem.Chevron />
                </ListItem.Swipeable>
              </View>
            )}
          </View>
          {indexArray.length === 0 ? (
            <View>
              <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <Icon type="ant-design" name="unknowfile1" size={82} color={"#a10000"} />
                <Text style={{ fontSize: 18, marginTop: 8 }}>No file selected.</Text>
              </View>
              <FAB
                icon={{
                  name: "add",
                  type: "ionicons",
                  color: "white",
                  size: 32,
                }}
                color={Colors.dark.primary}
                size="small"
                iconContainerStyle={{ justifyContent: "center", alignItems: "center", padding: 0 }}
                onPress={() => pickFile()}
              />
            </View>
          ) : (
            indexArray.length < 4 && (
              <View style={{ marginTop: 12 }}>
                <FAB
                  icon={{
                    name: "add",
                    type: "ionicons",
                    color: "white",
                    size: 32,
                  }}
                  color={Colors.dark.primary}
                  size="small"
                  iconContainerStyle={{ justifyContent: "center", alignItems: "center", padding: 0 }}
                  onPress={() => pickFile()}
                />
              </View>
            )
          )}
        </View>
      </ImageBackground>
      {loadingStratagems && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  descText: {
    paddingVertical: 4,
  },
  separator: {
    alignSelf: "center",
    height: 1,
    width: "95%",
    backgroundColor: Colors.light.text,
  },
  bottomView: {
    flex: 1,
    justifyContent: "center",
  },
  loadingIndicator: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
