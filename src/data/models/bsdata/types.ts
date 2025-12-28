export type MaybeArray<T> = T | T[];

export type RawText = string | { "#text"?: string } | undefined;

export type RawCatalogueData = {
  catalogue: RawCatalogue;
};

export type RawGameSystemData = {
  gameSystem: RawGameSystem;
};

export type RawCatalogue = {
  "@_id": string;
  "@_name": string;
  "@_revision"?: string;
  "@_battleScribeVersion"?: string;
  "@_gameSystemId"?: string;
  "@_gameSystemRevision"?: string;
  "@_library"?: string;
  "@_type"?: string;
  "@_authorName"?: string;
  categoryEntries?: RawCategoryEntries;
  entryLinks?: RawEntryLinks;
  sharedSelectionEntries?: RawSelectionEntries;
  sharedSelectionEntryGroups?: RawSelectionEntryGroups;
  sharedProfiles?: RawProfiles;
  publications?: RawPublications;
  profileTypes?: RawProfileTypes;
  sharedRules?: RawRules;
  infoLinks?: RawInfoLinks;
  costTypes?: RawCostTypes;
  catalogueLinks?: RawCatalogueLinks;
};

export type RawGameSystem = {
  "@_id": string;
  "@_name": string;
  "@_revision"?: string;
  "@_battleScribeVersion"?: string;
  "@_type"?: string;
  publications?: RawPublications;
  costTypes?: RawCostTypes;
  profileTypes?: RawProfileTypes;
  categoryEntries?: RawCategoryEntries;
  forceEntries?: RawForceEntries;
  entryLinks?: RawEntryLinks;
  sharedSelectionEntries?: RawSelectionEntries;
  sharedSelectionEntryGroups?: RawSelectionEntryGroups;
  sharedRules?: RawRules;
  sharedProfiles?: RawProfiles;
};

export type RawCategoryEntries = { categoryEntry?: MaybeArray<RawCategoryEntry> };

export type RawCategoryEntry = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  comment?: RawText;
  constraints?: RawConstraints;
  modifiers?: RawModifiers;
};

export type RawForceEntries = { forceEntry?: MaybeArray<RawForceEntry> };

export type RawForceEntry = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  categoryLinks?: RawCategoryLinks;
  constraints?: RawConstraints;
  forceEntries?: RawForceEntries;
  modifiers?: RawModifiers;
};

export type RawEntryLinks = { entryLink?: MaybeArray<RawEntryLink> };

export type RawEntryLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_type"?: string;
  "@_hidden"?: string;
  "@_collective"?: string;
  "@_collapsible"?: string;
  "@_flatten"?: string;
  "@_defaultAmount"?: string;
  "@_import"?: string;
  "@_sortIndex"?: string;
  categoryLinks?: RawCategoryLinks;
  constraints?: RawConstraints;
  costs?: RawCosts;
  entryLinks?: RawEntryLinks;
  infoLinks?: RawInfoLinks;
  modifierGroups?: RawModifierGroups;
  modifiers?: RawModifiers;
  profiles?: RawProfiles;
};

export type RawSelectionEntries = { selectionEntry?: MaybeArray<RawSelectionEntry> };

export type RawSelectionEntry = {
  "@_id": string;
  "@_name"?: string;
  "@_type"?: string;
  "@_hidden"?: string;
  "@_collective"?: string;
  "@_defaultAmount"?: string;
  "@_import"?: string;
  "@_sortIndex"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  associations?: RawAssociations;
  categoryLinks?: RawCategoryLinks;
  comment?: RawText;
  constraints?: RawConstraints;
  costs?: RawCosts;
  entryLinks?: RawEntryLinks;
  infoLinks?: RawInfoLinks;
  modifierGroups?: RawModifierGroups;
  modifiers?: RawModifiers;
  profiles?: RawProfiles;
  rules?: RawRules;
  selectionEntries?: RawSelectionEntries;
  selectionEntryGroups?: RawSelectionEntryGroups;
};

export type RawSelectionEntryGroups = {
  selectionEntryGroup?: MaybeArray<RawSelectionEntryGroup>;
};

export type RawSelectionEntryGroup = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_collapsible"?: string;
  "@_collective"?: string;
  "@_defaultSelectionEntryId"?: string;
  "@_flatten"?: string;
  "@_import"?: string;
  "@_sortIndex"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  categoryLinks?: RawCategoryLinks;
  comment?: RawText;
  constraints?: RawConstraints;
  entryLinks?: RawEntryLinks;
  infoLinks?: RawInfoLinks;
  modifiers?: RawModifiers;
  profiles?: RawProfiles;
  selectionEntries?: RawSelectionEntries;
  selectionEntryGroups?: RawSelectionEntryGroups;
};

export type RawProfiles = { profile?: MaybeArray<RawProfile> };

export type RawProfile = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_typeId"?: string;
  "@_typeName"?: string;
  "@_page"?: string;
  characteristics?: RawCharacteristics;
  comment?: RawText;
  modifierGroups?: RawModifierGroups;
  modifiers?: RawModifiers;
};

export type RawCharacteristics = { characteristic?: MaybeArray<RawCharacteristic> };

export type RawCharacteristic = {
  "@_id"?: string;
  "@_name"?: string;
  "@_typeId"?: string;
  "@_hidden"?: string;
  "#text"?: string;
};

export type RawProfileTypes = { profileType?: MaybeArray<RawProfileType> };

export type RawProfileType = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  characteristicTypes?: RawCharacteristicTypes;
};

export type RawCharacteristicTypes = {
  characteristicType?: MaybeArray<RawCharacteristicType>;
};

export type RawCharacteristicType = {
  "@_id": string;
  "@_name"?: string;
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

export type RawCostTypes = { costType?: MaybeArray<RawCostType> };

export type RawCostType = {
  "@_id": string;
  "@_name"?: string;
  "@_defaultCostLimit"?: string;
  "@_hidden"?: string;
  comment?: RawText;
  modifiers?: RawModifiers;
};

export type RawCosts = { cost?: MaybeArray<RawCost> };

export type RawCost = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type RawRules = { rule?: MaybeArray<RawRule> };

export type RawRule = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  alias?: RawText;
  description?: RawText;
  modifiers?: RawModifiers;
};

export type RawModifiers = { modifier?: MaybeArray<RawModifier> };

export type RawModifier = {
  "@_id"?: string;
  "@_type"?: string;
  "@_field"?: string;
  "@_value"?: string;
  "@_arg"?: string;
  "@_scope"?: string;
  "@_position"?: string;
  "@_join"?: string;
  "@_affects"?: string;
  conditionGroups?: RawConditionGroups;
  conditions?: RawConditions;
  repeats?: RawRepeats;
};

export type RawModifierGroups = { modifierGroup?: MaybeArray<RawModifierGroup> };

export type RawModifierGroup = {
  "@_type"?: string;
  comment?: RawText;
  conditions?: RawConditions;
  modifiers?: RawModifiers;
};

export type RawConditions = { condition?: MaybeArray<RawCondition> };

export type RawCondition = {
  "@_id"?: string;
  "@_type"?: string;
  "@_field"?: string;
  "@_value"?: string;
  "@_scope"?: string;
  "@_shared"?: string;
  "@_includeChildSelections"?: string;
  "@_includeChildForces"?: string;
  "@_childId"?: string;
  "@_percentValue"?: string;
};

export type RawConditionGroups = {
  conditionGroup?: MaybeArray<RawConditionGroup>;
};

export type RawConditionGroup = {
  "@_type"?: string;
  conditionGroups?: RawConditionGroups;
  conditions?: RawConditions;
};

export type RawConstraints = { constraint?: MaybeArray<RawConstraint> };

export type RawConstraint = {
  "@_id"?: string;
  "@_type"?: string;
  "@_field"?: string;
  "@_value"?: string;
  "@_scope"?: string;
  "@_shared"?: string;
  "@_includeChildSelections"?: string;
  "@_includeChildForces"?: string;
  "@_percentValue"?: string;
  "@_negative"?: string;
};

export type RawInfoLinks = { infoLink?: MaybeArray<RawInfoLink> };

export type RawInfoLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_type"?: string;
  "@_hidden"?: string;
  modifiers?: RawModifiers;
};

export type RawCatalogueLinks = { catalogueLink?: MaybeArray<RawCatalogueLink> };

export type RawCatalogueLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_type"?: string;
  "@_importRootEntries"?: string;
};

export type RawCategoryLinks = { categoryLink?: MaybeArray<RawCategoryLink> };

export type RawCategoryLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_hidden"?: string;
  "@_primary"?: string;
  constraints?: RawConstraints;
  modifiers?: RawModifiers;
};

export type RawAssociations = { association?: MaybeArray<RawAssociation> };

export type RawAssociation = {
  "@_id": string;
  "@_name"?: string;
  "@_scope"?: string;
  "@_childId"?: string;
  "@_min"?: string;
  "@_max"?: string;
};

export type RawRepeats = { repeat?: MaybeArray<RawRepeat> };

export type RawRepeat = {
  "@_childId"?: string;
  "@_field"?: string;
  "@_includeChildSelections"?: string;
  "@_repeats"?: string;
  "@_roundUp"?: string;
  "@_scope"?: string;
  "@_shared"?: string;
  "@_value"?: string;
};
