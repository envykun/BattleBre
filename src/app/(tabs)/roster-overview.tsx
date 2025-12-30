import OverviewRuleItem from "@/src/components/List/OverviewRuleItem";
import PointsOverview from "@/src/components/PointsOverview/PointsOverview";
import Layout from "@/src/styles/theme/constants/Layout";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
    <ScrollView>
      <View style={styles.container}>
        <PointsOverview
          rosterName={rosterName}
          force={force}
          points={armyPoints}
        />
        <View style={styles.scrollView}>
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
          <OverviewRuleItem title={"Test"} description={"Test"} />
        </View>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {},
  scrollView: {
    padding: Layout.spacing(3),
    gap: Layout.spacing(3),
  },
});
