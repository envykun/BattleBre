import { RosterRule } from "@/src/data/models/roster/types";
import { UnitAbility } from "@/src/hooks/useRosterUnitDetails";
import Layout from "@/src/styles/theme/constants/Layout";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import OverviewRuleItem from "../List/OverviewRuleItem";

interface Props {
  abilities?: UnitAbility[];
  unitRules?: RosterRule[];
  // forceRules?: Rule[];
}

const Abilities = ({ abilities = [], unitRules = [] }: Props) => {
  const renderAbilities = (item: UnitAbility, index: number) => {
    return (
      <View key={index} style={{ marginBottom: 12 }}>
        <OverviewRuleItem title={item.name} description={item.description} />
      </View>
    );
  };
  const renderUnitRules = (item: RosterRule, index: number) => {
    return (
      <View key={index} style={{ marginBottom: 12 }}>
        <OverviewRuleItem
          title={item.name ?? ""}
          description={item.description ?? ""}
        />
      </View>
    );
  };
  // const renderForceRules = (item: Rule, index: number) => {
  //   return (
  //     <View key={index} style={{ marginBottom: 12 }}>
  //       <OverviewRuleItem title={item.title} description={item.description} />
  //     </View>
  //   );
  // };
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>ABILITIES</Text>
      </View>
      {abilities.length > 0 ? (
        abilities.map((ability: UnitAbility, index: number) =>
          renderAbilities(ability, index)
        )
      ) : (
        <View>
          <Text>No Abilities.</Text>
        </View>
      )}
      <View style={styles.title}>
        <Text style={styles.titleText}>RULES</Text>
      </View>
      {unitRules.length > 0 ? (
        unitRules.map((rule: RosterRule, index: number) =>
          renderUnitRules(rule, index)
        )
      ) : (
        <View>
          <Text>No Rules.</Text>
        </View>
      )}
      <View style={styles.title}>
        <Text style={styles.titleText}>FORCE RULES</Text>
      </View>
      {/* {forceRules.length > 0 ? (
        forceRules.map((rule: Rule, index: number) => renderForceRules(rule, index))
      ) : (
        <View>
          <Text>No Force Rules.</Text>
        </View>
      )} */}
    </View>
  );
};

export default Abilities;

const styles = StyleSheet.create({
  container: {
    marginTop: -12,
  },
  title: {
    height: Layout.spacing(6),
    justifyContent: "center",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
