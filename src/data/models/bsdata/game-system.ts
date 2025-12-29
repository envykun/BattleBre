import type { BSDataRawGameSystem } from "./types";
import { toArray } from "./utils";
import {
  BSDataCategoryEntry,
  BSDataEntryLink,
  BSDataForceEntry,
  BSDataSelectionEntry,
  BSDataSelectionEntryGroup,
} from "./entries";
import { BSDataCostType } from "./costs";
import { BSDataProfile, BSDataProfileType } from "./profiles";
import { BSDataPublication } from "./publications";
import { BSDataRule } from "./rules";

export class BSDataGameSystem {
  readonly id: string;
  readonly name: string;
  readonly revision?: string;
  readonly battleScribeVersion?: string;
  readonly type?: string;
  readonly publications: BSDataPublication[];
  readonly costTypes: BSDataCostType[];
  readonly profileTypes: BSDataProfileType[];
  readonly categoryEntries: BSDataCategoryEntry[];
  readonly forceEntries: BSDataForceEntry[];
  readonly entryLinks: BSDataEntryLink[];
  readonly sharedSelectionEntries: BSDataSelectionEntry[];
  readonly sharedSelectionEntryGroups: BSDataSelectionEntryGroup[];
  readonly sharedRules: BSDataRule[];
  readonly sharedProfiles: BSDataProfile[];

  constructor(raw: BSDataRawGameSystem) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.revision = raw["@_revision"];
    this.battleScribeVersion = raw["@_battleScribeVersion"];
    this.type = raw["@_type"];
    this.publications = toArray(raw.publications?.publication).map(
      (entry) => new BSDataPublication(entry),
    );
    this.costTypes = toArray(raw.costTypes?.costType).map(
      (entry) => new BSDataCostType(entry),
    );
    this.profileTypes = toArray(raw.profileTypes?.profileType).map(
      (entry) => new BSDataProfileType(entry),
    );
    this.categoryEntries = toArray(raw.categoryEntries?.categoryEntry).map(
      (entry) => new BSDataCategoryEntry(entry),
    );
    this.forceEntries = toArray(raw.forceEntries?.forceEntry).map(
      (entry) => new BSDataForceEntry(entry),
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
    this.sharedRules = toArray(raw.sharedRules?.rule).map(
      (entry) => new BSDataRule(entry),
    );
    this.sharedProfiles = toArray(raw.sharedProfiles?.profile).map(
      (entry) => new BSDataProfile(entry),
    );
  }
}
