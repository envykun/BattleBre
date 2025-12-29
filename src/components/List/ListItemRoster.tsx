import { RosterMeta } from "@/src/hooks/useFetchRosters";
import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function ListItemRoster(rosterMeta: RosterMeta) {
  return (
    <View key={rosterMeta.id} style={styles.root}>
      <View>
        <Text>{rosterMeta.name}</Text>
        <Text>{rosterMeta.faction}</Text>
        <Text>{rosterMeta.points}</Text>
        <Text>{rosterMeta.lastUpdated}</Text>
      </View>
      <Button
        title="Enter App"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/roster-overview",
            params: { rosterId: rosterMeta.id },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 128,
    width: "100%",
  },
});
