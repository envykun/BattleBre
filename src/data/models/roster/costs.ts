import type { CostInit, CostLimitInit, RawCost, RawCostLimit } from "./types";
import { readNumber } from "./utils";

export class Cost {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;

  constructor(init: CostInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
    this.valueText = init.valueText;
  }

  static fromRaw(raw: RawCost): Cost {
    return new Cost({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readNumber(raw["@_value"]),
      valueText: raw["@_value"],
    });
  }
}

export class CostLimit {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;

  constructor(init: CostLimitInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
    this.valueText = init.valueText;
  }

  static fromRaw(raw: RawCostLimit): CostLimit {
    return new CostLimit({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readNumber(raw["@_value"]),
      valueText: raw["@_value"],
    });
  }
}
