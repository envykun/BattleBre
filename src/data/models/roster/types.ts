export type RosterMaybeArray<T> = T | T[];

export type RosterRawText = string | { "#text"?: string } | undefined;

export type RosterRawRosterData = {
  roster: RosterRawRoster;
};

export type RosterRawRoster = {
  "@_id": string;
  "@_name": string;
  "@_battleScribeVersion"?: string;
  "@_generatedBy"?: string;
  "@_gameSystemId"?: string;
  "@_gameSystemName"?: string;
  "@_gameSystemRevision"?: string;
  "@_xmlns"?: string;
  costs?: RosterRawCosts;
  costLimits?: RosterRawCostLimits;
  forces?: RosterRawForces;
};

export type RosterRawCosts = { cost?: RosterMaybeArray<RosterRawCost> };

export type RosterRawCost = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type RosterRawCostLimits = { costLimit?: RosterMaybeArray<RosterRawCostLimit> };

export type RosterRawCostLimit = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type RosterRawForces = { force?: RosterMaybeArray<RosterRawForce> };

export type RosterRawForce = {
  "@_id": string;
  "@_name"?: string;
  "@_entryId"?: string;
  "@_catalogueId"?: string;
  "@_catalogueName"?: string;
  "@_catalogueRevision"?: string;
  selections?: RosterRawSelections;
  categories?: RosterRawCategories;
  publications?: RosterRawPublications;
  rules?: RosterRawRules;
};

export type RosterRawSelections = { selection?: RosterMaybeArray<RosterRawSelection> };

export type RosterRawSelection = {
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
  selections?: RosterRawSelections;
  profiles?: RosterRawProfiles;
  categories?: RosterRawCategories;
  rules?: RosterRawRules;
  costs?: RosterRawCosts;
};

export type RosterRawCategories = { category?: RosterMaybeArray<RosterRawCategory> };

export type RosterRawCategory = {
  "@_id"?: string;
  "@_name"?: string;
  "@_entryId"?: string;
  "@_primary"?: string;
};

export type RosterRawProfiles = { profile?: RosterMaybeArray<RosterRawProfile> };

export type RosterRawProfile = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  "@_typeId"?: string;
  "@_typeName"?: string;
  "@_from"?: string;
  characteristics?: RosterRawCharacteristics;
};

export type RosterRawCharacteristics = { characteristic?: RosterMaybeArray<RosterRawCharacteristic> };

export type RosterRawCharacteristic = {
  "@_name"?: string;
  "@_typeId"?: string;
  "#text"?: string;
};

export type RosterRawRules = { rule?: RosterMaybeArray<RosterRawRule> };

export type RosterRawRule = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  description?: RosterRawText;
};

export type RosterRawPublications = { publication?: RosterMaybeArray<RosterRawPublication> };

export type RosterRawPublication = {
  "@_id": string;
  "@_name"?: string;
  "@_shortName"?: string;
  "@_publicationDate"?: string;
  "@_publisher"?: string;
  "@_publisherUrl"?: string;
  "@_hidden"?: string;
};

export type RosterCostInit = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type RosterCostLimitInit = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type RosterCategoryInit = {
  id?: string;
  name?: string;
  entryId?: string;
  isPrimary?: boolean;
};

export type RosterPublicationInit = {
  id: string;
  name?: string;
  shortName?: string;
  publicationDate?: string;
  publisher?: string;
  publisherUrl?: string;
  isHidden?: boolean;
};

export type RosterRuleInit = {
  id: string;
  name?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
  description?: string;
};

export type RosterCharacteristicInit = {
  name?: string;
  typeId?: string;
  value?: string;
};

export type RosterProfileInit = {
  id: string;
  name?: string;
  typeId?: string;
  typeName?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
  from?: string;
  characteristics?: RosterCharacteristic[];
};

export type RosterSelectionInit = {
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
  selections?: RosterSelection[];
  profiles?: RosterProfile[];
  categories?: RosterCategory[];
  rules?: RosterRule[];
  costs?: RosterCost[];
};

export type RosterForceInit = {
  id: string;
  name?: string;
  entryId?: string;
  catalogueId?: string;
  catalogueName?: string;
  catalogueRevision?: string;
  selections?: RosterSelection[];
  categories?: RosterCategory[];
  publications?: RosterPublication[];
  rules?: RosterRule[];
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
  costs?: RosterCost[];
  costLimits?: RosterCostLimit[];
  forces?: RosterForce[];
};

export type RosterDocument = {
  roster: Roster;
};

export type Roster = import("./roster").Roster;
export type RosterForce = import("./entries").RosterForce;
export type RosterSelection = import("./entries").RosterSelection;
export type RosterCategory = import("./entries").RosterCategory;
export type RosterProfile = import("./profiles").RosterProfile;
export type RosterCharacteristic = import("./profiles").RosterCharacteristic;
export type RosterRule = import("./rules").RosterRule;
export type RosterPublication = import("./publications").RosterPublication;
export type RosterCost = import("./costs").RosterCost;
export type RosterCostLimit = import("./costs").RosterCostLimit;
