/**
 * Modifier-Anwendung auf eine Instanz. Deckt die häufigsten Modifier ab:
 * Kosten (set/increment/decrement auf costTypeId), Constraint-Werte
 * (set/increment/decrement auf constraintId), name/hidden sowie
 * Kategorie add/remove. `repeat` wird berücksichtigt.
 *
 * Reihenfolge/Fixpunkt orchestriert `Recompute.ts`.
 */
import { attrBool, attrNum, attrStr, children } from "../../data/xml";
import {
  Condition,
  ConditionGroup,
  Modifier,
  ModifierGroup,
  Repeat,
} from "../../types/catalogue";
import { Field, ModifierType } from "../../types/enums";
import { GameContext } from "../GameContext";
import { evaluateAll } from "../conditions/evaluate";
import { count, QueryContext } from "../conditions/query";
import { SelectionInstance } from "../SelectionInstance";

export function applyModifiers(
  ctx: GameContext,
  inst: SelectionInstance,
  qctx: QueryContext
): void {
  for (const mod of inst.blueprint.modifiers) {
    applyModifier(ctx, inst, mod, qctx);
  }
  // ModifierGroups liegen ggf. am Blueprint; hier über die effektiven Gruppen.
  for (const group of inst.blueprint.modifierGroups ?? []) {
    applyModifierGroup(ctx, inst, group, qctx);
  }
}

function applyModifierGroup(
  ctx: GameContext,
  inst: SelectionInstance,
  group: ModifierGroup,
  qctx: QueryContext
): void {
  const conds = children<Condition>(group.conditions, "condition");
  const condGroups = children<ConditionGroup>(group.conditionGroups, "conditionGroup");
  if (!evaluateAll(conds, condGroups, qctx)) return;

  children<Modifier>(group.modifiers, "modifier").forEach((m) =>
    applyModifier(ctx, inst, m, qctx)
  );
  children<ModifierGroup>(group.modifierGroups, "modifierGroup").forEach((g) =>
    applyModifierGroup(ctx, inst, g, qctx)
  );
}

function applyModifier(
  ctx: GameContext,
  inst: SelectionInstance,
  mod: Modifier,
  qctx: QueryContext
): void {
  const conds = children<Condition>(mod.conditions, "condition");
  const condGroups = children<ConditionGroup>(mod.conditionGroups, "conditionGroup");
  if (!evaluateAll(conds, condGroups, qctx)) return;

  const reps = children<Repeat>(mod.repeats, "repeat");
  const times = reps.length === 0 ? 1 : repeatTimes(reps, qctx);
  if (times <= 0) return;

  for (let i = 0; i < times; i++) {
    applyOnce(ctx, inst, mod);
  }
}

function repeatTimes(reps: Repeat[], qctx: QueryContext): number {
  // Mehrere repeats: multiplikativ (selten); i. d. R. genau einer.
  return reps.reduce((acc, r) => acc * singleRepeat(r, qctx), 1);
}

function singleRepeat(r: Repeat, qctx: QueryContext): number {
  const per = attrNum(r["@_repeats"], 1) || 1;
  const measured = count(
    {
      field: attrStr(r["@_field"], Field.SELECTIONS),
      scope: attrStr(r["@_scope"], "force"),
      childId: attrStr(r["@_childId"], "any"),
      includeChildSelections: attrBool(r["@_includeChildSelections"]),
      shared: attrBool(r["@_shared"], true),
    },
    qctx
  );
  const raw = measured / per;
  return attrBool(r["@_roundUp"]) ? Math.ceil(raw) : Math.floor(raw);
}

function applyOnce(ctx: GameContext, inst: SelectionInstance, mod: Modifier): void {
  const type = attrStr(mod["@_type"]);
  const field = attrStr(mod["@_field"]);
  const value = mod["@_value"];

  // Kosten-Modifier
  if (ctx.costTypesById.has(field)) {
    const current = inst.costs.get(field) ?? 0;
    inst.costs.set(field, applyNumeric(type, current, attrNum(value)));
    return;
  }

  // Constraint-Wert-Modifier
  const target = inst.constraints.find((c) => c["@_id"] === field);
  if (target) {
    const current = attrNum(target["@_value"]);
    // Constraint-Werte sind im Rohmodell Strings.
    target["@_value"] = String(applyNumeric(type, current, attrNum(value)));
    return;
  }

  // name / hidden
  if (field === "name" && type === ModifierType.SET) {
    inst.name = attrStr(value, inst.name);
    return;
  }

  // Kategorie add/remove
  if (field === "category") {
    if (type === ModifierType.ADD) {
      const id = attrStr(value);
      const cat = ctx.resolveCategory(id);
      if (cat && !inst.categories.some((c) => c.id === id)) {
        inst.categories.push({ id, name: cat["@_name"] ?? id, primary: false });
      }
    } else if (type === ModifierType.REMOVE) {
      const id = attrStr(value);
      inst.categories = inst.categories.filter((c) => c.id !== id);
    }
    return;
  }
}

function applyNumeric(type: string, current: number, value: number): number {
  switch (type) {
    case ModifierType.SET:
      return value;
    case ModifierType.INCREMENT:
      return current + value;
    case ModifierType.DECREMENT:
      return current - value;
    default:
      return current;
  }
}
