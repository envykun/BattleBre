import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Input, ListItem, Overlay } from "react-native-elements";

import EditScreenInfo from "../components/EditScreenInfo";
import AddButton from "../components/FAB/AddButton";
import ListItemUnit from "../components/ListItems/ListItemUnit";
import OverviewRuleItem from "../components/ListItems/OverviewRuleItem";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import ModalScreen from "./ModalScreen";

const Tab = createMaterialTopTabNavigator();

const Overview = () => {
  const rulesOverview = [
    { id: "1", title: "Rule 1" },
    { id: "2", title: "Rule 1" },
    // { id: "3", title: "Rule 1" },
    // { id: "31", title: "Rule 1" },
    // { id: "32", title: "Rule 1" },
    // { id: "33", title: "Rule 1" },
    // { id: "34", title: "Rule 1" },
    // { id: "35", title: "Rule 1" },
    // { id: "36", title: "Rule 1" },
    // { id: "37", title: "Rule 1" },
    // { id: "38", title: "Rule 1" },
    // { id: "39", title: "Rule 1" },
  ];

  const [showAddOverlay, setShowAddOverlay] = useState<boolean>(false);
  const [allRules, setAllRules] = useState(rulesOverview);
  const [customRule, setCustomRule] = useState<string>("");

  const renderRules = ({ item, index }: any) => {
    return (
      <View key={index} style={{ paddingHorizontal: 20, paddingVertical: 4 }}>
        <OverviewRuleItem />
      </View>
    );
  };

  const addCustomRule = () => {
    const newEntry = {
      id: Math.random().toString(),
      title: "Custom Rule",
    };
    var newArray = [...allRules, newEntry];
    setAllRules(newArray);
    setShowAddOverlay(false);
  };

  return (
    <View style={styles.container}>
      <FlatList data={allRules} renderItem={renderRules} />
      <View style={{ alignItems: "center" }}>
        <AddButton title="Custom" onPress={() => setShowAddOverlay(true)} />
      </View>
      <Overlay
        isVisible={showAddOverlay}
        onBackdropPress={() => setShowAddOverlay(false)}
      >
        <View style={{ width: 260 }}>
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            Add a custom rule
          </Text>
          <View>
            <Input
              multiline
              value={customRule}
              onChangeText={(text) => setCustomRule(text)}
            />
          </View>
          <Button title="Add" onPress={() => addCustomRule()} />
        </View>
      </Overlay>
    </View>
  );
};

const Units = ({ navigation }: RootTabScreenProps<"TabOne">) => {
  const dummyList = [
    { id: "archon", title: "Archon" },
    { id: "drazhar", title: "Drazhar" },
    { id: "succubus", title: "Succubus" },
    { id: "raider", title: "Raider" },
    { id: "kabaliteWarrior", title: "Kabalite Warrior" },
    { id: "wyches", title: "Wyches" },
    { id: "1", title: "Unit" },
    { id: "2", title: "Unit" },
    { id: "3", title: "Unit" },
    { id: "4", title: "Unit" },
    { id: "5", title: "Unit" },
    { id: "6", title: "Unit" },
    { id: "7", title: "Unit" },
    { id: "8", title: "Unit" },
    { id: "9", title: "Unit" },
    { id: "10", title: "Unit" },
    { id: "11", title: "Unit" },
  ];
  const renderItem = ({ item, index }: any) => (
    <ListItemUnit
      index={index}
      title={item.title}
      onPress={() => navigation.navigate("Modal", { unit: item.title })}
    />
  );
  return (
    <View style={styles.container}>
      <FlatList data={dummyList} renderItem={renderItem} />
    </View>
  );
};

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Overview" component={Overview} />
      <Tab.Screen name="Units" component={Units} />
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
