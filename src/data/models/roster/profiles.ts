import type {
  RosterCharacteristicInit,
  RosterProfileInit,
  RosterRawCharacteristic,
  RosterRawProfile,
} from "./types";
import { readBoolean, readText, toArray } from "./utils";

export class RosterCharacteristic {
  name?: string;
  typeId?: string;
  value?: string;
  isHidden: any;

  constructor(init: RosterCharacteristicInit) {
    this.name = init.name;
    this.typeId = init.typeId;
    this.value = init.value;
  }

  static fromRaw(raw: RosterRawCharacteristic): RosterCharacteristic {
    return new RosterCharacteristic({
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      value: readText(raw),
    });
  }
}

export class RosterProfile {
  id: string;
  name?: string;
  typeId?: string;
  typeName?: string;
  isHidden: boolean;
  page?: string;
  publicationId?: string;
  from?: string;
  characteristics: RosterCharacteristic[];

  constructor(init: RosterProfileInit) {
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

  static fromRaw(raw: RosterRawProfile): RosterProfile {
    return new RosterProfile({
      id: raw["@_id"],
      name: raw["@_name"],
      typeId: raw["@_typeId"],
      typeName: raw["@_typeName"],
      isHidden: readBoolean(raw["@_hidden"]),
      page: raw["@_page"],
      publicationId: raw["@_publicationId"],
      from: raw["@_from"],
      characteristics: toArray(raw.characteristics?.characteristic).map(
        (entry) => RosterCharacteristic.fromRaw(entry)
      ),
    });
  }
}
