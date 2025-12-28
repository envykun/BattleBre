import type { RawGameSystem } from "./types";
import { toArray } from "./utils";
import {
  CategoryEntry,
  EntryLink,
  ForceEntry,
  SelectionEntry,
  SelectionEntryGroup,
} from "./entries";
import { CostType } from "./costs";
import { Profile, ProfileType } from "./profiles";
import { Publication } from "./publications";
import { Rule } from "./rules";

export class GameSystem {
  readonly id: string;
  readonly name: string;
  readonly revision?: string;
  readonly battleScribeVersion?: string;
  readonly type?: string;
  readonly publications: Publication[];
  readonly costTypes: CostType[];
  readonly profileTypes: ProfileType[];
  readonly categoryEntries: CategoryEntry[];
  readonly forceEntries: ForceEntry[];
  readonly entryLinks: EntryLink[];
  readonly sharedSelectionEntries: SelectionEntry[];
  readonly sharedSelectionEntryGroups: SelectionEntryGroup[];
  readonly sharedRules: Rule[];
  readonly sharedProfiles: Profile[];

  constructor(raw: RawGameSystem) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.revision = raw["@_revision"];
    this.battleScribeVersion = raw["@_battleScribeVersion"];
    this.type = raw["@_type"];
    this.publications = toArray(raw.publications?.publication).map(
      (entry) => new Publication(entry),
    );
    this.costTypes = toArray(raw.costTypes?.costType).map(
      (entry) => new CostType(entry),
    );
    this.profileTypes = toArray(raw.profileTypes?.profileType).map(
      (entry) => new ProfileType(entry),
    );
    this.categoryEntries = toArray(raw.categoryEntries?.categoryEntry).map(
      (entry) => new CategoryEntry(entry),
    );
    this.forceEntries = toArray(raw.forceEntries?.forceEntry).map(
      (entry) => new ForceEntry(entry),
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
    this.sharedRules = toArray(raw.sharedRules?.rule).map(
      (entry) => new Rule(entry),
    );
    this.sharedProfiles = toArray(raw.sharedProfiles?.profile).map(
      (entry) => new Profile(entry),
    );
  }
}
