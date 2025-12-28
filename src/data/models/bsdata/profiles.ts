import type {
  RawCharacteristic,
  RawCharacteristicType,
  RawProfile,
  RawProfileType,
} from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { Modifier, ModifierGroup } from "./modifiers";

export class Profile {
  readonly id: string;
  readonly name?: string;
  readonly typeId?: string;
  readonly typeName?: string;
  readonly page?: string;
  readonly isHidden: boolean;
  readonly characteristics: Characteristic[];
  readonly comment?: string;
  readonly modifierGroups: ModifierGroup[];
  readonly modifiers: Modifier[];

  constructor(raw: RawProfile) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.typeName = raw["@_typeName"];
    this.page = raw["@_page"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.characteristics = toArray(raw.characteristics?.characteristic).map(
      (entry) => new Characteristic(entry),
    );
    this.comment = readText(raw.comment);
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new ModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class Characteristic {
  readonly id?: string;
  readonly name?: string;
  readonly typeId?: string;
  readonly isHidden: boolean;
  readonly value?: string;

  constructor(raw: RawCharacteristic) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.typeId = raw["@_typeId"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.value = readText(raw);
  }
}

export class ProfileType {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly characteristicTypes: CharacteristicType[];

  constructor(raw: RawProfileType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.characteristicTypes = toArray(
      raw.characteristicTypes?.characteristicType,
    ).map((entry) => new CharacteristicType(entry));
  }
}

export class CharacteristicType {
  readonly id: string;
  readonly name?: string;

  constructor(raw: RawCharacteristicType) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
  }
}
