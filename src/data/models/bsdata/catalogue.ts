import type { BSDataRawCatalogue } from "./types";
import { readBoolean, toArray } from "./utils";
import {
  BSDataCatalogueLink,
  BSDataCategoryEntry,
  BSDataEntryLink,
  BSDataInfoLink,
  BSDataSelectionEntry,
  BSDataSelectionEntryGroup,
} from "./entries";
import { BSDataCostType } from "./costs";
import { BSDataProfile, BSDataProfileType } from "./profiles";
import { BSDataPublication } from "./publications";
import { BSDataRule } from "./rules";

export class BSDataCatalogue {
  readonly id: string;
  readonly name: string;
  readonly revision?: string;
  readonly battleScribeVersion?: string;
  readonly gameSystemId?: string;
  readonly gameSystemRevision?: string;
  readonly isLibrary: boolean;
  readonly type?: string;
  readonly authorName?: string;
  readonly categoryEntries: BSDataCategoryEntry[];
  readonly entryLinks: BSDataEntryLink[];
  readonly sharedSelectionEntries: BSDataSelectionEntry[];
  readonly sharedSelectionEntryGroups: BSDataSelectionEntryGroup[];
  readonly sharedProfiles: BSDataProfile[];
  readonly publications: BSDataPublication[];
  readonly profileTypes: BSDataProfileType[];
  readonly sharedRules: BSDataRule[];
  readonly infoLinks: BSDataInfoLink[];
  readonly costTypes: BSDataCostType[];
  readonly catalogueLinks: BSDataCatalogueLink[];

  constructor(raw: BSDataRawCatalogue) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.revision = raw["@_revision"];
    this.battleScribeVersion = raw["@_battleScribeVersion"];
    this.gameSystemId = raw["@_gameSystemId"];
    this.gameSystemRevision = raw["@_gameSystemRevision"];
    this.isLibrary = readBoolean(raw["@_library"]);
    this.type = raw["@_type"];
    this.authorName = raw["@_authorName"];
    this.categoryEntries = toArray(raw.categoryEntries?.categoryEntry).map(
      (entry) => new BSDataCategoryEntry(entry),
    );
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new BSDataEntryLink(entry),
    );
    this.sharedSelectionEntries = toArray(
      raw.sharedSelectionEntries?.selectionEntry,
    ).map((entry) => new BSDataSelectionEntry(entry));
    this.sharedSelectionEntryGroups = toArray(
      raw.sharedSelectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new BSDataSelectionEntryGroup(entry));
    this.sharedProfiles = toArray(raw.sharedProfiles?.profile).map(
      (entry) => new BSDataProfile(entry),
    );
    this.publications = toArray(raw.publications?.publication).map(
      (entry) => new BSDataPublication(entry),
    );
    this.profileTypes = toArray(raw.profileTypes?.profileType).map(
      (entry) => new BSDataProfileType(entry),
    );
    this.sharedRules = toArray(raw.sharedRules?.rule).map(
      (entry) => new BSDataRule(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new BSDataInfoLink(entry),
    );
    this.costTypes = toArray(raw.costTypes?.costType).map(
      (entry) => new BSDataCostType(entry),
    );
    this.catalogueLinks = toArray(raw.catalogueLinks?.catalogueLink).map(
      (entry) => new BSDataCatalogueLink(entry),
    );
  }
}
