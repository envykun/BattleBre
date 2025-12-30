import { UnitCharacteristics } from "@/src/hooks/useRosterUnitDetails";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  data: UnitCharacteristics & any;
}

export default function Characteristics({ data }: Props) {
  const colorScheme = "light";
  return (
    <View
      style={[styles.container, { borderColor: Colors[colorScheme].primary }]}
    >
      <View
        style={[
          styles.unitTitle,
          { backgroundColor: Colors[colorScheme].primary },
        ]}
      >
        <Text style={styles.unitTitleText}>{data.name}</Text>
        <Text style={styles.unitTitleText}>{data.count}x</Text>
      </View>
      <View
        style={[
          styles.tableHead,
          { backgroundColor: Colors[colorScheme].secondary },
        ]}
      >
        <View style={styles.tableCell}>
          <Text style={styles.headText}>M</Text>
        </View>
        {/* <View style={styles.tableCell}>
          <Text style={styles.headText}>WS</Text>
        </View> */}
        {/* <View style={styles.tableCell}>
          <Text style={styles.headText}>BS</Text>
        </View> */}
        {/* <View style={styles.tableCell}>
          <Text style={styles.headText}>S</Text>
        </View> */}
        <View style={styles.tableCell}>
          <Text style={styles.headText}>T</Text>
        </View>
        {/* <View style={styles.tableCell}>
          <Text style={styles.headText}>A</Text>
        </View> */}
        <View style={styles.tableCell}>
          <Text style={styles.headText}>Sv</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>W</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>Ld</Text>
        </View>
        <View style={styles.tableCell}>
          <Text style={styles.headText}>OC</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={styles.tableCell}>
          <Text>{data.m ?? "—"}</Text>
        </View>
        {/* <View style={styles.tableCell}>
          <Text>{data.ws ?? "—"}</Text>
        </View> */}
        {/* <View style={styles.tableCell}>
          <Text>{data.bs ?? "—"}</Text>
        </View> */}
        {/* <View style={styles.tableCell}>
          <Text>{data.s ?? "—"}</Text>
        </View> */}
        <View style={styles.tableCell}>
          <Text>{data.t ?? "—"}</Text>
        </View>
        {/* <View style={styles.tableCell}>
          <Text>{data.a ?? "—"}</Text>
        </View> */}
        <View style={styles.tableCell}>
          <Text>{data.sv ?? "—"}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{data.w ?? "—"}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{data.ld ?? "—"}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text>{data.oc ?? "—"}</Text>
        </View>
      </View>
      <View style={styles.tableRow2}>
        <View style={styles.abilities}>
          <Text style={{ fontStyle: "italic", color: "grey", fontSize: 12 }}>
            {data.weapons != null && data.weapons.length > 0
              ? data.weapons.join(", ")
              : "—"}
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
}

const styles = StyleSheet.create({
  container: {
    minHeight: Layout.spacing(5) * 3,
    borderWidth: 1,
    borderRadius: 4,
  },
  tableHead: {
    flex: 1,
    flexDirection: "row",
    height: Layout.spacing(5),
  },
  tableRow: {
    flex: 1,
    flexDirection: "row",
    height: Layout.spacing(5),
    borderBottomWidth: 1,
  },
  tableRow2: {
    flexDirection: "row",
    minHeight: Layout.spacing(5),
  },
  abilities: {
    justifyContent: "center",
    paddingLeft: 8,
    marginRight: 12,
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headText: {
    fontWeight: "bold",
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
    fontSize: 18,
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
