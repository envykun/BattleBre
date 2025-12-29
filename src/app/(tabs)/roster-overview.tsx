import PointsOverview from "@/src/components/PointsOverview/PointsOverview";
import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { useRosterContext } from "../../context/RosterContext";

export default function RosterOverviewScreen() {
  const { selectedRoster, loading, error, rosterDataLoading, rosterDataError } =
    useRosterContext();
  const isLoading = loading || rosterDataLoading;
  const hasError = error != null || rosterDataError != null;

  const rosterName = selectedRoster?.meta.name ?? "Roster";
  const armyPoints = selectedRoster?.meta.points.toString() ?? "0";
  const force = selectedRoster?.meta.faction ?? "Unknown";

  // TODO: Zeige Army Rules und Detachment Rules
  // const configuration = useArmyConfiguration(selectedRoster?.roster ?? null);

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View>
        <Text>Error Banner: {rosterDataError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PointsOverview
        rosterName={rosterName}
        force={force}
        points={armyPoints}
      />
      <Text style={styles.title}>Army Configuration</Text>
      {/* {configuration.map((item) => (
        <View key={item.id} style={styles.configBlock}>
          <Text style={styles.configTitle}>{item.name}</Text>
          {item.rules.map((rule) => (
            <Text key={rule.id} style={styles.configItem}>
              {rule.name ?? "Rule"}
            </Text>
          ))}
          {item.profiles.map((profile) => (
            <Text key={profile.id} style={styles.configItem}>
              {profile.name ?? profile.typeName ?? "Profile"}
            </Text>
          ))}
        </View>
      ))} */}
      <View style={styles.button}>
        <Button title="Back to Home" onPress={() => router.dismissTo("/")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },
  configBlock: {
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  configItem: {
    fontSize: 13,
    marginBottom: 4,
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
