import type { RawCost, RawCostType } from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { Modifier } from "./modifiers";

export class CostType {
  readonly id: string;
  readonly name?: string;
  readonly defaultCostLimit?: string;
  readonly isHidden: boolean;
  readonly comment?: string;
  readonly modifiers: Modifier[];

  constructor(raw: RawCostType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.defaultCostLimit = raw["@_defaultCostLimit"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.comment = readText(raw.comment);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class Cost {
  readonly name: string;
  readonly typeId?: string;
  readonly value?: string;

  constructor(raw: RawCost) {
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.value = raw["@_value"];
  }
}
