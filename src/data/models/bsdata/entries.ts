import type {
  BSDataRawAssociation,
  BSDataRawCatalogueLink,
  BSDataRawCategoryEntry,
  BSDataRawCategoryLink,
  BSDataRawEntryLink,
  BSDataRawForceEntry,
  BSDataRawInfoLink,
  BSDataRawSelectionEntry,
  BSDataRawSelectionEntryGroup,
} from "./types";
import { readBoolean, readNumber, readText, toArray } from "./utils";
import { BSDataCost } from "./costs";
import { BSDataConstraint, BSDataModifier, BSDataModifierGroup } from "./modifiers";
import { BSDataProfile } from "./profiles";
import { BSDataRule } from "./rules";

export class BSDataCategoryEntry {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly comment?: string;
  readonly constraints: BSDataConstraint[];
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawCategoryEntry) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataForceEntry {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly categoryLinks: BSDataCategoryLink[];
  readonly constraints: BSDataConstraint[];
  readonly forceEntries: BSDataForceEntry[];
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawForceEntry) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new BSDataCategoryLink(entry),
    );
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.forceEntries = toArray(raw.forceEntries?.forceEntry).map(
      (entry) => new BSDataForceEntry(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataEntryLink {
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
  readonly categoryLinks: BSDataCategoryLink[];
  readonly constraints: BSDataConstraint[];
  readonly costs: BSDataCost[];
  readonly entryLinks: BSDataEntryLink[];
  readonly infoLinks: BSDataInfoLink[];
  readonly modifierGroups: BSDataModifierGroup[];
  readonly modifiers: BSDataModifier[];
  readonly profiles: BSDataProfile[];

  constructor(raw: BSDataRawEntryLink) {
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
      (entry) => new BSDataCategoryLink(entry),
    );
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.costs = toArray(raw.costs?.cost).map((entry) => new BSDataCost(entry));
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new BSDataEntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new BSDataInfoLink(entry),
    );
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new BSDataModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new BSDataProfile(entry),
    );
  }
}

export class BSDataSelectionEntry {
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
  readonly associations: BSDataAssociation[];
  readonly categoryLinks: BSDataCategoryLink[];
  readonly comment?: string;
  readonly constraints: BSDataConstraint[];
  readonly costs: BSDataCost[];
  readonly entryLinks: BSDataEntryLink[];
  readonly infoLinks: BSDataInfoLink[];
  readonly modifierGroups: BSDataModifierGroup[];
  readonly modifiers: BSDataModifier[];
  readonly profiles: BSDataProfile[];
  readonly rules: BSDataRule[];
  readonly selectionEntries: BSDataSelectionEntry[];
  readonly selectionEntryGroups: BSDataSelectionEntryGroup[];

  constructor(raw: BSDataRawSelectionEntry) {
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
      (entry) => new BSDataAssociation(entry),
    );
    this.categoryLinks = toArray(raw.categoryLinks?.categoryLink).map(
      (entry) => new BSDataCategoryLink(entry),
    );
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.costs = toArray(raw.costs?.cost).map((entry) => new BSDataCost(entry));
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new BSDataEntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new BSDataInfoLink(entry),
    );
    this.modifierGroups = toArray(raw.modifierGroups?.modifierGroup).map(
      (entry) => new BSDataModifierGroup(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new BSDataProfile(entry),
    );
    this.rules = toArray(raw.rules?.rule).map((entry) => new BSDataRule(entry));
    this.selectionEntries = toArray(raw.selectionEntries?.selectionEntry).map(
      (entry) => new BSDataSelectionEntry(entry),
    );
    this.selectionEntryGroups = toArray(
      raw.selectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new BSDataSelectionEntryGroup(entry));
  }
}

export class BSDataSelectionEntryGroup {
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
  readonly categoryLinks: BSDataCategoryLink[];
  readonly comment?: string;
  readonly constraints: BSDataConstraint[];
  readonly entryLinks: BSDataEntryLink[];
  readonly infoLinks: BSDataInfoLink[];
  readonly modifiers: BSDataModifier[];
  readonly profiles: BSDataProfile[];
  readonly selectionEntries: BSDataSelectionEntry[];
  readonly selectionEntryGroups: BSDataSelectionEntryGroup[];

  constructor(raw: BSDataRawSelectionEntryGroup) {
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
      (entry) => new BSDataCategoryLink(entry),
    );
    this.comment = readText(raw.comment);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new BSDataEntryLink(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new BSDataInfoLink(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
    this.profiles = toArray(raw.profiles?.profile).map(
      (entry) => new BSDataProfile(entry),
    );
    this.selectionEntries = toArray(raw.selectionEntries?.selectionEntry).map(
      (entry) => new BSDataSelectionEntry(entry),
    );
    this.selectionEntryGroups = toArray(
      raw.selectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new BSDataSelectionEntryGroup(entry));
  }
}

export class BSDataInfoLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly type?: string;
  readonly isHidden: boolean;
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawInfoLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.type = raw["@_type"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataCatalogueLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly type?: string;
  readonly importRootEntries?: string;

  constructor(raw: BSDataRawCatalogueLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.type = raw["@_type"];
    this.importRootEntries = raw["@_importRootEntries"];
  }
}

export class BSDataCategoryLink {
  readonly id: string;
  readonly name?: string;
  readonly targetId?: string;
  readonly isHidden: boolean;
  readonly isPrimary: boolean;
  readonly constraints: BSDataConstraint[];
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawCategoryLink) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.targetId = raw["@_targetId"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.isPrimary = readBoolean(raw["@_primary"]);
    this.constraints = toArray(raw.constraints?.constraint).map(
      (entry) => new BSDataConstraint(entry),
    );
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}

export class BSDataAssociation {
  readonly id: string;
  readonly name?: string;
  readonly scope?: string;
  readonly childId?: string;
  readonly min?: number;
  readonly max?: number;

  constructor(raw: BSDataRawAssociation) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.scope = raw["@_scope"];
    this.childId = raw["@_childId"];
    this.min = readNumber(raw["@_min"]);
    this.max = readNumber(raw["@_max"]);
  }
}
