import type {
  RawCondition,
  RawConditionGroup,
  RawConstraint,
  RawModifier,
  RawModifierGroup,
  RawRepeat,
} from "./types";
import { readBoolean, readNumber, readText, toArray } from "./utils";

export class Modifier {
  readonly id?: string;
  readonly type?: string;
  readonly field?: string;
  readonly value?: string;
  readonly arg?: string;
  readonly scope?: string;
  readonly position?: string;
  readonly join?: string;
  readonly affects?: string;
  readonly conditionGroups: ConditionGroup[];
  readonly conditions: Condition[];
  readonly repeats: Repeat[];

  constructor(raw: RawModifier) {
    this.id = raw["@_id"];
    this.type = raw["@_type"];
    this.field = raw["@_field"];
    this.value = raw["@_value"];
    this.arg = raw["@_arg"];
    this.scope = raw["@_scope"];
    this.position = raw["@_position"];
    this.join = raw["@_join"];
    this.affects = raw["@_affects"];
    this.conditionGroups = toArray(raw.conditionGroups?.conditionGroup).map(
      (entry) => new ConditionGroup(entry),
    );
    this.conditions = toArray(raw.conditions?.condition).map(
      (entry) => new Condition(entry),
    );
    this.repeats = toArray(raw.repeats?.repeat).map(
      (entry) => new Repeat(entry),
    );
  }
}

export class ModifierGroup {
  readonly type?: string;
  readonly comment?: string;
  readonly conditions: Condition[];
  readonly modifiers: Modifier[];

  constructor(raw: RawModifierGroup) {
    this.type = raw["@_type"];
    this.comment = readText(raw.comment);
    this.conditions = toArray(raw.conditions?.condition).map(
      (entry) => new Condition(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class Condition {
  readonly id?: string;
  readonly type?: string;
  readonly field?: string;
  readonly value?: string;
  readonly scope?: string;
  readonly isShared: boolean;
  readonly includeChildSelections: boolean;
  readonly includeChildForces: boolean;
  readonly childId?: string;
  readonly percentValue?: string;

  constructor(raw: RawCondition) {
    this.id = raw["@_id"];
    this.type = raw["@_type"];
    this.field = raw["@_field"];
    this.value = raw["@_value"];
    this.scope = raw["@_scope"];
    this.isShared = readBoolean(raw["@_shared"]);
    this.includeChildSelections = readBoolean(raw["@_includeChildSelections"]);
    this.includeChildForces = readBoolean(raw["@_includeChildForces"]);
    this.childId = raw["@_childId"];
    this.percentValue = raw["@_percentValue"];
  }
}

export class ConditionGroup {
  readonly type?: string;
  readonly conditionGroups: ConditionGroup[];
  readonly conditions: Condition[];

  constructor(raw: RawConditionGroup) {
    this.type = raw["@_type"];
    this.conditionGroups = toArray(raw.conditionGroups?.conditionGroup).map(
      (entry) => new ConditionGroup(entry),
    );
    this.conditions = toArray(raw.conditions?.condition).map(
      (entry) => new Condition(entry),
    );
  }
}

export class Constraint {
  readonly id?: string;
  readonly type?: string;
  readonly field?: string;
  readonly value?: string;
  readonly scope?: string;
  readonly isShared: boolean;
  readonly includeChildSelections: boolean;
  readonly includeChildForces: boolean;
  readonly percentValue?: string;
  readonly isNegative: boolean;

  constructor(raw: RawConstraint) {
    this.id = raw["@_id"];
    this.type = raw["@_type"];
    this.field = raw["@_field"];
    this.value = raw["@_value"];
    this.scope = raw["@_scope"];
    this.isShared = readBoolean(raw["@_shared"]);
    this.includeChildSelections = readBoolean(raw["@_includeChildSelections"]);
    this.includeChildForces = readBoolean(raw["@_includeChildForces"]);
    this.percentValue = raw["@_percentValue"];
    this.isNegative = readBoolean(raw["@_negative"]);
  }
}

export class Repeat {
  readonly childId?: string;
  readonly field?: string;
  readonly includeChildSelections: boolean;
  readonly repeats?: number;
  readonly roundUp: boolean;
  readonly scope?: string;
  readonly isShared: boolean;
  readonly value?: string;

  constructor(raw: RawRepeat) {
    this.childId = raw["@_childId"];
    this.field = raw["@_field"];
    this.includeChildSelections = readBoolean(raw["@_includeChildSelections"]);
    this.repeats = readNumber(raw["@_repeats"]);
    this.roundUp = readBoolean(raw["@_roundUp"]);
    this.scope = raw["@_scope"];
    this.isShared = readBoolean(raw["@_shared"]);
    this.value = raw["@_value"];
  }
}
