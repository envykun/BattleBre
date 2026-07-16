/**
 * Auswertung von Conditions und ConditionGroups.
 * (Wird ab Phase 2 von der Modifier-Anwendung genutzt; bereits vollständig
 * implementiert auf Basis der Scoped-Query.)
 */
import { attrBool, attrNum, attrStr, children } from "../../data/xml";
import { Condition, ConditionGroup } from "../../types/catalogue";
import { ConditionGroupType, ConditionType } from "../../types/enums";
import { SelectionInstance } from "../SelectionInstance";
import { count, QueryContext } from "./query";

export function evaluateCondition(c: Condition, qctx: QueryContext): boolean {
  const type = attrStr(c["@_type"]);

  if (type === ConditionType.INSTANCE_OF || type === ConditionType.NOT_INSTANCE_OF) {
    const isInstance = anchorHasCategory(qctx.anchor, attrStr(c["@_childId"]));
    return type === ConditionType.INSTANCE_OF ? isInstance : !isInstance;
  }

  const n = count(
    {
      field: attrStr(c["@_field"]),
      scope: attrStr(c["@_scope"]),
      childId: attrStr(c["@_childId"]),
      includeChildSelections: attrBool(c["@_includeChildSelections"]),
      shared: attrBool(c["@_shared"], true),
    },
    qctx
  );
  const value = attrNum(c["@_value"]);

  switch (type) {
    case ConditionType.GREATER_THAN:
      return n > value;
    case ConditionType.LESS_THAN:
      return n < value;
    case ConditionType.AT_LEAST:
      return n >= value;
    case ConditionType.AT_MOST:
      return n <= value;
    case ConditionType.EQUAL_TO:
      return n === value;
    case ConditionType.NOT_EQUAL_TO:
      return n !== value;
    default:
      return true; // unbekannter Typ → nicht blockierend
  }
}

export function evaluateConditionGroup(
  g: ConditionGroup,
  qctx: QueryContext
): boolean {
  const conds = children<Condition>(g.conditions, "condition");
  const groups = children<ConditionGroup>(g.conditionGroups, "conditionGroup");
  const results = [
    ...conds.map((c) => evaluateCondition(c, qctx)),
    ...groups.map((sub) => evaluateConditionGroup(sub, qctx)),
  ];
  if (results.length === 0) return true;
  return attrStr(g["@_type"]) === ConditionGroupType.OR
    ? results.some(Boolean)
    : results.every(Boolean);
}

/**
 * Wertet die kombinierten Conditions/ConditionGroups eines Modifiers aus
 * (UND-Semantik über beide Listen).
 */
export function evaluateAll(
  conditions: Condition[],
  conditionGroups: ConditionGroup[],
  qctx: QueryContext
): boolean {
  const a = conditions.every((c) => evaluateCondition(c, qctx));
  const b = conditionGroups.every((g) => evaluateConditionGroup(g, qctx));
  return a && b;
}

function anchorHasCategory(
  anchor: SelectionInstance | undefined,
  categoryId: string
): boolean {
  if (!anchor) return false;
  return anchor.categories.some((c) => c.id === categoryId);
}
