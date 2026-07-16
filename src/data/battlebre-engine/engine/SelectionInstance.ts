/**
 * Laufzeit-Knoten des Rosters. Eine SelectionInstance entspricht einer konkret
 * gewählten Option. `number` ist die BattleScribe-"Selection Count".
 *
 * Kosten sind PRO Einzel-Selection gespeichert; der Beitrag zur Summe ist
 * `cost × number` (siehe CostEngine). Ein Eltern-`number` multipliziert NICHT
 * automatisch die Kinder – jedes Kind trägt sein eigenes `number`.
 */
import { Constraint, Profile } from "../types/catalogue";
import { CategoryId, InstanceId } from "../types/ids";
import { EffectiveEntry } from "./EntryTree";

export interface ResolvedCategory {
  id: CategoryId;
  name: string;
  primary: boolean;
}

export interface SelectionInstance {
  instanceId: InstanceId;
  /** Effektive Id des Eintrags/Links, aus dem die Instanz erzeugt wurde. */
  sourceEntryId: string;
  /** Ziel-Entry-Id (für Link-/Target-Matching in Queries). */
  targetId: string;
  /** Id der besitzenden Gruppe (falls aus einer Gruppe gewählt). */
  entryGroupId?: string;
  name: string;
  type: string;
  number: number;
  parent?: SelectionInstance;
  children: SelectionInstance[];
  categories: ResolvedCategory[];
  profiles: Profile[];
  /** Kosten pro Einzel-Selection: typeId → Wert (abgeleitet, nach Modifiern). */
  costs: Map<string, number>;
  /** Constraints (abgeleitet, nach Modifiern) – Basis der Validierung. */
  constraints: Constraint[];
  /** Unveränderlicher Ausgangs-Eintrag; Quelle für die Neuableitung im recompute. */
  blueprint: EffectiveEntry;
}

/** Erzeugt eine Instanz aus einem effektiven Eintrag (ohne Modifier-Anwendung). */
export function createInstance(
  instanceId: InstanceId,
  eff: EffectiveEntry,
  opts: { number?: number; entryGroupId?: string } = {}
): SelectionInstance {
  const costs = new Map<string, number>();
  for (const c of eff.costs) {
    if (!c["@_typeId"]) continue;
    costs.set(c["@_typeId"], toNumber(c["@_value"]));
  }
  return {
    instanceId,
    sourceEntryId: eff.id,
    targetId: eff.targetId,
    entryGroupId: opts.entryGroupId,
    name: eff.name,
    type: eff.type,
    number: opts.number ?? 1,
    parent: undefined,
    children: [],
    categories: [],
    profiles: eff.profiles,
    costs,
    constraints: eff.constraints.slice(),
    blueprint: eff,
  };
}

/** Setzt Kosten & Constraints einer Instanz auf ihren Blueprint zurück. */
export function resetDerived(inst: SelectionInstance): void {
  const costs = new Map<string, number>();
  for (const c of inst.blueprint.costs) {
    if (!c["@_typeId"]) continue;
    costs.set(c["@_typeId"], toNumber(c["@_value"]));
  }
  inst.costs = costs;
  // Flache Kopien der Constraints, damit Modifier den Wert gefahrlos anpassen können.
  inst.constraints = inst.blueprint.constraints.map((c) => ({ ...c }));
}

function toNumber(v: string | number | undefined): number {
  if (v === undefined) return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

/** Tiefensuche über eine Instanz und alle Nachfahren. */
export function* walk(instance: SelectionInstance): Generator<SelectionInstance> {
  yield instance;
  for (const child of instance.children) {
    yield* walk(child);
  }
}

/** Sucht eine Instanz per Id in einem Teilbaum. */
export function findInstance(
  roots: SelectionInstance[],
  instanceId: InstanceId
): SelectionInstance | undefined {
  for (const root of roots) {
    for (const node of walk(root)) {
      if (node.instanceId === instanceId) return node;
    }
  }
  return undefined;
}

/** Entfernt eine Instanz (per Id) aus einem Teilbaum. Gibt true bei Erfolg. */
export function removeInstance(
  roots: SelectionInstance[],
  instanceId: InstanceId
): boolean {
  const idx = roots.findIndex((r) => r.instanceId === instanceId);
  if (idx >= 0) {
    roots.splice(idx, 1);
    return true;
  }
  for (const root of roots) {
    if (removeFromChildren(root, instanceId)) return true;
  }
  return false;
}

function removeFromChildren(
  parent: SelectionInstance,
  instanceId: InstanceId
): boolean {
  const idx = parent.children.findIndex((c) => c.instanceId === instanceId);
  if (idx >= 0) {
    parent.children.splice(idx, 1);
    return true;
  }
  for (const child of parent.children) {
    if (removeFromChildren(child, instanceId)) return true;
  }
  return false;
}
