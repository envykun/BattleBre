export type MaybeArray<T> = T | T[];

export type RawText = string | { "#text"?: string } | undefined;

export type RawRosterData = {
  roster: RawRoster;
};

export type RawRoster = {
  "@_id": string;
  "@_name": string;
  "@_battleScribeVersion"?: string;
  "@_generatedBy"?: string;
  "@_gameSystemId"?: string;
  "@_gameSystemName"?: string;
  "@_gameSystemRevision"?: string;
  "@_xmlns"?: string;
  costs?: RawCosts;
  costLimits?: RawCostLimits;
  forces?: RawForces;
};

export type RawCosts = { cost?: MaybeArray<RawCost> };

export type RawCost = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type RawCostLimits = { costLimit?: MaybeArray<RawCostLimit> };

export type RawCostLimit = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type RawForces = { force?: MaybeArray<RawForce> };

export type RawForce = {
  "@_id": string;
  "@_name"?: string;
  "@_entryId"?: string;
  "@_catalogueId"?: string;
  "@_catalogueName"?: string;
  "@_catalogueRevision"?: string;
  selections?: RawSelections;
  categories?: RawCategories;
  publications?: RawPublications;
  rules?: RawRules;
};

export type RawSelections = { selection?: MaybeArray<RawSelection> };

export type RawSelection = {
  "@_id": string;
  "@_name"?: string;
  "@_entryGroupId"?: string;
  "@_entryId"?: string;
  "@_number"?: string;
  "@_type"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  "@_from"?: string;
  "@_group"?: string;
  selections?: RawSelections;
  profiles?: RawProfiles;
  categories?: RawCategories;
  rules?: RawRules;
  costs?: RawCosts;
};

export type RawCategories = { category?: MaybeArray<RawCategory> };

export type RawCategory = {
  "@_id"?: string;
  "@_name"?: string;
  "@_entryId"?: string;
  "@_primary"?: string;
};

export type RawProfiles = { profile?: MaybeArray<RawProfile> };

export type RawProfile = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  "@_typeId"?: string;
  "@_typeName"?: string;
  "@_from"?: string;
  characteristics?: RawCharacteristics;
};

export type RawCharacteristics = { characteristic?: MaybeArray<RawCharacteristic> };

export type RawCharacteristic = {
  "@_name"?: string;
  "@_typeId"?: string;
  "#text"?: string;
};

export type RawRules = { rule?: MaybeArray<RawRule> };

export type RawRule = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  description?: RawText;
};

export type RawPublications = { publication?: MaybeArray<RawPublication> };

export type RawPublication = {
  "@_id": string;
  "@_name"?: string;
  "@_shortName"?: string;
  "@_publicationDate"?: string;
  "@_publisher"?: string;
  "@_publisherUrl"?: string;
  "@_hidden"?: string;
};

export type CostInit = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type CostLimitInit = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type CategoryInit = {
  id?: string;
  name?: string;
  entryId?: string;
  isPrimary?: boolean;
};

export type PublicationInit = {
  id: string;
  name?: string;
  shortName?: string;
  publicationDate?: string;
  publisher?: string;
  publisherUrl?: string;
  isHidden?: boolean;
};

export type RuleInit = {
  id: string;
  name?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
  description?: string;
};

export type CharacteristicInit = {
  name?: string;
  typeId?: string;
  value?: string;
};

export type ProfileInit = {
  id: string;
  name?: string;
  typeId?: string;
  typeName?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
  from?: string;
  characteristics?: Characteristic[];
};

export type SelectionInit = {
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
  selections?: Selection[];
  profiles?: Profile[];
  categories?: Category[];
  rules?: Rule[];
  costs?: Cost[];
};

export type ForceInit = {
  id: string;
  name?: string;
  entryId?: string;
  catalogueId?: string;
  catalogueName?: string;
  catalogueRevision?: string;
  selections?: Selection[];
  categories?: Category[];
  publications?: Publication[];
  rules?: Rule[];
};

export type RosterInit = {
  id: string;
  name: string;
  battleScribeVersion?: string;
  generatedBy?: string;
  gameSystemId?: string;
  gameSystemName?: string;
  gameSystemRevision?: string;
  xmlns?: string;
  costs?: Cost[];
  costLimits?: CostLimit[];
  forces?: Force[];
};

export type RosterDocument = {
  roster: Roster;
};

export type Roster = import("./roster").Roster;
export type Force = import("./entries").Force;
export type Selection = import("./entries").Selection;
export type Category = import("./entries").Category;
export type Profile = import("./profiles").Profile;
export type Characteristic = import("./profiles").Characteristic;
export type Rule = import("./rules").Rule;
export type Publication = import("./publications").Publication;
export type Cost = import("./costs").Cost;
export type CostLimit = import("./costs").CostLimit;
