/**
 * Kosten-Aufrollung. Beitrag je Instanz = Kosten pro Einzel-Selection × number,
 * summiert über alle Nachfahren – je Force und je Roster.
 */
import { CostTypeId } from "../types/ids";
import { ForceInstance, RosterState, walkForce, walkRoster } from "./RosterState";
import { SelectionInstance } from "./SelectionInstance";

export type CostTotals = Map<CostTypeId, number>;

function sum(instances: Iterable<SelectionInstance>): CostTotals {
  const totals: CostTotals = new Map();
  for (const inst of instances) {
    for (const [typeId, value] of inst.costs) {
      totals.set(typeId, (totals.get(typeId) ?? 0) + value * inst.number);
    }
  }
  return totals;
}

export function rollUpForce(force: ForceInstance): CostTotals {
  return sum(walkForce(force));
}

export function rollUpRoster(roster: RosterState): CostTotals {
  return sum(walkRoster(roster));
}

/** Summiert die Kosten eines Teilbaums (Instanz inkl. Nachfahren). */
export function rollUpSubtree(root: SelectionInstance): CostTotals {
  return sum(walkSubtree(root));
}

function* walkSubtree(node: SelectionInstance): Generator<SelectionInstance> {
  yield node;
  for (const child of node.children) yield* walkSubtree(child);
}
