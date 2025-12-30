import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Layout from "../styles/theme/constants/Layout";

export default function SettingsScreen() {
  return (
    <View style={styles.root}>
      <Ionicons name="construct-outline" size={64} color="black" />
      <Text>
        This site is still under construction. Stay tuned for the next update.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Layout.spacing(4),
    padding: Layout.spacing(4),
  },
});
