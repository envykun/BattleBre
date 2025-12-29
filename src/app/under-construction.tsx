import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View>
      <Ionicons name="construct-outline" size={64} color="black" />
      <Text>
        This site is still under construction. Stay tuned for the next update.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
