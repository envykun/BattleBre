import type {
  CategoryInit,
  ForceInit,
  RawCategory,
  RawForce,
  RawSelection,
  SelectionInit,
} from "./types";
import { readBoolean, readNumber, toArray } from "./utils";
import { Cost } from "./costs";
import { Profile } from "./profiles";
import { Publication } from "./publications";
import { Rule } from "./rules";

export class Category {
  id?: string;
  name?: string;
  entryId?: string;
  isPrimary: boolean;

  constructor(init: CategoryInit) {
    this.id = init.id;
    this.name = init.name;
    this.entryId = init.entryId;
    this.isPrimary = init.isPrimary ?? false;
  }

  static fromRaw(raw: RawCategory): Category {
    return new Category({
      id: raw["@_id"],
      name: raw["@_name"],
      entryId: raw["@_entryId"],
      isPrimary: readBoolean(raw["@_primary"]),
    });
  }
}

export class Selection {
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
  selections: Selection[];
  profiles: Profile[];
  categories: Category[];
  rules: Rule[];
  costs: Cost[];

  constructor(init: SelectionInit) {
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

  static fromRaw(raw: RawSelection): Selection {
    return new Selection({
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
        Selection.fromRaw(entry),
      ),
      profiles: toArray(raw.profiles?.profile).map((entry) =>
        Profile.fromRaw(entry),
      ),
      categories: toArray(raw.categories?.category).map((entry) =>
        Category.fromRaw(entry),
      ),
      rules: toArray(raw.rules?.rule).map((entry) => Rule.fromRaw(entry)),
      costs: toArray(raw.costs?.cost).map((entry) => Cost.fromRaw(entry)),
    });
  }
}

export class Force {
  id: string;
  name?: string;
  entryId?: string;
  catalogueId?: string;
  catalogueName?: string;
  catalogueRevision?: string;
  selections: Selection[];
  categories: Category[];
  publications: Publication[];
  rules: Rule[];

  constructor(init: ForceInit) {
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

  static fromRaw(raw: RawForce): Force {
    return new Force({
      id: raw["@_id"],
      name: raw["@_name"],
      entryId: raw["@_entryId"],
      catalogueId: raw["@_catalogueId"],
      catalogueName: raw["@_catalogueName"],
      catalogueRevision: raw["@_catalogueRevision"],
      selections: toArray(raw.selections?.selection).map((entry) =>
        Selection.fromRaw(entry),
      ),
      categories: toArray(raw.categories?.category).map((entry) =>
        Category.fromRaw(entry),
      ),
      publications: toArray(raw.publications?.publication).map((entry) =>
        Publication.fromRaw(entry),
      ),
      rules: toArray(raw.rules?.rule).map((entry) => Rule.fromRaw(entry)),
    });
  }
}
