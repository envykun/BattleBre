import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import React, { PureComponent, useContext, useEffect, useState } from "react";
import { Animated, FlatList, ImageBackground, ListRenderItem, Platform, ScrollView, SectionList, StyleSheet } from "react-native";
import { Chip, FAB, SearchBar, ListItem } from "react-native-elements";
import { Picker } from "@react-native-community/picker";
import Stratagem from "../components/Stratagem/Stratagem";
import { Text, View } from "../components/Themed";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import { ItemValue } from "@react-native-community/picker/typings/Picker";
import Layout from "../constants/Layout";
import { ENEMYPHASE, PHASES, PLAYERPHASE, StratagemData } from "../utils/DataTypes";
import { DataContext } from "../hooks/DataContext";

const Tab = createMaterialTopTabNavigator();

const All = () => {
  const { context } = useContext(DataContext);
  const allStratagems: Array<StratagemData> | undefined = context.stratagems?.data.sort((a, b) => (a.title < b.title ? -1 : 1));

  const colorScheme = useColorScheme();

  const [search, setSearch] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [filteredStratagems, setFilteredStratagems] = useState(allStratagems);

  const updateSearch = (search: string): any => {
    setSearch(search);
  };

  useEffect(() => {
    if (search.length > 0) {
      const filtered = allStratagems?.filter(
        (strat) =>
          strat?.title.toLowerCase().includes(search.toLowerCase()) || strat?.description.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStratagems(filtered);
    } else {
      setFilteredStratagems(allStratagems);
    }
  }, [search]);

  const renderStratagems: ListRenderItem<StratagemData> = ({ item }) => {
    return (
      <View style={{ marginTop: 12, marginHorizontal: 12 }}>
        <Stratagem
          key={item.id}
          id={item.id}
          title={item.title}
          subTitle={item.subTitle}
          optional={item.optional}
          description={item.description}
          descriptionEnd={item.descriptionEnd}
          list={item.list}
          cp={item.cp}
          cp2={item.cp2}
        />
      </View>
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
        {showSearch && (
          <SearchBar
            lightTheme
            onChangeText={(text: any) => updateSearch(text)}
            onClear={() => setSearch("")}
            placeholder="Search..."
            value={search}
            round
            containerStyle={{ backgroundColor: Colors[colorScheme].primary }}
            inputContainerStyle={{ backgroundColor: "white" }}
            inputStyle={{ color: "black" }}
          />
        )}

        <FlatList
          data={filteredStratagems}
          renderItem={renderStratagems}
          initialNumToRender={7}
          ListFooterComponentStyle={{ marginBottom: 12 }}
          ListFooterComponent={<View />}
        />
        <FAB
          icon={{ name: showSearch ? "close" : "search", color: "white" }}
          style={{ position: "absolute", right: 10, bottom: 16 }}
          onPress={() => setShowSearch(!showSearch)}
          size="small"
          color={Colors[colorScheme].primary}
        />
      </ImageBackground>
    </View>
  );
};

const ByPhase = () => {
  const { context } = useContext(DataContext);
  const allStratagems: Array<StratagemData> | undefined = context.stratagems?.data.sort((a, b) => (a.title < b.title ? -1 : 1));
  const allPhases: any = context.stratagems?.phases;

  const sectionList = Object.keys(allPhases).map((key: string) => {
    const data = allPhases[key]
      .map((phase: string) => allStratagems?.find((strat: StratagemData) => phase === strat.id))
      .filter((arr: any) => arr !== undefined);
    return { title: key, data: data };
  });

  const colorScheme = useColorScheme();

  const [activeChip, setActiveChip] = useState<ItemValue>();
  const [phase, setPhase] = useState(sectionList);
  const headerHeight: number = 50 + Layout.spacing(4) + 1;
  const scrollY = new Animated.Value(0);
  const diffClamp = Animated.diffClamp(scrollY, 0, headerHeight);
  const translateY = diffClamp.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
  });

  useEffect(() => {
    if (!activeChip) {
      return;
    }
    if (activeChip === "ALL") {
      setPhase(sectionList);
    } else {
      setPhase(sectionList.filter((item) => item.title === activeChip));
    }
  }, [activeChip]);

  const renderStratagems: ListRenderItem<StratagemData> = ({ item }) => {
    return (
      <View style={{ marginTop: 12, marginHorizontal: 12 }}>
        <Stratagem
          key={item.id}
          id={item.id}
          title={item.title}
          subTitle={item.subTitle}
          optional={item.optional}
          description={item.description}
          descriptionEnd={item.descriptionEnd}
          list={item.list}
          cp={item.cp}
          cp2={item.cp2}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: translateY }], elevation: 4 }}>
        <View style={[styles.chipContainer, { backgroundColor: Colors[colorScheme].primary }]}>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={activeChip}
              onValueChange={(itemValue: ItemValue) => setActiveChip(itemValue)}
            >
              {Object.values(PHASES).map((item, index) => {
                return <Picker.Item key={index} label={item} value={item} color="black" />;
              })}
              {Object.values(PLAYERPHASE).map((item, index) => {
                return <Picker.Item key={index} label={item} value={item} color="green" />;
              })}
              {Object.values(ENEMYPHASE).map((item, index) => {
                return <Picker.Item key={index} label={item} value={item} color="red" />;
              })}
            </Picker>
          </View>
        </View>
      </Animated.View>
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../assets/images/background.jpg")}
        imageStyle={{ opacity: 0.2 }}
      >
        <SectionList
          sections={phase}
          renderItem={renderStratagems}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.title}>{title}</Text>}
          renderSectionFooter={() => <View style={{ marginBottom: Layout.spacing(4) }} />}
          onScroll={(e) => scrollY.setValue(e.nativeEvent.contentOffset.y)}
          ListHeaderComponent={() => <View style={{ height: headerHeight }} />}
        />
      </ImageBackground>
    </View>
  );
};

export default function TabTwoScreen() {
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
        <Tab.Screen name="All" component={All} />
        <Tab.Screen name="By Phase" component={ByPhase} />
      </Tab.Navigator>
      <StatusBar backgroundColor={Colors[colorScheme].primary} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: Layout.spacing(3),
    marginBottom: Layout.spacing(2),
    marginTop: Layout.spacing(3),
  },
  separator: {
    height: 2,
    width: "100%",
    backgroundColor: "black",
    marginVertical: Layout.spacing(3),
    alignSelf: "center",
  },
  chipContainer: {
    height: 50 + Layout.spacing(4),
    elevation: 3,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  pickerContainer: {
    marginHorizontal: Layout.spacing(3),
    marginVertical: Layout.spacing(2),
    borderRadius: 12,
    paddingLeft: Layout.spacing(4),
    elevation: 3,
  },
  picker: {
    height: 50,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: -2,
    zIndex: 1002,
  },
  stratagemList: {
    paddingHorizontal: Layout.spacing(3),
  },
});
