import type { BSDataRawCost, BSDataRawCostType } from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { BSDataModifier } from "./modifiers";

export class BSDataCostType {
  readonly id: string;
  readonly name?: string;
  readonly defaultCostLimit?: string;
  readonly isHidden: boolean;
  readonly comment?: string;
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawCostType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.defaultCostLimit = raw["@_defaultCostLimit"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.comment = readText(raw.comment);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataCost {
  readonly name: string;
  readonly typeId?: string;
  readonly value?: string;

  constructor(raw: BSDataRawCost) {
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.value = raw["@_value"];
  }
}
