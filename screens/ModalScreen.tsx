import { useContext } from "react";
import { Platform, ScrollView, StyleSheet, Image } from "react-native";
import { Text, View } from "../components/Themed";
import Abilities from "../components/UnitTables/Abilities";
import CharacteristicsTable from "../components/UnitTables/CharacteristicsTable";
import Keywords from "../components/UnitTables/Keywords";
import PsychicPowers from "../components/UnitTables/PsychicPowers";
import Weapons from "../components/UnitTables/Weapons";
import Colors from "../constants/Colors";
import { Images } from "../constants/Images";
import Layout from "../constants/Layout";
import { DataContext } from "../hooks/DataContext";
import useColorScheme from "../hooks/useColorScheme";
import { Ability, Characteristics, Psychic, Rule, Unit, Weapon } from "../utils/DataTypes";

export default function ModalScreen({ route }: any) {
  const { context } = useContext(DataContext);

  const unit: Unit = route.params.unit;
  const characteristics: Array<Characteristics> = unit.characteristics;
  const abilities: Array<Ability> = unit.abilities;
  const weapons: Array<Weapon> = unit.weapons;
  const isPsyker: boolean = unit.psychic !== undefined;
  const psychic: Psychic | undefined = unit.psychic;
  const keywords: Array<string> = unit.keywords;
  const unitRules: Array<Rule> = unit.rules || [];
  const forceRules: Array<Rule> = context.forceRules;

  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ justifyContent: "center", flexDirection: "row" }}>
            <Text style={styles.title}>{unit.name}</Text>
            <Text style={styles.subTitle}>({unit.type})</Text>
          </View>
          <View style={styles.unitType}>
            <View style={[styles.unitTypeIcon, { backgroundColor: Colors[colorScheme].primary }]}>
              <Image source={Images[unit.type]} resizeMode="center" style={{ width: "110%", height: "110%", tintColor: "white" }} />
              <View
                style={[styles.triangle, { backgroundColor: Colors[colorScheme].primary, borderTopColor: Colors[colorScheme].secondary }]}
              />
            </View>
            <View style={[styles.unitTypeText, { backgroundColor: Colors[colorScheme].secondary }]}>
              <View style={[styles.triangle2, { backgroundColor: Colors[colorScheme].secondary }]} />
              <Text style={{ fontWeight: "bold", color: Colors.dark.text }}></Text>
            </View>
          </View>
        </View>
        <View style={styles.table}>
          {characteristics.map((char, index) => {
            return index === characteristics.length - 1 ? (
              <CharacteristicsTable key={index} data={char} />
            ) : (
              <View key={index} style={{ marginBottom: Layout.spacing(3) }}>
                <CharacteristicsTable data={char} />
              </View>
            );
          })}
        </View>
        {isPsyker && (
          <View style={styles.table}>
            <PsychicPowers data={psychic} />
          </View>
        )}
        <View style={styles.table}>
          <Weapons data={weapons} />
        </View>
        <View style={styles.table}>
          <Abilities abilities={abilities} unitRules={unitRules} forceRules={forceRules} />
        </View>
        <View style={styles.table}>
          <Keywords data={keywords} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  header: {
    height: Layout.spacing(6),
    flexDirection: "row",
    marginTop: Layout.spacing(4),
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlignVertical: "center",
  },
  subTitle: {
    fontSize: 14,
    color: "grey",
    textTransform: "uppercase",
    textAlignVertical: "center",
    marginLeft: Layout.spacing(2),
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  table: {
    marginTop: 12,
  },
  unitType: {
    height: Layout.spacing(5) * 2,
    width: Layout.spacing(5),
  },
  unitTypeText: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  unitTypeIcon: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  triangle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderRightColor: "transparent",
    transform: [{ rotate: "180deg" }],
  },
  triangle2: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderRightColor: "transparent",
    borderTopColor: "white",
    transform: [{ rotate: "180deg" }],
  },
});
