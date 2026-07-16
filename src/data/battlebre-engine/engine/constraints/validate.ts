/**
 * Constraint-Validierung → ValidationReport.
 *
 * PHASE 1: min/max auf `field` = selections | points | <costTypeId>,
 * `scope` = self | parent | force | roster, plus Roster-Kostenlimits.
 * Eine Constraint misst die Menge ihres Trägers (Entry/Kategorie) im Scope;
 * für Kosten-Felder wird die Kostensumme im Scope gemessen.
 *
 * Meldungen werden dedupliziert (gleiche constraint+scope+force nur einmal).
 */
import { attrBool, attrNum, attrStr } from "../../data/xml";
import { Constraint } from "../../types/catalogue";
import { ConstraintType, Field } from "../../types/enums";
import { ValidationMessage, ValidationReport } from "../../builder/types";
import { GameContext } from "../GameContext";
import { count, QueryContext } from "../conditions/query";
import { collectGroups, EffectiveEntry, rootRefsOf } from "../EntryTree";
import { ForceInstance, RosterState, walkForce } from "../RosterState";
import { rollUpRoster } from "../CostEngine";
import { SelectionInstance } from "../SelectionInstance";

export function validateRoster(
  ctx: GameContext,
  roster: RosterState
): ValidationReport {
  const messages: ValidationMessage[] = [];
  const seen = new Set<string>();

  for (const force of roster.forces) {
    for (const inst of walkForce(force)) {
      for (const c of inst.constraints) {
        const msg = checkConstraint(ctx, roster, force, inst, c);
        if (!msg) continue;
        const key = dedupeKey(msg, c);
        if (seen.has(key)) continue;
        seen.add(key);
        messages.push(msg);
      }
    }
  }

  validateGroups(ctx, roster, messages, seen);
  messages.push(...checkCostLimits(ctx, roster));

  return {
    errors: messages.filter((m) => m.severity === "error"),
    warnings: messages.filter((m) => m.severity === "warning"),
  };
}

function checkConstraint(
  ctx: GameContext,
  roster: RosterState,
  force: ForceInstance,
  inst: SelectionInstance,
  c: Constraint
): ValidationMessage | undefined {
  const type = attrStr(c["@_type"]);
  const field = attrStr(c["@_field"]);
  const scope = attrStr(c["@_scope"]);
  const value = attrNum(c["@_value"]);
  if (value < 0) return undefined; // -1 = "unbegrenzt"

  const isCostField = field !== Field.SELECTIONS && field !== Field.FORCES;
  const qctx: QueryContext = { roster, force, anchor: inst };
  const measured = count(
    {
      field,
      scope,
      childId: isCostField ? "any" : inst.targetId,
      includeChildSelections: attrBool(c["@_includeChildSelections"]),
      shared: attrBool(c["@_shared"], true),
    },
    qctx
  );

  if (type === ConstraintType.MIN && measured < value) {
    return {
      severity: "error",
      instanceId: inst.instanceId,
      forceId: force.id,
      constraintId: c["@_id"],
      scope,
      message: `${inst.name}: mindestens ${value} ${fieldLabel(ctx, field)} erforderlich (${measured}/${value})`,
    };
  }
  if (type === ConstraintType.MAX && measured > value) {
    return {
      severity: "error",
      instanceId: inst.instanceId,
      forceId: force.id,
      constraintId: c["@_id"],
      scope,
      message: `${inst.name}: höchstens ${value} ${fieldLabel(ctx, field)} erlaubt (${measured}/${value})`,
    };
  }
  return undefined;
}

/**
 * Validiert Gruppen-Constraints (z. B. "wähle 5–10 Modelle", "genau 1 Waffe").
 * Gruppen werden nicht instanziiert; gezählt werden die direkten Kinder des
 * besitzenden Kontexts (Force-Wurzel bzw. Instanz), deren entryGroupId zur
 * Gruppe passt. PHASE 1: field=selections (min/max).
 */
function validateGroups(
  ctx: GameContext,
  roster: RosterState,
  messages: ValidationMessage[],
  seen: Set<string>
): void {
  for (const force of roster.forces) {
    const cat = ctx.catalogues.get(force.catalogueId);
    if (cat) {
      checkGroupsAtLevel(
        ctx,
        force,
        undefined,
        force.rootSelections,
        rootRefsOf(cat),
        messages,
        seen
      );
    }
    for (const inst of walkForce(force)) {
      checkGroupsAtLevel(
        ctx,
        force,
        inst,
        inst.children,
        inst.blueprint.childRefs,
        messages,
        seen
      );
    }
  }
}

function checkGroupsAtLevel(
  ctx: GameContext,
  force: ForceInstance,
  parent: SelectionInstance | undefined,
  children: SelectionInstance[],
  refs: EffectiveEntry["childRefs"],
  messages: ValidationMessage[],
  seen: Set<string>
): void {
  const groups = collectGroups(ctx, refs);
  for (const group of groups) {
    const measured = children
      .filter((ch) => ch.entryGroupId === group.id)
      .reduce((acc, ch) => acc + ch.number, 0);

    for (const c of group.constraints) {
      if (attrStr(c["@_field"]) !== Field.SELECTIONS) continue;
      const type = attrStr(c["@_type"]);
      const value = attrNum(c["@_value"]);
      if (value < 0) continue;

      let violation: ValidationMessage | undefined;
      if (type === ConstraintType.MIN && measured < value) {
        violation = {
          severity: "error",
          instanceId: parent?.instanceId,
          forceId: force.id,
          constraintId: c["@_id"],
          scope: attrStr(c["@_scope"]),
          message: `${group.name}: mindestens ${value} Auswahl(en) erforderlich (${measured}/${value})`,
        };
      } else if (type === ConstraintType.MAX && measured > value) {
        violation = {
          severity: "error",
          instanceId: parent?.instanceId,
          forceId: force.id,
          constraintId: c["@_id"],
          scope: attrStr(c["@_scope"]),
          message: `${group.name}: höchstens ${value} Auswahl(en) erlaubt (${measured}/${value})`,
        };
      }
      if (!violation) continue;
      const key = `grp|${force.id}|${parent?.instanceId ?? "root"}|${group.id}|${c["@_id"] ?? type}`;
      if (seen.has(key)) continue;
      seen.add(key);
      messages.push(violation);
    }
  }
}

function checkCostLimits(
  ctx: GameContext,
  roster: RosterState
): ValidationMessage[] {
  const totals = rollUpRoster(roster);
  const out: ValidationMessage[] = [];
  for (const [typeId, limit] of roster.costLimits) {
    if (limit <= 0) continue;
    const total = totals.get(typeId) ?? 0;
    if (total > limit) {
      out.push({
        severity: "error",
        scope: "roster",
        message: `Kostenlimit überschritten: ${ctx.costTypeName(typeId)} ${total}/${limit}`,
      });
    }
  }
  return out;
}

function fieldLabel(ctx: GameContext, field: string): string {
  if (field === Field.SELECTIONS) return "Auswahl(en)";
  if (field === Field.FORCES) return "Force(s)";
  if (field === Field.POINTS) return "Punkte";
  return ctx.costTypeName(field);
}

function dedupeKey(msg: ValidationMessage, c: Constraint): string {
  return [
    msg.forceId,
    c["@_id"] ?? "",
    attrStr(c["@_type"]),
    attrStr(c["@_field"]),
    attrStr(c["@_scope"]),
    // Bei Kosten-/Roster-Scopes instanzunabhängig deduplizieren,
    // sonst je Instanz.
    isScopeInstanceIndependent(attrStr(c["@_scope"])) ? "" : msg.instanceId,
  ].join("|");
}

function isScopeInstanceIndependent(scope: string): boolean {
  return scope === "force" || scope === "roster";
}
