import type { Roster, RosterSelection } from "@/src/data/models/roster";
import { useMemo } from "react";

export type UnitItem = {
  id: string;
  name: string;
  role: string;
  points: number | null;
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
          .map((selection) => ({
            id: selection.id,
            name: selection.name ?? "Unknown unit",
            role: unitRole(selection),
            points: unitPoints(selection),
            selection,
          }))
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
