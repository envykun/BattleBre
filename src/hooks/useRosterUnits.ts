import type { Roster, Selection } from "@/src/data/models/roster";
import { useMemo } from "react";

export type UnitItem = {
  id: string;
  name: string;
  role: string;
  points: number | null;
  selection: Selection;
};

export type UnitSection = {
  title: string;
  data: UnitItem[];
};

const ROLE_ORDER = [
  "Characters",
  "Battleline",
  "Dedicated Transport",
  "Vehicle",
];

const flattenSelections = (selections: Selection[]): Selection[] =>
  selections.flatMap((selection) => [
    selection,
    ...flattenSelections(selection.selections),
  ]);

const isUnitSelection = (selection: Selection) => {
  const type = selection.type?.toLowerCase();
  if (type === "unit") {
    return true;
  }
  return type === "model" && selection.from !== "group";
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

const unitPoints = (selection: Selection): number | null => {
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

const orderIndex = (role: string) => {
  const index = ROLE_ORDER.indexOf(role);
  return index === -1 ? ROLE_ORDER.length : index;
};

export function useRosterUnits(roster: Roster | null): UnitSection[] {
  return useMemo(() => {
    if (!roster) {
      return [];
    }

    return roster.forces
      .map((force, index) => {
        const units = flattenSelections(force.selections)
          .filter(isUnitSelection)
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
