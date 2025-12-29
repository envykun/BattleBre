import type {
  BSDataRawCharacteristic,
  BSDataRawCharacteristicType,
  BSDataRawProfile,
  BSDataRawProfileType,
} from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { BSDataModifier, BSDataModifierGroup } from "./modifiers";

export class BSDataProfile {
  readonly id: string;
  readonly name?: string;
  readonly typeId?: string;
  readonly typeName?: string;
  readonly page?: string;
  readonly isHidden: boolean;
  readonly characteristics: BSDataCharacteristic[];
  readonly comment?: string;
  readonly modifierGroups: BSDataModifierGroup[];
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawProfile) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.typeName = raw["@_typeName"];
    this.page = raw["@_page"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.characteristics = toArray(raw.characteristics?.characteristic).map(
      (entry) => new BSDataCharacteristic(entry),
    );
    this.comment = readText(raw.comment);
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new BSDataModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataCharacteristic {
  readonly id?: string;
  readonly name?: string;
  readonly typeId?: string;
  readonly isHidden: boolean;
  readonly value?: string;

  constructor(raw: BSDataRawCharacteristic) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.value = readText(raw);
  }
}

export class BSDataProfileType {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly characteristicTypes: BSDataCharacteristicType[];

  constructor(raw: BSDataRawProfileType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.characteristicTypes = toArray(
      raw.characteristicTypes?.characteristicType,
    ).map((entry) => new BSDataCharacteristicType(entry));
  }
}

export class BSDataCharacteristicType {
  readonly id: string;
  readonly name?: string;

  constructor(raw: BSDataRawCharacteristicType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
  }
}
