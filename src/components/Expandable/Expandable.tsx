import { RosterRule } from "@/src/data/models/roster/types";
import Colors from "@/src/styles/theme/constants/Colors";
import Layout from "@/src/styles/theme/constants/Layout";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

interface ExpandableProps {
  title: string;
  customRuleAllowed?: boolean;
  rules?: RosterRule[];
}

export default function Expandable({
  title,
  customRuleAllowed = false,
  rules = [],
}: ExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderRules = (rules: RosterRule[]) => {
    if (rules.length === 0) {
      return (
        <View>
          <Text>No rules selected.</Text>
        </View>
      );
    }

    return rules.map((rule) => (
      <View key={rule.id} style={styles.rule}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          {rule.name ?? "Unnamed Rule"}
        </Text>
        <Text>{rule.description ?? "-"}</Text>
      </View>
    ));
  };

  return (
    <View style={styles.root}>
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        style={styles.accordionHeader}
      >
        <Text style={styles.title}>{title}</Text>
        {isExpanded ? (
          <Entypo name="chevron-thin-down" size={16} color="black" />
        ) : (
          <Entypo name="chevron-thin-right" size={16} color="black" />
        )}
      </Pressable>
      {isExpanded && (
        <View>
          {renderRules(rules)}
          {customRuleAllowed && (
            <View>
              <Button title="Add rule" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Layout.spacing(4),
    borderColor: Colors.light.tabIconDefault,
    backgroundColor: Colors.light.background,
    padding: Layout.spacing(4),
    gap: Layout.spacing(4),
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
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  rule: {
    gap: Layout.spacing(2),
  },
});
