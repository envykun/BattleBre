import { UnitCharacteristics } from "@/src/hooks/useRosterUnitDetails";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: UnitCharacteristics[];
}

export default function Characteristics({ data }: Props) {
  return (
    <>
      <View style={styles.root}>
        <View style={styles.characteristicHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>M</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>T</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>SV</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>W</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>LD</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerCellText}>OC</Text>
          </View>
        </View>
        {data.map((charData) => (
          <View key={charData.name}>
            <View style={styles.name}>
              <Text style={{ fontWeight: "bold" }}>
                {charData.name} ({charData.count}x)
              </Text>
            </View>
            <View style={styles.characteristicRow}>
              <View style={styles.tableCell}>
                <Text>{charData.m}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{charData.t}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{charData.sv}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{charData.w}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{charData.ld}</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{charData.oc}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Layout.spacing(4),
    borderColor: Colors.light.tabIconDefault,
    backgroundColor: Colors.light.background,
    overflow: "hidden",
  },
  characteristicHeader: {
    flexDirection: "row",
    gap: Layout.spacing(1),
    justifyContent: "space-evenly",
    backgroundColor: Colors.light.primary,
    padding: Layout.spacing(4),
  },
  characteristicRow: {
    flexDirection: "row",
    gap: Layout.spacing(1),
    padding: Layout.spacing(4),
  },
  headerCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCellText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark.text,
  },
  tableCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    backgroundColor: Colors.light.secondary,
    padding: Layout.spacing(2),
    paddingHorizontal: Layout.spacing(4),
  },
});
