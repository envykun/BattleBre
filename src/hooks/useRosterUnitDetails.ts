import type {
  RosterProfile,
  Roster,
  RosterRule,
  RosterSelection,
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

export type UnitModel = {
  id: string;
  name: string;
  count: number;
};

export type UnitProfileSection = {
  typeName: string;
  entries: Array<{
    id: string;
    name: string;
    characteristics: Array<{ name: string; value: string }>;
  }>;
};

export type UnitDetails = {
  selection: RosterSelection;
  name: string;
  role: string;
  points: number | null;
  count: number;
  models: UnitModel[];
  characteristics: UnitCharacteristics[];
  weapons: UnitWeapon[];
  abilities: UnitAbility[];
  profileSections: UnitProfileSection[];
  keywords: string[];
  unitRules: RosterRule[];
  forceRules: RosterRule[];
};

type ProfileKind =
  | "unit"
  | "weapon"
  | "ability"
  | "other";

const EXCLUDED_KEYWORDS = new Set(["Configuration"]);

const flattenSelections = (selection: RosterSelection): RosterSelection[] => [
  selection,
  ...selection.selections.flatMap(flattenSelections),
];

const findSelectionInForce = (
  selections: RosterSelection[],
  unitId: string
): RosterSelection | null => {
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

const readCharacteristic = (profile: RosterProfile, key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  const normalized = keys.map(normalize);
  const entry = profile.characteristics.find((item) =>
    normalized.includes(normalize(item.name))
  );
  return entry?.value ?? "-";
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const PROFILE_KIND_BY_TYPE: Record<string, ProfileKind> = {
  unit: "unit",
  abilities: "ability",
  "melee weapons": "weapon",
  "ranged weapons": "weapon",
};

const WEAPON_MODE_BY_TYPE: Record<string, UnitWeapon["mode"]> = {
  "melee weapons": "melee",
  "ranged weapons": "ranged",
};

const CORE_TYPE_NAMES = new Set([
  "unit",
  "abilities",
  "melee weapons",
  "ranged weapons",
]);

type ProfileEntry = {
  profile: RosterProfile;
  selection: RosterSelection;
  kind: ProfileKind;
  typeName: string;
  typeKey: string;
};

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

const unitCount = (selection: RosterSelection): number => {
  const modelSelections = collectModelSelections(selection, true);
  if (modelSelections.length) {
    return modelSelections.reduce(
      (sum, entry) => sum + readSelectionNumber(entry),
      0
    );
  }
  return readSelectionNumber(selection);
};

const unitModels = (selection: RosterSelection): UnitModel[] => {
  const modelSelections = collectModelSelections(selection, true);
  const modelMap = new Map<string, UnitModel>();
  for (const entry of modelSelections) {
    const name = entry.name ?? "Model";
    const count = readSelectionNumber(entry);
    const existing = modelMap.get(name);
    if (existing) {
      existing.count += count;
    } else {
      modelMap.set(name, { id: entry.id, name, count });
    }
  }
  return Array.from(modelMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
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
      (profile) => !profile.isHidden && normalize(profile.typeName) === "unit"
    );
    return sum + (hasUnitProfile ? readSelectionNumber(entry) : 0);
  }, 0);
  const baseCount = total - overrides;
  return baseCount > 0 ? baseCount : total;
};

const unitCharacteristicCount = (entry: ProfileEntry): number => {
  const type = entry.selection.type?.toLowerCase();
  if (type === "model") {
    return readSelectionNumber(entry.selection);
  }
  if (type === "unit") {
    return unitBaseModelCount(entry.selection);
  }
  return readSelectionNumber(entry.selection);
};

const classifyProfile = (profile: RosterProfile): ProfileKind => {
  const typeName = normalize(profile.typeName);
  return PROFILE_KIND_BY_TYPE[typeName] ?? "other";
};

const toProfileEntries = (
  entries: Array<{ profile: RosterProfile; selection: RosterSelection }>
): ProfileEntry[] =>
  entries.map(({ profile, selection }) => {
    const typeName = profile.typeName ?? "Other";
    return {
      profile,
      selection,
      kind: classifyProfile(profile),
      typeName,
      typeKey: normalize(typeName),
    };
  });

const unitRole = (selection: RosterSelection) => {
  const primary = selection.categories.find((category) => category.isPrimary);
  if (primary?.name) {
    return primary.name;
  }
  return "Other";
};

const weaponMode = (profile: RosterProfile, range: string) => {
  const typeName = normalize(profile.typeName);
  const mapped = WEAPON_MODE_BY_TYPE[typeName];
  if (mapped) {
    return mapped;
  }
  const normalizedRange = normalize(range);
  if (normalizedRange === "melee") {
    return "melee";
  }
  if (normalizedRange && normalizedRange !== "-") {
    return "ranged";
  }
  return "other";
};

const unitPoints = (selection: RosterSelection): number | null => {
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
    const profileEntries = toProfileEntries(profilesWithSelection);
    const allProfileEntries = toProfileEntries(allProfilesWithSelection);

    const buildProfilesByType = (entries: ProfileEntry[]) => {
      const map = new Map<
        string,
        { typeName: string; entries: ProfileEntry[] }
      >();
      for (const entry of entries) {
        const existing = map.get(entry.typeKey);
        if (existing) {
          existing.entries.push(entry);
        } else {
          map.set(entry.typeKey, {
            typeName: entry.typeName,
            entries: [entry],
          });
        }
      }
      return map;
    };

    const profilesByType = buildProfilesByType(profileEntries);
    const allProfilesByType = buildProfilesByType(allProfileEntries);
    const typeKeys = new Set([
      ...profilesByType.keys(),
      ...allProfilesByType.keys(),
    ]);

    const extraProfileSections = Array.from(typeKeys)
      .filter((key) => !CORE_TYPE_NAMES.has(key))
      .map((key) => {
        const bucket = profilesByType.get(key) ?? allProfilesByType.get(key);
        if (!bucket) {
          return null;
        }
        const entries = uniqueBy(bucket.entries, (entry) => entry.profile.id)
          .map((entry) => ({
            id: entry.profile.id,
            name: entry.profile.name ?? bucket.typeName,
            characteristics: entry.profile.characteristics
              .filter((characteristic) => !characteristic.isHidden)
              .map((characteristic) => ({
                name: characteristic.name ?? "Value",
                value: characteristic.value ?? "-",
              })),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (!entries.length) {
          return null;
        }
        return { typeName: bucket.typeName, entries };
      })
      .filter((section): section is UnitProfileSection => section !== null)
      .sort((a, b) => a.typeName.localeCompare(b.typeName));

    const entriesByKind = (kind: ProfileKind) => {
      const visible = profileEntries.filter((entry) => entry.kind === kind);
      return visible.length
        ? visible
        : allProfileEntries.filter((entry) => entry.kind === kind);
    };

    const unitProfileEntries = entriesByKind("unit");

    const characteristicMap = new Map<
      string,
      { profile: RosterProfile; count: number }
    >();
    for (const entry of unitProfileEntries) {
      const id = entry.profile.id;
      const count = unitCharacteristicCount(entry);
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
      })
    );

    const weaponProfiles = entriesByKind("weapon");
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
      const key = [mode, name, range, type, a, bs, s, ap, d, abilities]
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
      models: unitModels(selection),
      characteristics,
      weapons,
      abilities,
      profileSections: extraProfileSections,
      keywords,
      unitRules,
      forceRules,
    };
  }, [roster, unitId]);
}
