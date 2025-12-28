import type {
  CharacteristicInit,
  ProfileInit,
  RawCharacteristic,
  RawProfile,
} from "./types";
import { readBoolean, readText, toArray } from "./utils";

export class Characteristic {
  name?: string;
  typeId?: string;
  value?: string;

  constructor(init: CharacteristicInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
  }

  static fromRaw(raw: RawCharacteristic): Characteristic {
    return new Characteristic({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readText(raw),
    });
  }
}

export class Profile {
  id: string;
  name?: string;
  typeId?: string;
  typeName?: string;
  isHidden: boolean;
  page?: string;
  publicationId?: string;
  from?: string;
  characteristics: Characteristic[];

  constructor(init: ProfileInit) {
    this.id = init.id;
    this.name = init.name;
    this.typeId = init.typeId;
    this.typeName = init.typeName;
    this.isHidden = init.isHidden ?? false;
    this.page = init.page;
    this.publicationId = init.publicationId;
    this.from = init.from;
    this.characteristics = init.characteristics ?? [];
  }

  static fromRaw(raw: RawProfile): Profile {
    return new Profile({
      id: raw["@_id"],
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      typeName: raw["@_typeName"],
      isHidden: readBoolean(raw["@_hidden"]),
      page: raw["@_page"],
      publicationId: raw["@_publicationId"],
      from: raw["@_from"],
      characteristics: toArray(raw.characteristics?.characteristic).map(
        (entry) => Characteristic.fromRaw(entry),
      ),
    });
  }
}
