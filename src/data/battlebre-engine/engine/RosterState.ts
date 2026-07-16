/**
 * Das veränderliche Roster-Dokument.
 */
import { CatalogueId, CostTypeId, ForceEntryId, ForceId, RosterId } from "../types/ids";
import { SelectionInstance, walk } from "./SelectionInstance";

export interface ForceInstance {
  id: ForceId;
  name: string;
  forceEntryId: ForceEntryId;
  catalogueId: CatalogueId;
  catalogueName: string;
  rootSelections: SelectionInstance[];
}

export interface RosterState {
  id: RosterId;
  name: string;
  gameSystemId: string;
  gameSystemName: string;
  forces: ForceInstance[];
  /** Kostenlimits je costType (z. B. points → 2000). */
  costLimits: Map<CostTypeId, number>;
}

/** Iteriert über alle Selection-Instanzen einer Force. */
export function* walkForce(force: ForceInstance): Generator<SelectionInstance> {
  for (const root of force.rootSelections) {
    yield* walk(root);
  }
}

/** Iteriert über alle Selection-Instanzen des gesamten Rosters. */
export function* walkRoster(roster: RosterState): Generator<SelectionInstance> {
  for (const force of roster.forces) {
    yield* walkForce(force);
  }
}

/** Findet die Force, die eine Instanz enthält. */
export function forceOfInstance(
  roster: RosterState,
  instanceId: string
): ForceInstance | undefined {
  for (const force of roster.forces) {
    for (const node of walkForce(force)) {
      if (node.instanceId === instanceId) return force;
    }
  }
  return undefined;
}
