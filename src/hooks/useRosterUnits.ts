import type { Roster, RosterSelection } from "@/src/data/models/roster";
import { useMemo } from "react";
import { UnitCharacteristics } from "./useRosterUnitDetails";

export type UnitItem = {
  id: string;
  name: string;
  role: string;
  points: number | null;
  characteristics: UnitCharacteristics[];
  invulnerableSave?: string;
  feelNoPain?: string;
  selection: RosterSelection;
};

export type UnitSection = {
  title: string;
  data: UnitItem[];
};

const ROLE_ORDER = [
  "Epic Hero",
  "Character",
  "Battleline",
  "Infantry",
  "Mounted",
  "Beast",
  "Monster",
  "Vehicle",
  "Dedicated Transport",
  "Allied Unit",
];

const ROLE_ORDER_INDEX = new Map<string, number>();
for (const [index, name] of ROLE_ORDER.entries()) {
  ROLE_ORDER_INDEX.set(name.toLowerCase(), index);
}

const collectUnitSelections = (
  selections: RosterSelection[],
  hasUnitAncestor: boolean
): RosterSelection[] => {
  const units: RosterSelection[] = [];
  for (const selection of selections) {
    const type = selection.type?.toLowerCase();
    const isUnit = type === "unit";
    const isModel = type === "model";
    if (isUnit || (isModel && !hasUnitAncestor)) {
      units.push(selection);
    }
    units.push(
      ...collectUnitSelections(selection.selections, hasUnitAncestor || isUnit)
    );
  }
  return units;
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const flattenSelections = (selection: RosterSelection): RosterSelection[] => [
  selection,
  ...selection.selections.flatMap(flattenSelections),
];

const readSelectionNumber = (selection: RosterSelection): number => {
  if (typeof selection.number === "number") {
    return selection.number;
  }
  if (selection.numberText != null) {
    const parsed = Number(selection.numberText);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 1;
};

const collectModelSelections = (
  selection: RosterSelection,
  isRoot: boolean
): RosterSelection[] => {
  const type = selection.type?.toLowerCase();
  if (!isRoot && type === "unit") {
    return [];
  }
  const models: RosterSelection[] = [];
  if (type === "model") {
    models.push(selection);
  }
  for (const child of selection.selections) {
    models.push(...collectModelSelections(child, false));
  }
  return models;
};

const unitBaseModelCount = (selection: RosterSelection): number => {
  const models = collectModelSelections(selection, true);
  if (!models.length) {
    return readSelectionNumber(selection);
  }
  const total = models.reduce(
    (sum, entry) => sum + readSelectionNumber(entry),
    0
  );
  const overrides = models.reduce((sum, entry) => {
    const hasUnitProfile = entry.profiles.some(
      (profile) => normalize(profile.typeName) === "unit" && !profile.isHidden
    );
    return sum + (hasUnitProfile ? readSelectionNumber(entry) : 0);
  }, 0);
  const baseCount = total - overrides;
  return baseCount > 0 ? baseCount : total;
};

const unitCharacteristicCount = (selection: RosterSelection): number => {
  const type = selection.type?.toLowerCase();
  if (type === "model") {
    return readSelectionNumber(selection);
  }
  if (type === "unit") {
    return unitBaseModelCount(selection);
  }
  return readSelectionNumber(selection);
};

const readCharacteristic = (
  profile: RosterSelection["profiles"][number],
  key: string | string[]
) => {
  const keys = Array.isArray(key) ? key : [key];
  const normalized = keys.map(normalize);
  const entry = profile.characteristics.find((item) =>
    normalized.includes(normalize(item.name))
  );
  return entry?.value ?? "-";
};

const unitCharacteristics = (flattened: RosterSelection[]) => {
  const unitProfiles = flattened.flatMap((entry) =>
    entry.profiles
      .filter(
        (profile) => !profile.isHidden && normalize(profile.typeName) === "unit"
      )
      .map((profile) => ({ profile, selection: entry }))
  );
  const characteristicMap = new Map<
    string,
    { profile: (typeof unitProfiles)[number]["profile"]; count: number }
  >();
  for (const entry of unitProfiles) {
    const id = entry.profile.id;
    const count = unitCharacteristicCount(entry.selection);
    const existing = characteristicMap.get(id);
    characteristicMap.set(id, {
      profile: entry.profile,
      count: (existing?.count ?? 0) + count,
    });
  }
  return Array.from(characteristicMap.values()).map(({ profile, count }) => ({
    name: profile.name ?? "Unit",
    count,
    m: readCharacteristic(profile, ["M", "Move"]),
    t: readCharacteristic(profile, ["T", "Toughness"]),
    sv: readCharacteristic(profile, ["Sv", "SV", "Save"]),
    w: readCharacteristic(profile, ["W", "Wounds"]),
    ld: readCharacteristic(profile, ["Ld", "LD", "Leadership"]),
    oc: readCharacteristic(profile, ["OC", "Objective Control"]),
  }));
};

const abilityValue = (profile: RosterSelection["profiles"][number]) => {
  const description = readCharacteristic(profile, "Description");
  const source =
    description && description !== "-" ? description : profile.name ?? "";
  const match = source.match(/\d+\+?/);
  return match?.[0] ?? (description && description !== "-" ? description : "");
};

const findAbilityValue = (
  flattened: RosterSelection[],
  matcher: (value: string) => boolean
) => {
  for (const entry of flattened) {
    for (const profile of entry.profiles) {
      if (profile.isHidden) {
        continue;
      }
      const name = normalize(profile.name);
      if (matcher(name)) {
        const value = abilityValue(profile);
        if (value) {
          return value;
        }
      }
    }
  }
  return undefined;
};

const unitRole = (selection: RosterSelection) => {
  const primary = selection.categories.find((category) => category.isPrimary);
  if (primary?.name) {
    return primary.name;
  }
  const fallback = selection.categories.find((category) =>
    ROLE_ORDER_INDEX.has((category.name ?? "").toLowerCase())
  );
  return fallback?.name ?? "Other";
};

const unitPoints = (selection: RosterSelection): number | null => {
  const cost = selection.costs.find(
    (entry) => entry.name.trim().toLowerCase() === "pts"
  );
  if (!cost) {
    return null;
  }
  if (typeof cost.value === "number") {
    return cost.value;
  }
  const parsed = Number(cost.valueText);
  return Number.isNaN(parsed) ? null : parsed;
};

const orderIndex = (role: string) =>
  ROLE_ORDER_INDEX.get(role.toLowerCase()) ?? ROLE_ORDER.length;

export function useRosterUnits(roster: Roster | null): UnitSection[] {
  return useMemo(() => {
    if (!roster) {
      return [];
    }

    return roster.forces
      .map((force, index) => {
        const units = collectUnitSelections(force.selections, false)
          .map((selection) => {
            const flattened = flattenSelections(selection);
            const invulnerableSave = findAbilityValue(flattened, (name) =>
              name.includes("invulnerable save")
            );
            const feelNoPain = findAbilityValue(flattened, (name) =>
              name.includes("feel no pain")
            );
            return {
              id: selection.id,
              name: selection.name ?? "Unknown unit",
              role: unitRole(selection),
              points: unitPoints(selection),
              characteristics: unitCharacteristics(flattened),
              invulnerableSave,
              feelNoPain,
              selection,
            };
          })
          .sort((a, b) => {
            const roleDelta = orderIndex(a.role) - orderIndex(b.role);
            if (roleDelta !== 0) {
              return roleDelta;
            }
            return a.name.localeCompare(b.name);
          });

        const title =
          force.name ?? force.catalogueName ?? `Detachment ${index + 1}`;

        return { title, data: units };
      })
      .filter((section) => section.data.length > 0);
  }, [roster]);
}
