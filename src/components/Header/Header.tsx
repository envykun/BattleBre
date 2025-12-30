import Layout from "@/src/styles/theme/constants/Layout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.title}>BattleBre</Text>
      </View>
      <Ionicons
        name="settings-sharp"
        size={24}
        color="black"
        onPress={() => router.push("/settings")}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    gap: Layout.spacing(2),
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  icon: {
    position: "absolute",
    right: 24,
  },
});
