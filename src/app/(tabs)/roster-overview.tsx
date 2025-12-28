import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { useRosterContext } from "../../context/RosterContext";

export default function RosterOverviewScreen() {
  const { selectedRoster, loading, rosterDataLoading, rosterDataError } =
    useRosterContext();
  const rosterName = selectedRoster?.meta.name ?? "Roster";
  const isLoading = loading || rosterDataLoading;

  return (
    <View style={styles.container}>
      {rosterDataError != null && <Text>Error Banner: {rosterDataError}</Text>}
      <Text style={styles.rosterName}>
        {isLoading ? "Loading roster..." : rosterName}
      </Text>
      <Text style={styles.title}>Roster Overview</Text>
      <View style={styles.button}>
        <Button title="Open Modal" onPress={() => router.push("/modal")} />
      </View>
      <View style={styles.button}>
        <Button title="Back to Home" onPress={() => router.dismissTo("/")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },
  rosterName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  button: {
    width: "100%",
    marginBottom: 12,
  },
});
