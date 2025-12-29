import type {
  RosterCategoryInit,
  RosterForceInit,
  RosterRawCategory,
  RosterRawForce,
  RosterRawSelection,
  RosterSelectionInit,
} from "./types";
import { readBoolean, readNumber, toArray } from "./utils";
import { RosterCost } from "./costs";
import { RosterProfile } from "./profiles";
import { RosterPublication } from "./publications";
import { RosterRule } from "./rules";

export class RosterCategory {
  id?: string;
  name?: string;
  entryId?: string;
  isPrimary: boolean;

  constructor(init: RosterCategoryInit) {
    this.id = init.id;
    this.name = init.name;
    this.entryId = init.entryId;
    this.isPrimary = init.isPrimary ?? false;
  }

  static fromRaw(raw: RosterRawCategory): RosterCategory {
    return new RosterCategory({
      id: raw["@_id"],
      name: raw["@_name"],
      entryId: raw["@_entryId"],
      isPrimary: readBoolean(raw["@_primary"]),
    });
  }
}

export class RosterSelection {
  id: string;
  name?: string;
  entryGroupId?: string;
  entryId?: string;
  number?: number;
  numberText?: string;
  type?: string;
  page?: string;
  publicationId?: string;
  from?: string;
  group?: string;
  selections: RosterSelection[];
  profiles: RosterProfile[];
  categories: RosterCategory[];
  rules: RosterRule[];
  costs: RosterCost[];

  constructor(init: RosterSelectionInit) {
    this.id = init.id;
    this.name = init.name;
    this.entryGroupId = init.entryGroupId;
    this.entryId = init.entryId;
    this.number = init.number;
    this.numberText = init.numberText;
    this.type = init.type;
    this.page = init.page;
    this.publicationId = init.publicationId;
    this.from = init.from;
    this.group = init.group;
    this.selections = init.selections ?? [];
    this.profiles = init.profiles ?? [];
    this.categories = init.categories ?? [];
    this.rules = init.rules ?? [];
    this.costs = init.costs ?? [];
  }

  static fromRaw(raw: RosterRawSelection): RosterSelection {
    return new RosterSelection({
      id: raw["@_id"],
      name: raw["@_name"],
      entryGroupId: raw["@_entryGroupId"],
      entryId: raw["@_entryId"],
      number: readNumber(raw["@_number"]),
      numberText: raw["@_number"],
      type: raw["@_type"],
      page: raw["@_page"],
      publicationId: raw["@_publicationId"],
      from: raw["@_from"],
      group: raw["@_group"],
      selections: toArray(raw.selections?.selection).map((entry) =>
        RosterSelection.fromRaw(entry),
      ),
      profiles: toArray(raw.profiles?.profile).map((entry) =>
        RosterProfile.fromRaw(entry),
      ),
      categories: toArray(raw.categories?.category).map((entry) =>
        RosterCategory.fromRaw(entry),
      ),
      rules: toArray(raw.rules?.rule).map((entry) => RosterRule.fromRaw(entry)),
      costs: toArray(raw.costs?.cost).map((entry) => RosterCost.fromRaw(entry)),
    });
  }
}

export class RosterForce {
  id: string;
  name?: string;
  entryId?: string;
  catalogueId?: string;
  catalogueName?: string;
  catalogueRevision?: string;
  selections: RosterSelection[];
  categories: RosterCategory[];
  publications: RosterPublication[];
  rules: RosterRule[];

  constructor(init: RosterForceInit) {
    this.id = init.id;
    this.name = init.name;
    this.entryId = init.entryId;
    this.catalogueId = init.catalogueId;
    this.catalogueName = init.catalogueName;
    this.catalogueRevision = init.catalogueRevision;
    this.selections = init.selections ?? [];
    this.categories = init.categories ?? [];
    this.publications = init.publications ?? [];
    this.rules = init.rules ?? [];
  }

  static fromRaw(raw: RosterRawForce): RosterForce {
    return new RosterForce({
      id: raw["@_id"],
      name: raw["@_name"],
      entryId: raw["@_entryId"],
      catalogueId: raw["@_catalogueId"],
      catalogueName: raw["@_catalogueName"],
      catalogueRevision: raw["@_catalogueRevision"],
      selections: toArray(raw.selections?.selection).map((entry) =>
        RosterSelection.fromRaw(entry),
      ),
      categories: toArray(raw.categories?.category).map((entry) =>
        RosterCategory.fromRaw(entry),
      ),
      publications: toArray(raw.publications?.publication).map((entry) =>
        RosterPublication.fromRaw(entry),
      ),
      rules: toArray(raw.rules?.rule).map((entry) => RosterRule.fromRaw(entry)),
    });
  }
}
