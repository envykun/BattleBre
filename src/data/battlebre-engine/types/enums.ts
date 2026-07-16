/**
 * Enum-artige String-Unions für das BattleScribe-Katalogmodell.
 *
 * Wir verwenden `as const`-Objekte + abgeleitete Typen statt TS-`enum`s,
 * damit der Kern rein datengetrieben bleibt und die Werte 1:1 den XML-Attributen
 * entsprechen. Unbekannte Werte werden bewusst als `string` toleriert
 * (Kataloge nutzen teils systemspezifische Scopes / Felder).
 */

export const ConstraintType = {
  MIN: "min",
  MAX: "max",
} as const;
export type ConstraintType = (typeof ConstraintType)[keyof typeof ConstraintType];

export const ModifierType = {
  SET: "set",
  INCREMENT: "increment",
  DECREMENT: "decrement",
  APPEND: "append",
  PREPEND: "prepend",
  ADD: "add",
  REMOVE: "remove",
  SET_PRIMARY: "set-primary",
  UNSET_PRIMARY: "unset-primary",
} as const;
export type ModifierType = (typeof ModifierType)[keyof typeof ModifierType] | string;

export const ConditionType = {
  EQUAL_TO: "equalTo",
  NOT_EQUAL_TO: "notEqualTo",
  GREATER_THAN: "greaterThan",
  LESS_THAN: "lessThan",
  AT_LEAST: "atLeast",
  AT_MOST: "atMost",
  INSTANCE_OF: "instanceOf",
  NOT_INSTANCE_OF: "notInstanceOf",
} as const;
export type ConditionType = (typeof ConditionType)[keyof typeof ConditionType] | string;

export const ConditionGroupType = {
  AND: "and",
  OR: "or",
} as const;
export type ConditionGroupType = (typeof ConditionGroupType)[keyof typeof ConditionGroupType];

/**
 * Bekannte Scope-Werte. Ein Scope kann darüber hinaus eine beliebige
 * Entry-/Kategorie-Id sein → daher `| string`.
 */
export const Scope = {
  SELF: "self",
  PARENT: "parent",
  ANCESTOR: "ancestor",
  FORCE: "force",
  ROSTER: "roster",
  PRIMARY_CATEGORY: "primary-category",
  PRIMARY_CATALOGUE: "primary-catalogue",
} as const;
export type Scope = (typeof Scope)[keyof typeof Scope] | string;

/**
 * Bekannte Field-Werte. Kann außerdem eine costTypeId oder eine constraintId
 * (bei Modifiers, die eine Constraint verändern) sein → daher `| string`.
 */
export const Field = {
  SELECTIONS: "selections",
  FORCES: "forces",
  POINTS: "points",
} as const;
export type Field = (typeof Field)[keyof typeof Field] | string;

export const SelectionEntryType = {
  UNIT: "unit",
  MODEL: "model",
  UPGRADE: "upgrade",
} as const;
export type SelectionEntryType =
  | (typeof SelectionEntryType)[keyof typeof SelectionEntryType]
  | string;

export const EntryLinkType = {
  SELECTION_ENTRY: "selectionEntry",
  SELECTION_ENTRY_GROUP: "selectionEntryGroup",
} as const;
export type EntryLinkType = (typeof EntryLinkType)[keyof typeof EntryLinkType];

export const InfoLinkType = {
  RULE: "rule",
  PROFILE: "profile",
  INFO_GROUP: "infoGroup",
} as const;
export type InfoLinkType = (typeof InfoLinkType)[keyof typeof InfoLinkType];

export type Severity = "error" | "warning";
