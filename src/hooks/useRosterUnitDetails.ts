import { useMemo } from "react";
import type { Roster, Selection, Profile, Rule } from "@/src/data/models/roster";

export type UnitCharacteristics = {
  name: string;
  m: string;
  ws: string;
  bs: string;
  s: string;
  t: string;
  w: string;
  a: string;
  ld: string;
  sv: string;
};

export type UnitWeapon = {
  id: string;
  name: string;
  range: string;
  type: string;
  s: string;
  ap: string;
  d: string;
  abilities: string;
  count?: number;
};

export type UnitAbility = {
  id: string;
  name: string;
  description: string;
};

export type UnitPsychicPower = {
  id: string;
  name: string;
  warpCharge: string;
  range: string;
  details: string;
};

export type UnitPsychic = {
  id: string;
  name: string;
  cast: string;
  deny: string;
  powers: string;
  other: string;
  psychicPowers: UnitPsychicPower[];
};

export type UnitDetails = {
  selection: Selection;
  name: string;
  role: string;
  points: number | null;
  characteristics: UnitCharacteristics[];
  weapons: UnitWeapon[];
  abilities: UnitAbility[];
  psychic: UnitPsychic | null;
  keywords: string[];
  unitRules: Rule[];
  forceRules: Rule[];
};

type ProfileKind = "unit" | "weapon" | "ability" | "psyker" | "psychic-power" | "other";

const ROLE_ORDER = [
  "HQ",
  "Troops",
  "Elites",
  "Fast Attack",
  "Heavy Support",
  "Flyer",
  "Dedicated Transport",
];

const EXCLUDED_KEYWORDS = new Set(["Configuration", ...ROLE_ORDER]);

const flattenSelections = (selection: Selection): Selection[] => [
  selection,
  ...selection.selections.flatMap(flattenSelections),
];

const findSelectionInForce = (
  selections: Selection[],
  unitId: string,
): Selection | null => {
  for (const selection of selections) {
    if (selection.id === unitId) {
      return selection;
    }
    const nested = findSelectionInForce(selection.selections, unitId);
    if (nested) {
      return nested;
    }
  }
  return null;
};

const findSelectionWithForce = (roster: Roster, unitId: string) => {
  for (const force of roster.forces) {
    const selection = findSelectionInForce(force.selections, unitId);
    if (selection) {
      return { selection, forceRules: force.rules };
    }
  }
  return null;
};

const readCharacteristic = (profile: Profile, key: string) =>
  profile.characteristics.find((entry) => entry.name === key)?.value ?? "-";

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const characteristicNames = (profile: Profile) =>
  new Set(profile.characteristics.map((entry) => normalize(entry.name)));

const classifyProfile = (profile: Profile): ProfileKind => {
  const typeName = normalize(profile.typeName);
  if (typeName.includes("weapon")) {
    return "weapon";
  }
  if (typeName.includes("ability")) {
    return "ability";
  }
  if (typeName.includes("psyker")) {
    return "psyker";
  }
  if (typeName.includes("psychic power")) {
    return "psychic-power";
  }
  if (typeName === "unit" || typeName.includes("unit")) {
    return "unit";
  }

  const names = characteristicNames(profile);
  const has = (value: string) => names.has(value);
  const hasAll = (values: string[]) => values.every((value) => has(value));

  if (hasAll(["range", "type", "s", "ap", "d"])) {
    return "weapon";
  }
  if (has("description")) {
    return "ability";
  }
  if (hasAll(["cast", "deny"])) {
    return "psyker";
  }
  if (hasAll(["warp charge", "range", "details"])) {
    return "psychic-power";
  }
  if (has("m") && (has("ws") || has("bs"))) {
    return "unit";
  }

  return "other";
};

const unitRole = (selection: Selection) => {
  const primary = selection.categories.find((category) => category.isPrimary);
  if (primary?.name) {
    return primary.name;
  }
  const fallback = selection.categories.find((category) =>
    ROLE_ORDER.includes(category.name ?? ""),
  );
  return fallback?.name ?? "Other";
};

const unitPoints = (selection: Selection): number | null => {
  const selections = flattenSelections(selection);
  let foundPoints = false;
  const total = selections.reduce((sum, entry) => {
    const points = entry.costs
      .filter((cost) => {
        const isPoints =
          cost.name.trim().toLowerCase() === "pts" || cost.typeId === "points";
        if (isPoints) {
          foundPoints = true;
        }
        return isPoints;
      })
      .reduce((innerSum, cost) => {
        if (typeof cost.value === "number") {
          return innerSum + cost.value;
        }
        const parsed = Number(cost.valueText);
        return innerSum + (Number.isNaN(parsed) ? 0 : parsed);
      }, 0);
    return sum + points;
  }, 0);

  if (!foundPoints || Number.isNaN(total)) {
    return null;
  }
  return total;
};

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string | undefined) => {
  const map = new Map<string, T>();
  for (const item of items) {
    const key = getKey(item);
    if (!key) {
      continue;
    }
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
};

export function useRosterUnitDetails(
  roster: Roster | null,
  unitId: string | null,
): UnitDetails | null {
  return useMemo(() => {
    if (!roster || !unitId) {
      return null;
    }

    const match = findSelectionWithForce(roster, unitId);
    if (!match) {
      return null;
    }

    const selection = match.selection;
    const flattened = flattenSelections(selection);
    const allProfilesWithSelection = flattened.flatMap((entry) =>
      entry.profiles.map((profile) => ({ profile, selection: entry })),
    );
    const profilesWithSelection = allProfilesWithSelection.filter(
      ({ profile }) => !profile.isHidden,
    );
    const profileEntries = profilesWithSelection.map((entry) => ({
      ...entry,
      kind: classifyProfile(entry.profile),
    }));
    const allProfileEntries = allProfilesWithSelection.map((entry) => ({
      ...entry,
      kind: classifyProfile(entry.profile),
    }));

    const unitProfiles = profileEntries
      .filter((entry) => entry.kind === "unit")
      .map(({ profile }) => profile);

    const characteristics = uniqueBy(unitProfiles, (profile) => profile.id).map(
      (profile) => ({
        name: profile.name ?? "Unit",
        m: readCharacteristic(profile, "M"),
        ws: readCharacteristic(profile, "WS"),
        bs: readCharacteristic(profile, "BS"),
        s: readCharacteristic(profile, "S"),
        t: readCharacteristic(profile, "T"),
        w: readCharacteristic(profile, "W"),
        a: readCharacteristic(profile, "A"),
        ld: readCharacteristic(profile, "Ld"),
        sv: readCharacteristic(profile, "Save"),
      }),
    );

    let weaponProfiles = profileEntries.filter((entry) => entry.kind === "weapon");
    if (!weaponProfiles.length) {
      weaponProfiles = allProfileEntries.filter((entry) => entry.kind === "weapon");
    }
    const weaponMap = new Map<string, UnitWeapon>();
    for (const { profile, selection: source } of weaponProfiles) {
      const name = profile.name ?? "Weapon";
      const next: UnitWeapon = {
        id: profile.id,
        name,
        range: readCharacteristic(profile, "Range"),
        type: readCharacteristic(profile, "Type"),
        s: readCharacteristic(profile, "S"),
        ap: readCharacteristic(profile, "AP"),
        d: readCharacteristic(profile, "D"),
        abilities: readCharacteristic(profile, "Abilities"),
        count: source.number ?? undefined,
      };
      const existing = weaponMap.get(name);
      if (!existing) {
        weaponMap.set(name, next);
        continue;
      }
      const counts = [existing.count, next.count].filter(
        (value): value is number => typeof value === "number",
      );
      weaponMap.set(name, {
        ...existing,
        count: counts.length ? counts.reduce((sum, value) => sum + value, 0) : existing.count,
      });
    }
    const weapons = Array.from(weaponMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const abilityProfiles = profileEntries
      .filter((entry) => entry.kind === "ability")
      .map(({ profile }) => ({
        id: profile.id,
        name: profile.name ?? "Ability",
        description: readCharacteristic(profile, "Description"),
      }));
    const abilities = uniqueBy(abilityProfiles, (ability) => ability.name).sort(
      (a, b) => a.name.localeCompare(b.name),
    );

    const psykerProfile = profileEntries.find(
      (entry) => entry.kind === "psyker",
    )?.profile;
    const psychicPowerProfiles = profileEntries
      .filter((entry) => entry.kind === "psychic-power")
      .map(({ profile }) => ({
        id: profile.id,
        name: profile.name ?? "Psychic Power",
        warpCharge: readCharacteristic(profile, "Warp Charge"),
        range: readCharacteristic(profile, "Range"),
        details: readCharacteristic(profile, "Details"),
      }));

    const psychic = psykerProfile
      ? {
          id: psykerProfile.id,
          name: psykerProfile.name ?? "Psyker",
          cast: readCharacteristic(psykerProfile, "Cast"),
          deny: readCharacteristic(psykerProfile, "Deny"),
          powers: readCharacteristic(psykerProfile, "Powers Known"),
          other: readCharacteristic(psykerProfile, "Other"),
          psychicPowers: psychicPowerProfiles,
        }
      : null;

    const keywords = uniqueBy(
      selection.categories
        .filter((category) => !category.isPrimary)
        .map((category) => category.name)
        .filter((name): name is string => Boolean(name))
        .filter((name) => !EXCLUDED_KEYWORDS.has(name)),
      (name) => name,
    );

    const unitRules = uniqueBy(
      flattened.flatMap((entry) => entry.rules).filter((rule) => !rule.isHidden),
      (rule) => rule.id,
    );
    const forceRules = uniqueBy(
      (match.forceRules ?? []).filter((rule) => !rule.isHidden),
      (rule) => rule.id,
    );

    return {
      selection,
      name: selection.name ?? "Unknown unit",
      role: unitRole(selection),
      points: unitPoints(selection),
      characteristics,
      weapons,
      abilities,
      psychic,
      keywords,
      unitRules,
      forceRules,
    };
  }, [roster, unitId]);
}
