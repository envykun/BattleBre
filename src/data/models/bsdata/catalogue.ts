import type { RawCatalogue } from "./types";
import { readBoolean, toArray } from "./utils";
import {
  CatalogueLink,
  CategoryEntry,
  EntryLink,
  InfoLink,
  SelectionEntry,
  SelectionEntryGroup,
} from "./entries";
import { CostType } from "./costs";
import { Profile, ProfileType } from "./profiles";
import { Publication } from "./publications";
import { Rule } from "./rules";

export class Catalogue {
  readonly id: string;
  readonly name: string;
  readonly revision?: string;
  readonly battleScribeVersion?: string;
  readonly gameSystemId?: string;
  readonly gameSystemRevision?: string;
  readonly isLibrary: boolean;
  readonly type?: string;
  readonly authorName?: string;
  readonly categoryEntries: CategoryEntry[];
  readonly entryLinks: EntryLink[];
  readonly sharedSelectionEntries: SelectionEntry[];
  readonly sharedSelectionEntryGroups: SelectionEntryGroup[];
  readonly sharedProfiles: Profile[];
  readonly publications: Publication[];
  readonly profileTypes: ProfileType[];
  readonly sharedRules: Rule[];
  readonly infoLinks: InfoLink[];
  readonly costTypes: CostType[];
  readonly catalogueLinks: CatalogueLink[];

  constructor(raw: RawCatalogue) {
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
      (entry) => new CategoryEntry(entry),
    );
    this.entryLinks = toArray(raw.entryLinks?.entryLink).map(
      (entry) => new EntryLink(entry),
    );
    this.sharedSelectionEntries = toArray(
      raw.sharedSelectionEntries?.selectionEntry,
    ).map((entry) => new SelectionEntry(entry));
    this.sharedSelectionEntryGroups = toArray(
      raw.sharedSelectionEntryGroups?.selectionEntryGroup,
    ).map((entry) => new SelectionEntryGroup(entry));
    this.sharedProfiles = toArray(raw.sharedProfiles?.profile).map(
      (entry) => new Profile(entry),
    );
    this.publications = toArray(raw.publications?.publication).map(
      (entry) => new Publication(entry),
    );
    this.profileTypes = toArray(raw.profileTypes?.profileType).map(
      (entry) => new ProfileType(entry),
    );
    this.sharedRules = toArray(raw.sharedRules?.rule).map(
      (entry) => new Rule(entry),
    );
    this.infoLinks = toArray(raw.infoLinks?.infoLink).map(
      (entry) => new InfoLink(entry),
    );
    this.costTypes = toArray(raw.costTypes?.costType).map(
      (entry) => new CostType(entry),
    );
    this.catalogueLinks = toArray(raw.catalogueLinks?.catalogueLink).map(
      (entry) => new CatalogueLink(entry),
    );
  }
}
