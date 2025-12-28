import type {
  RawAssociation,
  RawCatalogueLink,
  RawCategoryEntry,
  RawCategoryLink,
  RawEntryLink,
  RawForceEntry,
  RawInfoLink,
  RawSelectionEntry,
  RawSelectionEntryGroup,
} from "./types";
import { readBoolean, readNumber, readText, toArray } from "./utils";
import { Cost } from "./costs";
import { Constraint, Modifier, ModifierGroup } from "./modifiers";
import { Profile } from "./profiles";
import { Rule } from "./rules";

export class CategoryEntry {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly comment?: string;
  readonly constraints: Constraint[];
  readonly modifiers: Modifier[];

  constructor(raw: RawCategoryEntry) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class ForceEntry {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly categoryLinks: CategoryLink[];
  readonly constraints: Constraint[];
  readonly forceEntries: ForceEntry[];
  readonly modifiers: Modifier[];

  constructor(raw: RawForceEntry) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new CategoryLink(entry),
    );
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.forceEntries = toArray(raw.forceEntries?.forceEntry).map(
      (entry) => new ForceEntry(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class EntryLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly type?: string;
  readonly isHidden: boolean;
  readonly isCollective: boolean;
  readonly isCollapsible: boolean;
  readonly isFlattened: boolean;
  readonly defaultAmount?: number;
  readonly isImported: boolean;
  readonly sortIndex?: number;
  readonly categoryLinks: CategoryLink[];
  readonly constraints: Constraint[];
  readonly costs: Cost[];
  readonly entryLinks: EntryLink[];
  readonly infoLinks: InfoLink[];
  readonly modifierGroups: ModifierGroup[];
  readonly modifiers: Modifier[];
  readonly profiles: Profile[];

  constructor(raw: RawEntryLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.type = raw["@_type"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.isCollective = readBoolean(raw["@_collective"]);
    this.isCollapsible = readBoolean(raw["@_collapsible"]);
    this.isFlattened = readBoolean(raw["@_flatten"]);
    this.defaultAmount = readNumber(raw["@_defaultAmount"]);
    this.isImported = readBoolean(raw["@_import"]);
    this.sortIndex = readNumber(raw["@_sortIndex"]);
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new CategoryLink(entry),
    );
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.costs = toArray(raw.costs?.cost).map((entry) => new Cost(entry));
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new EntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new InfoLink(entry),
    );
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new ModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new Profile(entry),
    );
  }
}

export class SelectionEntry {
  readonly id: string;
  readonly name?: string;
  readonly type?: string;
  readonly isHidden: boolean;
  readonly isCollective: boolean;
  readonly defaultAmount?: number;
  readonly isImported: boolean;
  readonly sortIndex?: number;
  readonly page?: string;
  readonly publicationId?: string;
  readonly associations: Association[];
  readonly categoryLinks: CategoryLink[];
  readonly comment?: string;
  readonly constraints: Constraint[];
  readonly costs: Cost[];
  readonly entryLinks: EntryLink[];
  readonly infoLinks: InfoLink[];
  readonly modifierGroups: ModifierGroup[];
  readonly modifiers: Modifier[];
  readonly profiles: Profile[];
  readonly rules: Rule[];
  readonly selectionEntries: SelectionEntry[];
  readonly selectionEntryGroups: SelectionEntryGroup[];

  constructor(raw: RawSelectionEntry) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.type = raw["@_type"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.isCollective = readBoolean(raw["@_collective"]);
    this.defaultAmount = readNumber(raw["@_defaultAmount"]);
    this.isImported = readBoolean(raw["@_import"]);
    this.sortIndex = readNumber(raw["@_sortIndex"]);
    this.page = raw["@_page"];
    this.publicationId = raw["@_publicationId"];
    this.associations = toArray(raw.associations?.association).map(
      (entry) => new Association(entry),
    );
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new CategoryLink(entry),
    );
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.costs = toArray(raw.costs?.cost).map((entry) => new Cost(entry));
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new EntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new InfoLink(entry),
    );
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new ModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new Profile(entry),
    );
    this.rules = toArray(raw.rules?.rule).map((entry) => new Rule(entry));
    this.selectionEntries = toArray(raw.selectionEntries?.selectionEntry).map(
      (entry) => new SelectionEntry(entry),
    );
    this.selectionEntryGroups = toArray(
      raw.selectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new SelectionEntryGroup(entry));
  }
}

export class SelectionEntryGroup {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly isCollapsible: boolean;
  readonly isCollective: boolean;
  readonly defaultSelectionEntryId?: string;
  readonly isFlattened: boolean;
  readonly isImported: boolean;
  readonly sortIndex?: number;
  readonly page?: string;
  readonly publicationId?: string;
  readonly categoryLinks: CategoryLink[];
  readonly comment?: string;
  readonly constraints: Constraint[];
  readonly entryLinks: EntryLink[];
  readonly infoLinks: InfoLink[];
  readonly modifiers: Modifier[];
  readonly profiles: Profile[];
  readonly selectionEntries: SelectionEntry[];
  readonly selectionEntryGroups: SelectionEntryGroup[];

  constructor(raw: RawSelectionEntryGroup) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.isCollapsible = readBoolean(raw["@_collapsible"]);
    this.isCollective = readBoolean(raw["@_collective"]);
    this.defaultSelectionEntryId = raw["@_defaultSelectionEntryId"];
    this.isFlattened = readBoolean(raw["@_flatten"]);
    this.isImported = readBoolean(raw["@_import"]);
    this.sortIndex = readNumber(raw["@_sortIndex"]);
    this.page = raw["@_page"];
    this.publicationId = raw["@_publicationId"];
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new CategoryLink(entry),
    );
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new EntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new InfoLink(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new Profile(entry),
    );
    this.selectionEntries = toArray(raw.selectionEntries?.selectionEntry).map(
      (entry) => new SelectionEntry(entry),
    );
    this.selectionEntryGroups = toArray(
      raw.selectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new SelectionEntryGroup(entry));
  }
}

export class InfoLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly type?: string;
  readonly isHidden: boolean;
  readonly modifiers: Modifier[];

  constructor(raw: RawInfoLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.type = raw["@_type"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class CatalogueLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly type?: string;
  readonly importRootEntries?: string;

  constructor(raw: RawCatalogueLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.type = raw["@_type"];
    this.importRootEntries = raw["@_importRootEntries"];
  }
}

export class CategoryLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly isHidden: boolean;
  readonly isPrimary: boolean;
  readonly constraints: Constraint[];
  readonly modifiers: Modifier[];

  constructor(raw: RawCategoryLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.isPrimary = readBoolean(raw["@_primary"]);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new Constraint(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}

export class Association {
  readonly id: string;
  readonly name?: string;
  readonly scope?: string;
  readonly childId?: string;
  readonly min?: number;
  readonly max?: number;

  constructor(raw: RawAssociation) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.scope = raw["@_scope"];
    this.childId = raw["@_childId"];
    this.min = readNumber(raw["@_min"]);
    this.max = readNumber(raw["@_max"]);
  }
}
