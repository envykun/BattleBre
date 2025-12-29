import type {
  Profile,
  Roster,
  Rule,
  Selection,
} from "@/src/data/models/roster";
import { useMemo } from "react";

export type UnitCharacteristics = {
  name: string;
  count: number;
  m: string;
  t: string;
  sv: string;
  w: string;
  ld: string;
  oc: string;
};

export type UnitWeapon = {
  id: string;
  name: string;
  mode: "melee" | "ranged" | "other";
  range: string;
  type: string;
  a: string;
  bs: string;
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
  count: number;
  characteristics: UnitCharacteristics[];
  weapons: UnitWeapon[];
  abilities: UnitAbility[];
  psychic: UnitPsychic | null;
  keywords: string[];
  unitRules: Rule[];
  forceRules: Rule[];
};

type ProfileKind =
  | "unit"
  | "weapon"
  | "ability"
  | "psyker"
  | "psychic-power"
  | "transport"
  | "wound-track"
  | "explosion"
  | "other";

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
  unitId: string
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

const readCharacteristic = (profile: Profile, key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  const normalized = keys.map(normalize);
  const entry = profile.characteristics.find((item) =>
    normalized.includes(normalize(item.name)),
  );
  return entry?.value ?? "-";
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const characteristicNames = (profile: Profile) =>
  new Set(profile.characteristics.map((entry) => normalize(entry.name)));

const readSelectionNumber = (selection: Selection): number => {
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

const unitCount = (selection: Selection): number => {
  const modelSelections = flattenSelections(selection).filter(
    (entry) => entry.type?.toLowerCase() === "model",
  );
  if (modelSelections.length) {
    return modelSelections.reduce(
      (sum, entry) => sum + readSelectionNumber(entry),
      0,
    );
  }
  return readSelectionNumber(selection);
};

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
  if (typeName.includes("transport")) {
    return "transport";
  }
  if (typeName.includes("wound track")) {
    return "wound-track";
  }
  if (typeName.includes("explosion")) {
    return "explosion";
  }
  if (typeName === "unit" || typeName.includes("unit")) {
    return "unit";
  }

  const names = characteristicNames(profile);
  const has = (value: string) => names.has(normalize(value));
  const hasAll = (values: string[]) => values.every((value) => has(value));
  const hasAny = (values: string[]) => values.some((value) => has(value));

  if (
    has("range") &&
    has("s") &&
    has("ap") &&
    has("d") &&
    hasAny(["type", "a", "attacks", "bs", "ws", "bs/ws"])
  ) {
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
  if (has("capacity")) {
    return "transport";
  }
  if (has("remaining w") || has("characteristic 1")) {
    return "wound-track";
  }
  if (hasAny(["mortal wounds", "dice roll", "distance"])) {
    return "explosion";
  }
  if (
    (has("m") && has("t") && (has("sv") || has("save")) && has("w")) ||
    (has("m") && (has("ws") || has("bs")) && has("s") && has("t"))
  ) {
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
    ROLE_ORDER.includes(category.name ?? "")
  );
  return fallback?.name ?? "Other";
};

const weaponMode = (profile: Profile, range: string) => {
  const typeName = normalize(profile.typeName);
  if (typeName.includes("melee")) {
    return "melee";
  }
  if (typeName.includes("ranged")) {
    return "ranged";
  }
  const normalizedRange = normalize(range);
  if (normalizedRange.includes("melee")) {
    return "melee";
  }
  if (normalizedRange && normalizedRange !== "-") {
    return "ranged";
  }
  return "other";
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

const uniqueBy = <T>(items: T[], getKey: (item: T) => string | undefined) => {
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
  unitId: string | null
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
      entry.profiles.map((profile) => ({ profile, selection: entry }))
    );
    const profilesWithSelection = allProfilesWithSelection.filter(
      ({ profile }) => !profile.isHidden
    );
    const profileEntries = profilesWithSelection.map((entry) => ({
      ...entry,
      kind: classifyProfile(entry.profile),
    }));
    const allProfileEntries = allProfilesWithSelection.map((entry) => ({
      ...entry,
      kind: classifyProfile(entry.profile),
    }));

    let unitProfileEntries = profileEntries.filter(
      (entry) => entry.kind === "unit",
    );
    if (!unitProfileEntries.length) {
      unitProfileEntries = allProfileEntries.filter(
        (entry) => entry.kind === "unit",
      );
    }

    const characteristicMap = new Map<
      string,
      { profile: Profile; count: number }
    >();
    for (const entry of unitProfileEntries) {
      const id = entry.profile.id;
      const count = unitCount(entry.selection);
      const existing = characteristicMap.get(id);
      characteristicMap.set(id, {
        profile: entry.profile,
        count: (existing?.count ?? 0) + count,
      });
    }

    const characteristics = Array.from(characteristicMap.values()).map(
      ({ profile, count }) => ({
        name: profile.name ?? "Unit",
        count,
        m: readCharacteristic(profile, ["M", "Move"]),
        t: readCharacteristic(profile, ["T", "Toughness"]),
        sv: readCharacteristic(profile, ["Sv", "Save"]),
        w: readCharacteristic(profile, ["W", "Wounds"]),
        ld: readCharacteristic(profile, ["Ld", "Leadership"]),
        oc: readCharacteristic(profile, ["OC", "Objective Control"]),
      }),
    );

    let weaponProfiles = profileEntries.filter(
      (entry) => entry.kind === "weapon"
    );
    if (!weaponProfiles.length) {
      weaponProfiles = allProfileEntries.filter(
        (entry) => entry.kind === "weapon"
      );
    }
    const weaponMap = new Map<string, UnitWeapon>();
    for (const { profile, selection: source } of weaponProfiles) {
      const name = profile.name ?? "Weapon";
      const range = readCharacteristic(profile, "Range");
      const type = readCharacteristic(profile, ["Type", "Weapon Type"]);
      const a = readCharacteristic(profile, ["A", "Attacks"]);
      const bs = readCharacteristic(profile, ["BS/WS", "BS", "WS"]);
      const s = readCharacteristic(profile, ["S", "Strength"]);
      const ap = readCharacteristic(profile, ["AP"]);
      const d = readCharacteristic(profile, ["D", "Damage"]);
      const abilities = readCharacteristic(profile, [
        "Abilities",
        "Ability",
        "Keywords",
      ]);
      const mode = weaponMode(profile, range);
      const key = [
        mode,
        name,
        range,
        type,
        a,
        bs,
        s,
        ap,
        d,
        abilities,
      ]
        .map((entry) => normalize(entry))
        .join("|");
      const next: UnitWeapon = {
        id: profile.id,
        name,
        mode,
        range,
        type,
        a,
        bs,
        s,
        ap,
        d,
        abilities,
        count: source.number ?? undefined,
      };
      const existing = weaponMap.get(key);
      if (!existing) {
        weaponMap.set(key, next);
        continue;
      }
      const counts = [existing.count, next.count].filter(
        (value): value is number => typeof value === "number"
      );
      weaponMap.set(key, {
        ...existing,
        count: counts.length
          ? counts.reduce((sum, value) => sum + value, 0)
          : existing.count,
      });
    }
    const weapons = Array.from(weaponMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const abilityProfiles = profileEntries
      .filter((entry) => entry.kind === "ability")
      .map(({ profile }) => ({
        id: profile.id,
        name: profile.name ?? "Ability",
        description: readCharacteristic(profile, "Description"),
      }));
    const abilities = uniqueBy(abilityProfiles, (ability) => ability.name).sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    const psykerProfile = profileEntries.find(
      (entry) => entry.kind === "psyker"
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
      (name) => name
    );

    const unitRules = uniqueBy(
      flattened
        .flatMap((entry) => entry.rules)
        .filter((rule) => !rule.isHidden),
      (rule) => rule.id
    );
    const forceRules = uniqueBy(
      (match.forceRules ?? []).filter((rule) => !rule.isHidden),
      (rule) => rule.id
    );

    return {
      selection,
      name: selection.name ?? "Unknown unit",
      role: unitRole(selection),
      points: unitPoints(selection),
      count: unitCount(selection),
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
