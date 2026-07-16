/**
 * Scoped-Counting-Query – gemeinsame Grundlage für Constraints UND Conditions.
 *
 * PHASE 1: unterstützt `field` = selections | points | <costTypeId> und
 * `scope` = self | parent | force | roster, inkl. childId-Matching und
 * includeChildSelections. Kategorie-/Entry-Scopes und `shared`-Feinheiten
 * werden in Phase 2 ergänzt (siehe Plan). Nicht abgedeckte Scopes fallen
 * konservativ auf "force" zurück.
 */
import { Field } from "../../types/enums";
import { ForceInstance, RosterState, walkForce, walkRoster } from "../RosterState";
import { SelectionInstance } from "../SelectionInstance";

export interface QuerySpec {
  field: string;
  scope: string;
  childId: string;
  includeChildSelections: boolean;
  shared: boolean;
}

export interface QueryContext {
  roster: RosterState;
  force?: ForceInstance;
  anchor?: SelectionInstance;
}

/** Zählt die gemäß Spec passende Menge im angegebenen Scope. */
export function count(spec: QuerySpec, qctx: QueryContext): number {
  const domain = collectDomain(spec, qctx);
  const matching = domain.filter((inst) => matchesChild(inst, spec.childId));
  return measure(matching, spec.field);
}

/** Bestimmt die Instanz-Menge, die den Zählbereich bildet. */
function collectDomain(spec: QuerySpec, qctx: QueryContext): SelectionInstance[] {
  const { scope } = spec;
  switch (scope) {
    case "self":
      return qctx.anchor ? subtree(qctx.anchor, spec.includeChildSelections) : [];
    case "parent": {
      const parent = qctx.anchor?.parent;
      return parent ? subtree(parent, spec.includeChildSelections) : [];
    }
    case "roster":
      return Array.from(walkRoster(qctx.roster));
    case "force":
    default:
      // force + alle noch nicht abgedeckten Scopes (categoryId/entryId/ancestor)
      return qctx.force ? Array.from(walkForce(qctx.force)) : [];
  }
}

/**
 * Teilbaum ab `root`. Bei includeChildSelections=false nur `root` selbst plus
 * dessen direkte Kinder; sonst der komplette Teilbaum.
 */
function subtree(
  root: SelectionInstance,
  includeChildSelections: boolean
): SelectionInstance[] {
  if (!includeChildSelections) {
    return [root, ...root.children];
  }
  const out: SelectionInstance[] = [];
  const stack: SelectionInstance[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    out.push(node);
    stack.push(...node.children);
  }
  return out;
}

/** Prüft, ob eine Instanz zur childId passt (Entry, Ziel oder Kategorie). */
function matchesChild(inst: SelectionInstance, childId: string): boolean {
  if (!childId || childId === "any") return true;
  if (inst.sourceEntryId === childId || inst.targetId === childId) return true;
  return inst.categories.some((c) => c.id === childId);
}

/** Misst das Feld über die passende Instanz-Menge. */
function measure(instances: SelectionInstance[], field: string): number {
  if (field === Field.SELECTIONS) {
    return instances.reduce((acc, i) => acc + i.number, 0);
  }
  if (field === Field.FORCES) {
    // Phase 1: nicht separat modelliert.
    return 0;
  }
  // points oder eine konkrete costTypeId
  const typeId = field === Field.POINTS ? "points" : field;
  return instances.reduce(
    (acc, i) => acc + (i.costs.get(typeId) ?? 0) * i.number,
    0
  );
}
