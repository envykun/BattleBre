import type {
  Roster,
  RosterRule,
  RosterSelection,
} from "@/src/data/models/roster";
import { useMemo } from "react";

export type ArmyConfiguration = {
  globalRules: RosterRule[];
  configurations: RosterSelection[];
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const isUnitSelection = (selection: RosterSelection) => {
  const type = normalize(selection.type);
  return type === "model" || type === "unit";
};

const addRules = (rules: RosterRule[], map: Map<string, RosterRule>) => {
  for (const rule of rules) {
    if (!rule.isHidden && !map.has(rule.id)) {
      map.set(rule.id, rule);
    }
  }
};

const collectSelectionRules = (
  selections: RosterSelection[],
  map: Map<string, RosterRule>
) => {
  for (const selection of selections) {
    if (isUnitSelection(selection)) {
      continue;
    }
    addRules(selection.rules, map);
    if (selection.selections.length) {
      collectSelectionRules(selection.selections, map);
    }
  }
};

const hasConfigurationCategory = (selection: RosterSelection) =>
  selection.categories.some(
    (category) => normalize(category.name) === "configuration"
  );

const isUpdateSelection = (selection: RosterSelection) =>
  normalize(selection.type) === "update";

const addConfigurations = (
  selections: RosterSelection[],
  map: Map<string, RosterSelection>
) => {
  for (const selection of selections) {
    if (!map.has(selection.id)) {
      map.set(selection.id, selection);
    }
  }
};

const collectConfigurations = (
  selections: RosterSelection[],
  map: Map<string, RosterSelection>
) => {
  for (const selection of selections) {
    if (isUnitSelection(selection)) {
      continue;
    }
    const isUpdateConfiguration = isUpdateSelection(selection) && selections.length === 1;
    if (hasConfigurationCategory(selection) || isUpdateConfiguration) {
      addConfigurations([selection], map);
      continue;
    }
    if (selection.selections.length) {
      collectConfigurations(selection.selections, map);
    }
  }
};

const collectConfigurationRules = (
  selections: RosterSelection[],
  map: Map<string, RosterRule>
) => {
  for (const selection of selections) {
    if (isUnitSelection(selection)) {
      continue;
    }
    const isUpdateConfiguration = isUpdateSelection(selection) && selections.length === 1;
    if (hasConfigurationCategory(selection) || isUpdateConfiguration) {
      addRules(selection.rules, map);
      collectSelectionRules(selection.selections, map);
      continue;
    }
    if (selection.selections.length) {
      collectConfigurationRules(selection.selections, map);
    }
  }
};

const collectDetachmentRules = (
  selections: RosterSelection[],
  map: Map<string, RosterRule>
) => {
  for (const selection of selections) {
    if (isUnitSelection(selection)) {
      continue;
    }
    const normalizedName = normalize(selection.name);
    if (normalizedName === "detachment" || normalizedName === "detachments") {
      addRules(selection.rules, map);
      collectSelectionRules(selection.selections, map);
      continue;
    }
    if (selection.selections.length) {
      collectDetachmentRules(selection.selections, map);
    }
  }
};

export function useArmyConfiguration(roster: Roster | null): ArmyConfiguration {
  return useMemo(() => {
    if (!roster) {
      return { globalRules: [], configurations: [] };
    }

    const ruleMap = new Map<string, RosterRule>();
    const configurationMap = new Map<string, RosterSelection>();
    for (const force of roster.forces) {
      addRules(force.rules, ruleMap);
      collectConfigurationRules(force.selections, ruleMap);
      collectDetachmentRules(force.selections, ruleMap);
      collectConfigurations(force.selections, configurationMap);
    }

    return {
      globalRules: Array.from(ruleMap.values()),
      configurations: Array.from(configurationMap.values()),
    };
  }, [roster]);
}
