/**
 * BattleBreRosterEngine – die lesende/darstellende Fassade über einem fertigen
 * Roster.
 *
 * Nimmt ein bereits geparstes bzw. gebautes Roster (App-Rendermodell
 * `src/data/models/roster`, via `fromLegacyRoster` in das vereinfachte
 * Analyse-Modell `models/common` überführt) und exponiert die View-Model-
 * Funktionen für die UI: Einheiten-Sektionen, Einheiten-Details, Waffen,
 * Fähigkeiten, Army-Konfiguration, Battle-Size, Detachment. Plugin-gesteuert.
 *
 * Gegenstück zur `BattleBreBuilderEngine` (Bau aus Katalogen): deren
 * `toRoster()` liefert genau das `Roster`, das hier via `fromLegacyRoster`
 * hineingegeben werden kann.
 */
import type { Roster as LegacyRoster } from "../models/roster";
import type { Force, Profile, Roster, Rule, Selection } from "./models/common";
import { toEngineRoster } from "./adapters/legacy-roster";
import {
  DefaultPlugin,
  GameSystemPlugin,
  ProfileRef,
  RuleRef,
  RosterIndex,
  SelectionNode,
} from "./plugins/gamesystem.plugin";

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
  abilityRefs?: Array<{ label: string; lookupId: string }>;
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
  selection: Selection;
  name: string;
  role: string;
  points: number | null;
  count: number;
  models: UnitModel[];
  characteristics: UnitCharacteristics[];
  weapons: UnitWeapon[];
  abilities: UnitAbility[];
  abilityLookup: Record<string, { name: string; description: string }>;
  profileSections: UnitProfileSection[];
  keywords: string[];
  unitRules: Rule[];
  forceRules: Rule[];
};

export type UnitItem = {
  id: string;
  name: string;
  role: string;
  points: number | null;
  characteristics: UnitCharacteristics[];
  invulnerableSave?: string;
  feelNoPain?: string;
  selection: Selection;
};

export type UnitSection = {
  title: string;
  data: UnitItem[];
};

export type ArmyConfiguration = {
  globalRules: Rule[];
  configurations: Selection[];
};

export type ConfigurationDetails = {
  selectionNames: string[];
  ruleNames: string[];
  profileNames: string[];
};

type EngineOptions = {
  plugin?: GameSystemPlugin;
  pluginId?: string;
  plugins?: GameSystemPlugin[];
};

type ProfileKind = "unit" | "weapon" | "ability" | "other";

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

const EXCLUDED_KEYWORDS = new Set(["Configuration"]);

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

const dedupePlugins = (plugins: GameSystemPlugin[]) => {
  const map = new Map<string, GameSystemPlugin>();
  for (const plugin of plugins) {
    if (!map.has(plugin.id)) {
      map.set(plugin.id, plugin);
    }
  }
  return Array.from(map.values());
};

const resolvePlugin = (roster: Roster, options?: EngineOptions) => {
  const available = dedupePlugins([DefaultPlugin, ...(options?.plugins ?? [])]);
  if (options?.plugin) {
    return options.plugin;
  }
  if (options?.pluginId) {
    const found = available.find((plugin) => plugin.id === options.pluginId);
    if (found) {
      return found;
    }
    return DefaultPlugin;
  }
  const matched = available.find((plugin) => plugin.matchesRoster(roster));
  return matched ?? DefaultPlugin;
};

const buildRosterIndex = (roster: Roster): RosterIndex => {
  const forcesById = new Map<string, Force>();
  const selectionsById = new Map<string, SelectionNode>();
  const selectionsByForce = new Map<string, string[]>();
  const selectionsByType = new Map<string, string[]>();
  const profilesAll: ProfileRef[] = [];
  const rulesAll: RuleRef[] = [];

  for (const rule of roster.rules ?? []) {
    rulesAll.push({ rule, scope: "roster" });
  }

  const addSelectionType = (selection: Selection) => {
    const typeKey = normalize(selection.type);
    if (!typeKey) {
      return;
    }
    const list = selectionsByType.get(typeKey) ?? [];
    list.push(selection.id);
    selectionsByType.set(typeKey, list);
  };

  for (const force of roster.forces ?? []) {
    forcesById.set(force.id, force);
    selectionsByForce.set(force.id, []);
    for (const rule of force.rules ?? []) {
      rulesAll.push({ rule, scope: "force", forceId: force.id });
    }
    const walk = (
      selection: Selection,
      parentId: string | undefined,
      path: string[],
    ) => {
      const node: SelectionNode = {
        selection,
        parentId,
        forceId: force.id,
        path: [...path, selection.id],
      };
      selectionsById.set(selection.id, node);
      selectionsByForce.get(force.id)?.push(selection.id);
      addSelectionType(selection);
      for (const profile of selection.profiles ?? []) {
        profilesAll.push({
          profile,
          selectionId: selection.id,
          forceId: force.id,
        });
      }
      for (const rule of selection.rules ?? []) {
        rulesAll.push({
          rule,
          scope: "selection",
          forceId: force.id,
          selectionId: selection.id,
        });
      }
      for (const child of selection.selections ?? []) {
        walk(child, selection.id, node.path);
      }
    };
    for (const selection of force.selections ?? []) {
      walk(selection, undefined, []);
    }
  }

  return {
    forcesById,
    selectionsById,
    selectionsByForce,
    selectionsByType,
    profilesAll,
    rulesAll,
  };
};

const flattenSelections = (selection: Selection): Selection[] => [
  selection,
  ...selection.selections.flatMap(flattenSelections),
];

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

const collectModelSelections = (
  selection: Selection,
  isRoot: boolean,
): Selection[] => {
  const type = normalize(selection.type);
  if (!isRoot && type === "unit") {
    return [];
  }
  const models: Selection[] = [];
  if (type === "model") {
    models.push(selection);
  }
  for (const child of selection.selections) {
    models.push(...collectModelSelections(child, false));
  }
  return models;
};

const unitBaseModelCount = (selection: Selection): number => {
  const models = collectModelSelections(selection, true);
  if (!models.length) {
    return readSelectionNumber(selection);
  }
  const total = models.reduce(
    (sum, entry) => sum + readSelectionNumber(entry),
    0,
  );
  const overrides = models.reduce((sum, entry) => {
    const hasUnitProfile = entry.profiles.some(
      (profile) => normalize(profile.typeName) === "unit" && !profile.isHidden,
    );
    return sum + (hasUnitProfile ? readSelectionNumber(entry) : 0);
  }, 0);
  const baseCount = total - overrides;
  return baseCount > 0 ? baseCount : total;
};

const unitCharacteristicCount = (selection: Selection): number => {
  const type = normalize(selection.type);
  if (type === "model") {
    return readSelectionNumber(selection);
  }
  if (type === "unit") {
    return unitBaseModelCount(selection);
  }
  return readSelectionNumber(selection);
};

const unitCount = (selection: Selection): number => {
  const modelSelections = collectModelSelections(selection, true);
  if (modelSelections.length) {
    return modelSelections.reduce(
      (sum, entry) => sum + readSelectionNumber(entry),
      0,
    );
  }
  return readSelectionNumber(selection);
};

const unitModels = (selection: Selection): UnitModel[] => {
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
    a.name.localeCompare(b.name),
  );
};

const readCharacteristic = (profile: Profile, key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  const normalized = keys.map(normalize);
  const entry = profile.characteristics.find((item) =>
    normalized.includes(normalize(item.name)),
  );
  return entry?.value ?? "-";
};

const unitCharacteristics = (flattened: Selection[]) => {
  const unitProfiles = flattened.flatMap((entry) =>
    entry.profiles
      .filter(
        (profile) => !profile.isHidden && normalize(profile.typeName) === "unit",
      )
      .map((profile) => ({ profile, selection: entry })),
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

const abilityValue = (profile: Profile) => {
  const description = readCharacteristic(profile, "Description");
  const source =
    description && description !== "-" ? description : profile.name ?? "";
  const match = source.match(/\d+\+?/);
  return match?.[0] ?? (description && description !== "-" ? description : "");
};

const findAbilityValue = (
  flattened: Selection[],
  matcher: (value: string) => boolean,
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

const unitRole = (selection: Selection) => {
  const primary = selection.categories.find((category) => category.isPrimary);
  if (primary?.name) {
    return primary.name;
  }
  const fallback = selection.categories.find((category) =>
    ROLE_ORDER_INDEX.has(normalize(category.name)),
  );
  return fallback?.name ?? "Other";
};

const unitPoints = (selection: Selection): number | null => {
  const cost = selection.costs.find(
    (entry) => normalize(entry.name) === "pts",
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

const collectUnitSelections = (
  selections: Selection[],
  force: Force,
  plugin: GameSystemPlugin,
  hasUnitAncestor: boolean,
): Selection[] => {
  const units: Selection[] = [];
  for (const selection of selections) {
    const isUnit = plugin.isUnit(selection, { force });
    const isModel = normalize(selection.type) === "model";
    if (isUnit || (isModel && !hasUnitAncestor)) {
      units.push(selection);
    }
    units.push(
      ...collectUnitSelections(
        selection.selections,
        force,
        plugin,
        hasUnitAncestor || isUnit,
      ),
    );
  }
  return units;
};

const parseAbilityTokens = (abilities: string) =>
  normalize(abilities) === "-" || !abilities
    ? []
    : abilities
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

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

const entriesByKind = (
  visibleEntries: ProfileEntry[],
  allEntries: ProfileEntry[],
  kind: ProfileKind,
) => {
  const visible = visibleEntries.filter((entry) => entry.kind === kind);
  if (visible.length) {
    return visible;
  }
  return allEntries.filter((entry) => entry.kind === kind);
};

const classifyProfile = (
  profile: Profile,
  plugin: GameSystemPlugin,
): ProfileKind => {
  if (plugin.isWeaponProfile(profile)) {
    return "weapon";
  }
  const typeName = normalize(profile.typeName);
  if (typeName === "unit") {
    return "unit";
  }
  if (/\babilit(y|ies)\b/.test(typeName)) {
    return "ability";
  }
  return "other";
};

type ProfileEntry = {
  profile: Profile;
  selection: Selection;
  kind: ProfileKind;
  typeName: string;
  typeKey: string;
};

const toProfileEntries = (
  entries: Array<{ profile: Profile; selection: Selection }>,
  plugin: GameSystemPlugin,
): ProfileEntry[] =>
  entries.map(({ profile, selection }) => {
    const typeName = profile.typeName ?? "Other";
    return {
      profile,
      selection,
      kind: classifyProfile(profile, plugin),
      typeName,
      typeKey: normalize(typeName),
    };
  });

const weaponMode = (
  profile: Profile,
  range: string,
  plugin: GameSystemPlugin,
): UnitWeapon["mode"] => {
  if (!plugin.isWeaponProfile(profile)) {
    return "other";
  }
  if (plugin.isRangedWeapon(profile)) {
    return "ranged";
  }
  const normalizedRange = normalize(range);
  if (normalizedRange === "melee") {
    return "melee";
  }
  if (
    normalizedRange &&
    normalizedRange !== "-" &&
    normalizedRange !== "\u2014"
  ) {
    return "ranged";
  }
  return "other";
};

const unitPointsWithChildren = (selection: Selection): number | null => {
  const selections = flattenSelections(selection);
  let foundPoints = false;
  const total = selections.reduce((sum, entry) => {
    const points = entry.costs
      .filter((cost) => {
        const isPoints =
          normalize(cost.name) === "pts" || cost.typeId === "points";
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

export class BattleBreRosterEngine {
  readonly roster: Roster;
  readonly index: RosterIndex;
  readonly plugin: GameSystemPlugin;
  readonly plugins: GameSystemPlugin[];

  constructor(roster: Roster, options?: EngineOptions) {
    this.roster = roster;
    this.plugins = dedupePlugins([
      DefaultPlugin,
      ...(options?.plugins ?? []),
    ]);
    this.plugin = resolvePlugin(roster, options);
    this.index = buildRosterIndex(roster);
  }

  static fromLegacyRoster(
    roster: LegacyRoster,
    options?: EngineOptions,
  ): BattleBreRosterEngine {
    return new BattleBreRosterEngine(toEngineRoster(roster), options);
  }

  getSelectionById(id: string): Selection | null {
    return this.index.selectionsById.get(id)?.selection ?? null;
  }

  getForceById(id: string): Force | null {
    return this.index.forcesById.get(id) ?? null;
  }

  getSelectionsByType(type: string): Selection[] {
    const ids = this.index.selectionsByType.get(normalize(type)) ?? [];
    return ids
      .map((id) => this.index.selectionsById.get(id)?.selection)
      .filter((entry): entry is Selection => Boolean(entry));
  }

  getAllRules(scope?: RuleRef["scope"]): RuleRef[] {
    if (!scope) {
      return [...this.index.rulesAll];
    }
    return this.index.rulesAll.filter((rule) => rule.scope === scope);
  }

  getWeaponProfiles(): ProfileRef[] {
    return this.index.profilesAll.filter((entry) =>
      this.plugin.isWeaponProfile(entry.profile),
    );
  }

  getArmyRules(): Rule[] {
    return this.plugin.getArmyRules(this.roster, this.index);
  }

  getUnitSections(): UnitSection[] {
    return (this.roster.forces ?? [])
      .map((force, index) => {
        const units = collectUnitSelections(
          force.selections,
          force,
          this.plugin,
          false,
        )
          .map((selection) => {
            const flattened = flattenSelections(selection);
            const invulnerableSave = findAbilityValue(flattened, (name) =>
              name.includes("invulnerable save"),
            );
            const feelNoPain = findAbilityValue(flattened, (name) =>
              name.includes("feel no pain"),
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

        const title = force.name ?? force.catalogueName ?? `Detachment ${index + 1}`;

        return { title, data: units };
      })
      .filter((section) => section.data.length > 0);
  }

  getUnitDetails(unitId: string): UnitDetails | null {
    const node = this.index.selectionsById.get(unitId);
    if (!node) {
      return null;
    }

    const selection = node.selection;
    const forceRules = this.index.forcesById.get(node.forceId)?.rules ?? [];
    const flattened = flattenSelections(selection);
    const allProfilesWithSelection = flattened.flatMap((entry) =>
      entry.profiles.map((profile) => ({ profile, selection: entry })),
    );
    const profilesWithSelection = allProfilesWithSelection.filter(
      ({ profile }) => !profile.isHidden,
    );
    const profileEntries = toProfileEntries(
      profilesWithSelection,
      this.plugin,
    );
    const allProfileEntries = toProfileEntries(
      allProfilesWithSelection,
      this.plugin,
    );

    const buildProfilesByType = (entries: ProfileEntry[]) => {
      const map = new Map<string, { typeName: string; entries: ProfileEntry[] }>();
      for (const entry of entries) {
        if (entry.kind !== "other") {
          continue;
        }
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

    const unitProfileEntries = entriesByKind(
      profileEntries,
      allProfileEntries,
      "unit",
    );

    const characteristicMap = new Map<string, { profile: Profile; count: number }>();
    for (const entry of unitProfileEntries) {
      const id = entry.profile.id;
      const count = unitCharacteristicCount(entry.selection);
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

    const keywords = uniqueBy(
      selection.categories
        .filter((category) => !category.isPrimary)
        .map((category) => category.name)
        .filter((name): name is string => Boolean(name))
        .filter((name) => !EXCLUDED_KEYWORDS.has(name)),
      (name) => name,
    );

    const unitRules = uniqueBy(
      flattened
        .flatMap((entry) => entry.rules)
        .filter((rule) => !rule.isHidden),
      (rule) => rule.id,
    );
    const forceRulesVisible = uniqueBy(
      forceRules.filter((rule) => !rule.isHidden),
      (rule) => rule.id,
    );

    const lookupEntries = [
      ...abilities.map((ability) => ({
        id: ability.id,
        name: ability.name,
        description: ability.description,
        normalized: normalize(ability.name),
      })),
      ...[...unitRules, ...forceRulesVisible].map((rule) => ({
        id: rule.id,
        name: rule.name ?? "Rule",
        description: rule.description ?? "No description available.",
        normalized: normalize(rule.name),
      })),
    ]
      .filter((entry) => entry.normalized)
      .sort((a, b) => b.normalized.length - a.normalized.length);

    const abilityLookup = new Map<string, { name: string; description: string }>(
      lookupEntries.map((entry) => [
        entry.id,
        {
          name: entry.name,
          description: entry.description || "No description available.",
        },
      ]),
    );

    const resolveLookupId = (label: string) => {
      const normalized = normalize(label);
      if (!normalized) {
        return "";
      }
      const exact = lookupEntries.find((entry) => entry.normalized === normalized);
      if (exact) {
        return exact.id;
      }
      const prefix = lookupEntries.find((entry) =>
        normalized.startsWith(entry.normalized),
      );
      if (prefix) {
        return prefix.id;
      }
      const fallbackId = `weapon-ability:${normalized}`;
      if (!abilityLookup.has(fallbackId)) {
        abilityLookup.set(fallbackId, {
          name: label,
          description: "No description available.",
        });
      }
      return fallbackId;
    };

    const weaponProfiles = entriesByKind(
      profileEntries,
      allProfileEntries,
      "weapon",
    );
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
      const abilityRefs = parseAbilityTokens(abilities).map((label) => ({
        label,
        lookupId: resolveLookupId(label),
      }));
      const mode = weaponMode(profile, range, this.plugin);
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
        abilityRefs,
        count: source.number ?? undefined,
      };
      const existing = weaponMap.get(key);
      if (!existing) {
        weaponMap.set(key, next);
        continue;
      }
      const counts = [existing.count, next.count].filter(
        (value): value is number => typeof value === "number",
      );
      weaponMap.set(key, {
        ...existing,
        count: counts.length
          ? counts.reduce((sum, value) => sum + value, 0)
          : existing.count,
      });
    }
    const weapons = Array.from(weaponMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      selection,
      name: selection.name ?? "Unknown unit",
      role: unitRole(selection),
      points: unitPointsWithChildren(selection),
      count: unitCount(selection),
      models: unitModels(selection),
      characteristics,
      weapons,
      abilities,
      abilityLookup: Object.fromEntries(abilityLookup),
      profileSections: extraProfileSections,
      keywords,
      unitRules,
      forceRules: forceRulesVisible,
    };
  }

  getArmyConfiguration(): ArmyConfiguration {
    const normalizeName = (value?: string) => normalize(value);
    const isUnitSelection = (selection: Selection) => {
      const type = normalizeName(selection.type);
      return type === "model" || type === "unit";
    };

    const addRules = (rules: Rule[], map: Map<string, Rule>) => {
      for (const rule of rules) {
        if (!rule.isHidden && !map.has(rule.id)) {
          map.set(rule.id, rule);
        }
      }
    };

    const collectSelectionRules = (
      selections: Selection[],
      map: Map<string, Rule>,
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

    const hasConfigurationCategory = (selection: Selection) =>
      selection.categories.some(
        (category) => normalizeName(category.name) === "configuration",
      );

    const isUpdateSelection = (selection: Selection) =>
      normalizeName(selection.type) === "update";

    const addConfigurations = (
      selections: Selection[],
      map: Map<string, Selection>,
    ) => {
      for (const selection of selections) {
        if (!map.has(selection.id)) {
          map.set(selection.id, selection);
        }
      }
    };

    const collectConfigurations = (
      selections: Selection[],
      map: Map<string, Selection>,
    ) => {
      for (const selection of selections) {
        if (isUnitSelection(selection)) {
          continue;
        }
        const isUpdateConfiguration =
          isUpdateSelection(selection) && selections.length === 1;
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
      selections: Selection[],
      map: Map<string, Rule>,
    ) => {
      for (const selection of selections) {
        if (isUnitSelection(selection)) {
          continue;
        }
        const isUpdateConfiguration =
          isUpdateSelection(selection) && selections.length === 1;
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
      selections: Selection[],
      map: Map<string, Rule>,
    ) => {
      for (const selection of selections) {
        if (isUnitSelection(selection)) {
          continue;
        }
        const normalizedName = normalizeName(selection.name);
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

    const ruleMap = new Map<string, Rule>();
    const configurationMap = new Map<string, Selection>();
    for (const force of this.roster.forces) {
      addRules(force.rules, ruleMap);
      collectConfigurationRules(force.selections, ruleMap);
      collectDetachmentRules(force.selections, ruleMap);
      collectConfigurations(force.selections, configurationMap);
    }

    return {
      globalRules: Array.from(ruleMap.values()),
      configurations: Array.from(configurationMap.values()),
    };
  }

  getConfigurationDetails(selection: Selection): ConfigurationDetails {
    const selectionNames = new Set<string>();
    const ruleNames = new Set<string>();
    const profileNames = new Set<string>();
    const stack: Selection[] = [selection];

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
  }

  getBattleSize(): string | null {
    const findBattleSize = (selections: Selection[]): string | null => {
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

    return findBattleSize(
      this.roster.forces.flatMap((entry) => entry.selections),
    );
  }

  getDetachment(): string | null {
    const findDetachment = (selections: Selection[]): string | null => {
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

    return findDetachment(
      this.roster.forces.flatMap((entry) => entry.selections),
    );
  }
}
