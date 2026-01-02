import Expandable from "@/src/components/Expandable/Expandable";
import Summary from "@/src/components/Sections/Summary";
import type { RosterSelection } from "@/src/data/models/roster";
import { useArmyConfiguration } from "@/src/hooks/useArmyConfiguration";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRosterContext } from "../../context/RosterContext";

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const findBattleSize = (selections: RosterSelection[]): string | null => {
  for (const selection of selections) {
    if (normalize(selection.name) === "battle size") {
      return selection.selections[0]?.name ?? selection.name ?? null;
    }
    const nested = findBattleSize(selection.selections);
    if (nested) {
      return nested;
    }
  }
  return null;
};

const findDetachment = (selections: RosterSelection[]): string | null => {
  for (const selection of selections) {
    const normalizedName = normalize(selection.name);
    if (normalizedName === "detachment" || normalizedName === "detachments") {
      return selection.selections[0]?.name ?? selection.name ?? null;
    }
    const nested = findDetachment(selection.selections);
    if (nested) {
      return nested;
    }
  }
  return null;
};

const formatConfiguration = (selection: RosterSelection): string =>
  selection.name ?? "Configuration";

const collectConfigurationDetails = (selection: RosterSelection) => {
  const selectionNames = new Set<string>();
  const ruleNames = new Set<string>();
  const profileNames = new Set<string>();
  const stack: RosterSelection[] = [selection];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    for (const entry of current.selections) {
      if (entry.name) {
        selectionNames.add(entry.name);
      }
      stack.push(entry);
    }
    for (const rule of current.rules) {
      if (rule.name) {
        ruleNames.add(rule.name);
      }
    }
    for (const profile of current.profiles) {
      if (profile.name) {
        profileNames.add(profile.name);
      }
    }
  }

  return {
    selectionNames: Array.from(selectionNames),
    ruleNames: Array.from(ruleNames),
    profileNames: Array.from(profileNames),
  };
};

export default function RosterOverviewScreen() {
  const { selectedRoster, loading, error, rosterDataLoading, rosterDataError } =
    useRosterContext();
  const isLoading = loading || rosterDataLoading;
  const hasError = error != null || rosterDataError != null;

  const rosterName = selectedRoster?.meta.name ?? "Roster";
  const armyPoints = selectedRoster?.meta.points.toString() ?? "0";
  const force = selectedRoster?.meta.faction ?? "Unknown";
  const battleSize = selectedRoster?.roster
    ? findBattleSize(
        selectedRoster.roster.forces.flatMap((entry) => entry.selections)
      )
    : null;
  const detachment = selectedRoster?.roster
    ? findDetachment(
        selectedRoster.roster.forces.flatMap((entry) => entry.selections)
      )
    : null;

  // TODO: Zeige Army Rules und Detachment Rules
  const configuration = useArmyConfiguration(selectedRoster?.roster ?? null);

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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Summary
          armyPoints={armyPoints}
          rosterName={rosterName}
          force={force}
          battleSize={battleSize ?? "-"}
          detachment={detachment ?? "-"}
          totalPoints={
            selectedRoster?.roster.costLimits[0]?.value?.toString() ?? "-"
          }
        />
        <View style={styles.scrollView}>
          <Expandable
            title="Army Rules"
            customRuleAllowed
            rules={configuration.globalRules}
          />
          <View>
            <Text style={styles.sectionTitle}>Configurations</Text>
            <View style={styles.rules}>
              {configuration.configurations.length ? (
                configuration.configurations.map((selection) => {
                  const details = collectConfigurationDetails(selection);
                  const hasDetails =
                    details.selectionNames.length ||
                    details.ruleNames.length ||
                    details.profileNames.length;

                  return (
                    <View key={selection.id} style={styles.ruleBlock}>
                      <Text style={styles.ruleTitle}>
                        {formatConfiguration(selection)}
                      </Text>
                      {details.selectionNames.length > 0 && (
                        <Text style={styles.ruleBody}>
                          Selections: {details.selectionNames.join(", ")}
                        </Text>
                      )}
                      {details.ruleNames.length > 0 && (
                        <Text style={styles.ruleBody}>
                          Rules: {details.ruleNames.join(", ")}
                        </Text>
                      )}
                      {details.profileNames.length > 0 && (
                        <Text style={styles.ruleBody}>
                          Profiles: {details.profileNames.join(", ")}
                        </Text>
                      )}
                      {!hasDetails && (
                        <Text style={styles.ruleBody}>
                          No configuration data.
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.ruleBody}>No configurations found.</Text>
              )}
            </View>
          </View>
          <Expandable title="Command Phase" customRuleAllowed />
          <Expandable title="Once per Battle Rules" customRuleAllowed />
          <Expandable title="List Analysis" />
          <Text>Command Phase Reminder</Text>
          <Text>Mobility Summary (Deep-Strike/Scout)</Text>
          <Text>Objective Control</Text>
          <Text>Once Per Game Rules</Text>
          <Text>Meta Info</Text>
          <View>
            <Text>{selectedRoster?.roster.gameSystemId}</Text>
            <Text>{selectedRoster?.roster.gameSystemName}</Text>
            <Text>{selectedRoster?.roster.gameSystemRevision}</Text>
            <Text>{selectedRoster?.roster.generatedBy}</Text>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing(2),
  },
  accordionIndicator: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.tabIconDefault,
  },
  rules: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: Layout.spacing(4),
    padding: Layout.spacing(4),
    gap: Layout.spacing(2),
    borderColor: Colors.light.tabIconDefault,
    borderWidth: 1,
  },
  ruleBlock: {
    gap: Layout.spacing(1),
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  ruleBody: {
    fontSize: 14,
    color: Colors.light.text,
  },
});
