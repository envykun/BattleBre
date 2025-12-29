import type { RosterCostInit, RosterCostLimitInit, RosterRawCost, RosterRawCostLimit } from "./types";
import { readNumber } from "./utils";

export class RosterCost {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;

  constructor(init: RosterCostInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
    this.valueText = init.valueText;
  }

  static fromRaw(raw: RosterRawCost): RosterCost {
    return new RosterCost({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readNumber(raw["@_value"]),
      valueText: raw["@_value"],
    });
  }
}

export class RosterCostLimit {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;

  constructor(init: RosterCostLimitInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
    this.valueText = init.valueText;
  }

  static fromRaw(raw: RosterRawCostLimit): RosterCostLimit {
    return new RosterCostLimit({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readNumber(raw["@_value"]),
      valueText: raw["@_value"],
    });
  }
}
