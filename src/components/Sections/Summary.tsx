import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Avatar from "../Avatar/Avatar";
import Pill from "../Pill/Pill";

interface Props {
  rosterName: string;
  force: string;
  battleSize: string;
  detachment: string;
  armyPoints: string;
  totalPoints: string;
}

export default function Summary({
  rosterName,
  force,
  battleSize,
  detachment,
  armyPoints,
  totalPoints,
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.rootInner}>
        <View style={styles.textBody}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>{rosterName}</Text>
          <Text style={{ fontSize: 16, color: Colors.light.primary }}>
            {force}
          </Text>
          <Text style={{ fontSize: 16, color: Colors.light.secondary }}>
            {detachment}
          </Text>
        </View>
        <View>
          <Avatar
            size={48}
            rounded
            title={force.slice(0, 2)}
            containerStyle={{
              backgroundColor: Colors["light"].primary,
              borderWidth: 2,
            }}
          />
        </View>
      </View>
      <View style={styles.rootInner}>
        <Text style={{ fontWeight: "bold" }}>{battleSize}</Text>
        <Pill value={`${armyPoints} | ${totalPoints}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "column",
    gap: Layout.spacing(2),
    padding: Layout.spacing(4),
  },
  rootInner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Layout.spacing(1),
  },
  textBody: {
    gap: Layout.spacing(2),
  },
});
