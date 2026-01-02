import { Force, Profile, Roster, Rule } from "../models/common";

type SelectionNode = {
  selection: Selection;
  parentId?: string;
  forceId: string;
  path: string[]; // IDs von Root bis Knoten
};

type ProfileRef = {
  profile: Profile;
  selectionId: string;
  forceId: string;
};

type RuleRef = {
  rule: Rule;
  scope: "roster" | "force" | "selection";
  forceId?: string;
  selectionId?: string;
};

export type RosterIndex = {
  selectionsById: Map<string, SelectionNode>;
  selectionsByForce: Map<string, string[]>; // forceId -> selectionIds (flach)
  selectionsByType: Map<string, string[]>; // typeLower -> selectionIds
  profilesAll: ProfileRef[];
  rulesAll: RuleRef[];
};

export type GameSystemPlugin = {
  // Kann anhand roster.gameSystem.id/name ausgewählt werden
  matchesRoster(roster: Roster): boolean;

  // Semantik: was gilt als Unit?
  isUnit(selection: Selection, ctx: { force: Force }): boolean;

  // Semantik: was gilt als Weapon Profile?
  isWeaponProfile(profile: Profile): boolean;

  // Semantik: ranged vs melee
  isRangedWeapon(profile: Profile): boolean;

  // Optional: welche Regeln gelten als “Army Rules”?
  // (z.B. “force-level rules”, “detachment rules”, etc.)
  getArmyRules(roster: Roster, index: RosterIndex): Rule[];
};

function dedupeRulesByName(rules: Rule[]): Rule[] {
  const seen = new Map<string, Rule>();
  for (const r of rules) {
    const key = r.name.trim().toLowerCase();
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()];
}

export const DefaultPlugin: GameSystemPlugin = {
  matchesRoster: () => true,

  isUnit: (sel) => (sel.type ?? "").toLowerCase() === "unit",

  isWeaponProfile: (p) => {
    const t = (p.typeName ?? "").toLowerCase();
    if (t.includes("weapon")) return true;
    // Heuristik: hat ein Charakteristikfeld namens "Range" / "Attacks" etc.
    const names = new Set(p.characteristics.map((c) => c.name.toLowerCase()));
    return names.has("range") || names.has("attacks");
  },

  isRangedWeapon: (p) => {
    // Heuristik: hat "Range" und ist nicht "Melee"/"-"
    const range = p.characteristics
      .find((c) => c.name.toLowerCase() === "range")
      ?.value?.trim();
    if (!range) return false;
    const r = range.toLowerCase();
    if (r === "melee" || r === "-" || r === "—") return false;
    return true;
  },

  getArmyRules: (roster, index) => {
    // Heuristik: roster.rules + force.rules + "roster-level" Regeln dedupliziert
    const all = [
      ...(roster.rules ?? []),
      ...roster.forces.flatMap((f) => f.rules ?? []),
      ...index.rulesAll
        .filter((r) => r.scope === "roster" || r.scope === "force")
        .map((r) => r.rule),
    ];
    return dedupeRulesByName(all);
  },
};
