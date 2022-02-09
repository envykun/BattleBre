import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, ImageBackground, ListRenderItem, Platform, SectionList, StyleSheet } from "react-native";
import { Button, FAB, Input, Overlay } from "react-native-elements";

import ListItemUnit from "../components/ListItems/ListItemUnit";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import { DataContext } from "../hooks/DataContext";
import { Rule, Unit } from "../utils/DataTypes";
import PointsOverview from "../components/PointsOverview/PointsOverview";
import OverviewRuleItemAccordion from "../components/ListItems/OverviewRuleItemAccordion";
import Layout from "../constants/Layout";

const Tab = createMaterialTopTabNavigator();

const Overview = () => {
  const colorScheme = useColorScheme();
  const { context } = useContext(DataContext);
  const [showAddOverlay, setShowAddOverlay] = useState<boolean>(false);
  const [allRules, setAllRules] = useState<Array<Rule | undefined>>(context.forceRules);
  const [customRule, setCustomRule] = useState<string>("");
  const [customRuleUnits, setCustomRuleUnits] = useState<string>("");

  useEffect(() => {
    addUnitRules();
  }, []);

  const addUnitRules = () => {
    const unitRules = context.unitData
      .flatMap((unit: Unit) => unit.rules)
      .reduce((acc: any, curr: Rule | undefined) => {
        const key = curr?.title;
        const found = key && acc.find((i: Rule) => i.title === key);
        if (!found) {
          acc.push(curr);
        } else {
          found.unit = [found.unit, curr.unit].flat(1);
        }
        return acc;
      }, []);
    const newArray = allRules ? allRules.concat(unitRules) : unitRules;
    setAllRules(newArray.sort((a: any, b: any) => (a.title < b.title ? -1 : 1)));
  };

  const renderRules = ({ item, index }: any) => {
    return (
      <View key={index} style={{ marginTop: 12, marginHorizontal: 12 }}>
        <OverviewRuleItemAccordion
          title={item.title}
          description={item.description}
          unit={item.unit}
          detachmentRule={item.detachmentRule}
        />
      </View>
    );
  };

  const addCustomRule = () => {
    if (customRule === "") return;
    const newEntry: Rule = {
      id: Math.random().toString(),
      title: "Custom Rule",
      description: customRule,
      unit: customRuleUnits,
      detachmentRule: false,
    };
    var newArray = [...allRules, newEntry];
    setAllRules(newArray);
    setShowAddOverlay(false);
    setCustomRule("");
    setCustomRuleUnits("");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.2 }}
      >
        <FlatList
          data={allRules}
          renderItem={renderRules}
          ListHeaderComponent={
            <PointsOverview
              rosterName={context.fileName}
              force={context.rosterCost.faction}
              cp={context.rosterCost.cp}
              points={context.rosterCost.points}
              cabal={context.rosterCost.cabal}
            />
          }
        />
        <FAB
          onPress={() => setShowAddOverlay(true)}
          icon={{ name: "add", color: "white" }}
          style={{ position: "absolute", right: 10, bottom: 16 }}
          size="small"
          color={Colors[colorScheme].primary}
        />
        <Overlay
          isVisible={showAddOverlay}
          onBackdropPress={() => {
            setShowAddOverlay(false);
            setCustomRule("");
          }}
        >
          <View style={{ width: 260 }}>
            <Text style={{ marginVertical: 8, fontWeight: "bold" }}>Custom Rule</Text>
            <View>
              <Text style={{ marginVertical: 4 }}>Add a custom rule</Text>
              <Input
                style={{ borderWidth: 1, marginTop: 16, paddingHorizontal: 4, borderBottomWidth: 0 }}
                multiline
                value={customRule}
                onChangeText={(text) => setCustomRule(text)}
              />
            </View>
            <View>
              <Text>For units</Text>
              <Input
                style={{ borderWidth: 1, marginTop: 16, paddingHorizontal: 4, borderBottomWidth: 0 }}
                multiline
                value={customRuleUnits}
                onChangeText={(text) => setCustomRuleUnits(text)}
              />
            </View>
            <Button
              type="solid"
              buttonStyle={{ backgroundColor: Colors[colorScheme].primary }}
              title="Add"
              onPress={() => addCustomRule()}
            />
          </View>
        </Overlay>
      </ImageBackground>
    </View>
  );
};

const Units = ({ navigation }: RootTabScreenProps<"TabOne">) => {
  const { context } = useContext(DataContext);
  const order = ["HQ", "Troops", "Elites", "Fast Attack", "Heavy Support", "Flyer", "Dedicated Transport"];

  const detachments = [...new Set(context.unitData.map((unit: Unit) => unit.detachment))];
  const sectionList = detachments.map((detachment: string) => {
    const data = context.unitData.filter((unit: Unit) => unit.detachment === detachment);
    return { title: detachment, data: data.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type)) };
  });

  const renderItem: ListRenderItem<Unit> = ({ item, index }) => {
    return (
      <ListItemUnit
        index={item.id}
        title={item.name}
        subTitle={item.type}
        costs={item.costs}
        firstItem={index === 0}
        onPress={() => navigation.navigate("Modal", { unit: item })}
      />
    );
  };
  return (
    <View style={styles.container}>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.2 }}
      >
        <SectionList
          sections={sectionList}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.title}>{title}</Text>}
          renderSectionFooter={() => <View style={styles.separator} />}
        />
      </ImageBackground>
    </View>
  );
};

export default function TabOneScreen({ navigation, route }: RootTabScreenProps<"TabOne">) {
  const colorScheme = useColorScheme();
  const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 20 : Constants.statusBarHeight;
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarIndicatorStyle: { backgroundColor: Colors[colorScheme].tint },
        }}
        style={{ marginTop: STATUSBAR_HEIGHT }}
      >
        <Tab.Screen name="Overview" component={Overview} />
        <Tab.Screen name="Units" component={Units} />
      </Tab.Navigator>
      <StatusBar backgroundColor={Colors[colorScheme].primary} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: Layout.spacing(3),
    marginBottom: Layout.spacing(2),
    marginTop: Layout.spacing(3),
  },
  separator: {
    marginBottom: Layout.spacing(4),
  },
});
