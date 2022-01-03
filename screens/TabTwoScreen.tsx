import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FlatList, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import Stratagem from "../components/Stratagem/Stratagem";
import { Text, View } from "../components/Themed";

const Tab = createMaterialTopTabNavigator();

const All = () => {
  const allStratagems = [
    { id: "1", title: "Stratagem 1" },
    { id: "2", title: "Stratagem 2" },
    { id: "3", title: "Stratagem 3" },
    { id: "4", title: "Stratagem 4" },
    { id: "5", title: "Stratagem 5" },
    { id: "6", title: "Stratagem 6" },
    { id: "7", title: "Stratagem 7" },
    { id: "8", title: "Stratagem 8" },
    { id: "9", title: "Stratagem 9" },
  ];

  const renderStratagems = ({ item, index }: any) => {
    return (
      <View style={{ marginVertical: 6 }}>
        <Stratagem
          key={index}
          title={item.title}
          subTitle="SubTitle"
          description="Dies ist die Beschreibung des Stratagems"
          cp="1"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList data={allStratagems} renderItem={renderStratagems} />
    </View>
  );
};

const ByPhase = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>By Phase</Text>
    </View>
  );
};

export default function TabTwoScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="All" component={All} />
      <Tab.Screen name="By Phase" component={ByPhase} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
