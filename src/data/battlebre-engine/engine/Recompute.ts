/**
 * Orchestriert die Neuberechnung nach jeder Mutation:
 *   1. abgeleitete Werte (Kosten/Constraints) je Instanz auf den Blueprint zurücksetzen
 *   2. Modifier anwenden – mit beschränkter Fixpunkt-Schleife für verkettete
 *      Abhängigkeiten (Modifier, dessen Bedingung von einem anderen Modifier abhängt)
 *   3. Validierung (Kosten-Aufrollung erfolgt in der Validierung/beim Read-Model)
 */
import { ValidationReport } from "../builder/types";
import { validateRoster } from "./constraints/validate";
import { GameContext } from "./GameContext";
import { applyModifiers } from "./modifiers/apply";
import { ForceInstance, RosterState, walkForce } from "./RosterState";
import { resetDerived, SelectionInstance } from "./SelectionInstance";

const MAX_ITERATIONS = 5;

export function recompute(ctx: GameContext, roster: RosterState): ValidationReport {
  const pairs: Array<{ inst: SelectionInstance; force: ForceInstance }> = [];
  for (const force of roster.forces) {
    for (const inst of walkForce(force)) pairs.push({ inst, force });
  }

  let previous = "";
  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    for (const { inst } of pairs) resetDerived(inst);
    for (const { inst, force } of pairs) {
      applyModifiers(ctx, inst, { roster, force, anchor: inst });
    }
    const snapshot = hashState(pairs.map((p) => p.inst));
    if (snapshot === previous) break;
    previous = snapshot;
  }

  return validateRoster(ctx, roster);
}

/** Kompakter Zustands-Hash zur Konvergenzerkennung. */
function hashState(instances: SelectionInstance[]): string {
  const parts: string[] = [];
  for (const inst of instances) {
    parts.push(inst.instanceId, inst.name, String(inst.number));
    for (const [k, v] of inst.costs) parts.push(k, String(v));
    for (const c of inst.constraints) parts.push(String(c["@_id"]), String(c["@_value"]));
  }
  return parts.join(",");
}
