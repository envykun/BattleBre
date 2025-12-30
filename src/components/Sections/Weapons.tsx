import { UnitWeapon } from "@/src/hooks/useRosterUnitDetails";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import React, { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: UnitWeapon[];
}

export default function Weapons({ data }: Props) {
  const colorScheme = "light";

  const meleeWeapons = data.filter((weapon) => weapon.mode === "melee") ?? [];
  const rangedWeapons = data.filter((weapon) => weapon.mode === "ranged") ?? [];
  const otherWeapons = data.filter((weapon) => weapon.mode === "other") ?? [];

  const renderWeapons = (weapon: UnitWeapon, index: number): ReactElement => (
    <View
      key={index}
      style={{
        borderWidth: 1,
        marginBottom: 12,
        borderColor: Colors[colorScheme].primary,
        borderRadius: 4,
      }}
    >
      <View
        style={[
          styles.unitTitle,
          { backgroundColor: Colors[colorScheme].primary },
        ]}
      >
        <Text style={styles.unitTitleText}>{weapon.name}</Text>
        <Text style={styles.unitTitleCount}>{weapon.count}x</Text>
      </View>
      <View
        style={[
          styles.tableHead,
          { backgroundColor: Colors[colorScheme].secondary },
        ]}
      >
        <View style={styles.tableCell2}>
          <Text style={styles.headText}>RANGE</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>A</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>
            {weapon.mode === "ranged" ? "BS" : "WS"}
          </Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>S</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>AP</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>D</Text>
        </View>
      </View>
      <View
        style={[styles.tableRow, { borderColor: Colors[colorScheme].primary }]}
      >
        <View style={styles.tableCell2}>
          <Text>{weapon.range}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.a}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.bs}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.s}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.ap}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{weapon.d}</Text>
        </View>
      </View>
      <View
        style={[styles.tableRow3, { borderColor: Colors[colorScheme].primary }]}
      >
        <View style={styles.abilities}>
          <Text>{weapon.abilities}</Text>
        </View>
      </View>
      <View style={styles.tableRow2}>
        <View style={styles.abilities}>
          <Text style={{ fontStyle: "italic", color: "grey", fontSize: 12 }}>
            {/* TODO: {weapon.models?.join(", ")} */}
          </Text>
        </View>
      </View>
      <View style={styles.triangle} />
      <View
        style={[
          styles.borderCorner,
          { borderRightColor: Colors[colorScheme].primary },
        ]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>RANGED WEAPONS</Text>
      </View>
      {rangedWeapons.length > 0 ? (
        rangedWeapons.map((weapon: UnitWeapon, index: number) =>
          renderWeapons(weapon, index)
        )
      ) : (
        <View>
          <Text>No weapons.</Text>
        </View>
      )}
      <View style={styles.title}>
        <Text style={styles.titleText}>MELEE WEAPONS</Text>
      </View>
      {meleeWeapons.length > 0 ? (
        meleeWeapons.map((weapon: UnitWeapon, index: number) =>
          renderWeapons(weapon, index)
        )
      ) : (
        <View>
          <Text>No weapons.</Text>
        </View>
      )}
      {otherWeapons.length > 0 && (
        <>
          <View style={styles.title}>
            <Text style={styles.titleText}>OTHER WEAPONS</Text>
          </View>
          <View>
            {otherWeapons.map((weapon: UnitWeapon, index: number) =>
              renderWeapons(weapon, index)
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  tableHead: {
    height: Layout.spacing(5),
    flexDirection: "row",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    height: Layout.spacing(5),
  },
  tableRow3: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: Layout.spacing(5),
  },
  tableRow2: {
    flexDirection: "row",
    minHeight: Layout.spacing(5),
  },
  tableCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCell2: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  headText: {
    fontWeight: "bold",
  },
  abilities: {
    justifyContent: "center",
    paddingLeft: 8,
    marginRight: 12,
    paddingVertical: 4,
  },
  title: {
    height: Layout.spacing(6),
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  unitTitle: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Layout.spacing(2),
    height: Layout.spacing(5),
    flexDirection: "row",
  },
  unitTitleText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  unitTitleCount: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  triangle: {
    position: "absolute",
    bottom: -1.5,
    right: -1.5,
    width: 0,
    height: 0,
    backgroundColor: "white",
    borderStyle: "solid",
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderRightColor: "transparent",
    borderTopColor: "white",
    transform: [{ rotate: "180deg" }],
  },
  borderCorner: {
    position: "absolute",
    bottom: -1.5,
    right: 4,
    width: 5,
    height: 16,
    borderRightWidth: 1,
    transform: [{ rotate: "45deg" }],
  },
});
