import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import { Avatar, FAB, Icon, ListItem } from "react-native-elements";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

// import { checkIfValid, getForce } from "../utils/DataExtractor";
import { checkIfValid, getForce } from "../utils/ParseBattleScribeData";
import Colors, { setCodexColor } from "../constants/Colors";
import { DataContext, DataContextValueType, DataExtractorType } from "../hooks/DataContext";
import Constants from "expo-constants";
import { useIsFocused } from "@react-navigation/native";
import { useFetchStratagemData } from "../hooks/useFetchStratagemData";
import CircularProgress from "react-native-circular-progress-indicator";

interface Props {
  navigation: any;
}

const HomeScreen = ({ navigation }: Props) => {
  const [battlescribeData, setBattlescribeData] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<unknown | undefined>();

  const [loadingData, setLoadingData] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState<boolean>(false);

  const { setContext } = useContext(DataContext);
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : Constants.statusBarHeight;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setCodexColor("default");
    }
  }, [isFocused]);

  useEffect(() => {
    battlescribeData && handleProcess();
  }, [battlescribeData]);

  async function pickFile() {
    setLoading(true);
    let result = await DocumentPicker.getDocumentAsync({});
    setLoadingAnimation(true);
    if (result.type === "cancel") {
      setLoading(false);
      setLoadingAnimation(false);
      return;
    }
    setFileName(result.name);
    await FileSystem.readAsStringAsync(result.uri, { encoding: result.name.includes(".rosz") ? "base64" : "utf8" })
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
  }

  function handleDelete() {
    setFileName(undefined);
    setBattlescribeData(undefined);
    setError(false);
    setErrorMessage(undefined);
  }

  async function handleProcess() {
    let newData: DataExtractorType;
    let newContext: DataContextValueType | undefined = undefined;
    setLoadingData(true);
    try {
      if (battlescribeData) {
        const isZip = fileName?.includes(".rosz") || false;
        newData = await getForce(battlescribeData, isZip);
        useFetchStratagemData(newData.rosterCost.faction)
          .then((res) => {
            newContext = { fileName: fileName?.replace(".rosz", "").replace(".ros", "") || "", stratagems: res, ...newData };
            setContext(newContext);
            setCodexColor(newContext.rosterCost.faction);
            setLoadingData(false);
          })
          .catch((e) => {
            setError(true);
            setErrorMessage("There was an error fetching the Stratagems.");
            console.log(e);
            setLoadingData(false);
          });
      }
    } catch (e) {
      setError(true);
      console.log("Error:", e);
      setErrorMessage("There was an error with the roster file. Please try again.");
      setLoadingData(false);
    }
  }
  const handleNavigation = () => {
    navigation.navigate("Root");
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
          <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
            {loadingData || loadingAnimation ? (
              <View style={styles.loading}>
                <CircularProgress
                  value={100}
                  radius={50}
                  valueSuffix={"%"}
                  progressValueColor={Colors.light.text}
                  activeStrokeColor={Colors.default.success}
                  inActiveStrokeColor="black"
                  inActiveStrokeOpacity={0.65}
                  dashedStrokeConfig={{
                    count: 50,
                    width: 3,
                  }}
                  onAnimationComplete={() => setLoadingAnimation(false)}
                />
                <Text style={{ fontSize: 18, marginTop: 8, marginBottom: 16 }}>Loading Roster ...</Text>
              </View>
            ) : (
              <View>
                {!fileName ? (
                  <View>
                    <Icon type="ant-design" name="unknowfile1" size={82} color={Colors.default.error} />
                    <Text style={{ fontSize: 18, marginTop: 8, marginBottom: 16 }}>No file selected.</Text>
                  </View>
                ) : error ? (
                  <View>
                    <Icon type="material-community" name="alert-circle-outline" size={82} color={Colors.default.error} />
                    <Text style={{ fontSize: 18, marginTop: 8, marginBottom: 16, paddingHorizontal: 6 }}>{errorMessage}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.navigationContainer} onPress={handleNavigation}>
                    <View>
                      <Icon type="material" name="check-circle-outline" size={82} color={Colors.default.success} />
                      <Text style={{ fontSize: 18, marginTop: 8, marginBottom: 16 }}>{fileName}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <FAB
                  icon={{
                    name: fileName ? "delete" : "add",
                    type: "ionicons",
                    color: "white",
                    size: 32,
                  }}
                  color={fileName ? Colors.default.error : Colors.dark.primary}
                  size="large"
                  iconContainerStyle={{ justifyContent: "center", alignItems: "center", padding: 0 }}
                  onPress={fileName ? handleDelete : pickFile}
                />
              </View>
            )}
          </View>
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
  loading: {
    justifyContent: "center",
    alignItems: "center",
  },
  navigationContainer: {
    borderRadius: 12,
  },
});
