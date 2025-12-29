export type BSDataMaybeArray<T> = T | T[];

export type BSDataRawText = string | { "#text"?: string } | undefined;

export type BSDataRawCatalogueData = {
  catalogue: BSDataRawCatalogue;
};

export type BSDataRawGameSystemData = {
  gameSystem: BSDataRawGameSystem;
};

export type BSDataRawCatalogue = {
  "@_id": string;
  "@_name": string;
  "@_revision"?: string;
  "@_battleScribeVersion"?: string;
  "@_gameSystemId"?: string;
  "@_gameSystemRevision"?: string;
  "@_library"?: string;
  "@_type"?: string;
  "@_authorName"?: string;
  categoryEntries?: BSDataRawCategoryEntries;
  entryLinks?: BSDataRawEntryLinks;
  sharedSelectionEntries?: BSDataRawSelectionEntries;
  sharedSelectionEntryGroups?: BSDataRawSelectionEntryGroups;
  sharedProfiles?: BSDataRawProfiles;
  publications?: BSDataRawPublications;
  profileTypes?: BSDataRawProfileTypes;
  sharedRules?: BSDataRawRules;
  infoLinks?: BSDataRawInfoLinks;
  costTypes?: BSDataRawCostTypes;
  catalogueLinks?: BSDataRawCatalogueLinks;
};

export type BSDataRawGameSystem = {
  "@_id": string;
  "@_name": string;
  "@_revision"?: string;
  "@_battleScribeVersion"?: string;
  "@_type"?: string;
  publications?: BSDataRawPublications;
  costTypes?: BSDataRawCostTypes;
  profileTypes?: BSDataRawProfileTypes;
  categoryEntries?: BSDataRawCategoryEntries;
  forceEntries?: BSDataRawForceEntries;
  entryLinks?: BSDataRawEntryLinks;
  sharedSelectionEntries?: BSDataRawSelectionEntries;
  sharedSelectionEntryGroups?: BSDataRawSelectionEntryGroups;
  sharedRules?: BSDataRawRules;
  sharedProfiles?: BSDataRawProfiles;
};

export type BSDataRawCategoryEntries = { categoryEntry?: BSDataMaybeArray<BSDataRawCategoryEntry> };

export type BSDataRawCategoryEntry = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  comment?: BSDataRawText;
  constraints?: BSDataRawConstraints;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawForceEntries = { forceEntry?: BSDataMaybeArray<BSDataRawForceEntry> };

export type BSDataRawForceEntry = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  categoryLinks?: BSDataRawCategoryLinks;
  constraints?: BSDataRawConstraints;
  forceEntries?: BSDataRawForceEntries;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawEntryLinks = { entryLink?: BSDataMaybeArray<BSDataRawEntryLink> };

export type BSDataRawEntryLink = {
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
  categoryLinks?: BSDataRawCategoryLinks;
  constraints?: BSDataRawConstraints;
  costs?: BSDataRawCosts;
  entryLinks?: BSDataRawEntryLinks;
  infoLinks?: BSDataRawInfoLinks;
  modifierGroups?: BSDataRawModifierGroups;
  modifiers?: BSDataRawModifiers;
  profiles?: BSDataRawProfiles;
};

export type BSDataRawSelectionEntries = { selectionEntry?: BSDataMaybeArray<BSDataRawSelectionEntry> };

export type BSDataRawSelectionEntry = {
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
  associations?: BSDataRawAssociations;
  categoryLinks?: BSDataRawCategoryLinks;
  comment?: BSDataRawText;
  constraints?: BSDataRawConstraints;
  costs?: BSDataRawCosts;
  entryLinks?: BSDataRawEntryLinks;
  infoLinks?: BSDataRawInfoLinks;
  modifierGroups?: BSDataRawModifierGroups;
  modifiers?: BSDataRawModifiers;
  profiles?: BSDataRawProfiles;
  rules?: BSDataRawRules;
  selectionEntries?: BSDataRawSelectionEntries;
  selectionEntryGroups?: BSDataRawSelectionEntryGroups;
};

export type BSDataRawSelectionEntryGroups = {
  selectionEntryGroup?: BSDataMaybeArray<BSDataRawSelectionEntryGroup>;
};

export type BSDataRawSelectionEntryGroup = {
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
  categoryLinks?: BSDataRawCategoryLinks;
  comment?: BSDataRawText;
  constraints?: BSDataRawConstraints;
  entryLinks?: BSDataRawEntryLinks;
  infoLinks?: BSDataRawInfoLinks;
  modifiers?: BSDataRawModifiers;
  profiles?: BSDataRawProfiles;
  selectionEntries?: BSDataRawSelectionEntries;
  selectionEntryGroups?: BSDataRawSelectionEntryGroups;
};

export type BSDataRawProfiles = { profile?: BSDataMaybeArray<BSDataRawProfile> };

export type BSDataRawProfile = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_typeId"?: string;
  "@_typeName"?: string;
  "@_page"?: string;
  characteristics?: BSDataRawCharacteristics;
  comment?: BSDataRawText;
  modifierGroups?: BSDataRawModifierGroups;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawCharacteristics = { characteristic?: BSDataMaybeArray<BSDataRawCharacteristic> };

export type BSDataRawCharacteristic = {
  "@_id"?: string;
  "@_name"?: string;
  "@_typeId"?: string;
  "@_hidden"?: string;
  "#text"?: string;
};

export type BSDataRawProfileTypes = { profileType?: BSDataMaybeArray<BSDataRawProfileType> };

export type BSDataRawProfileType = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  characteristicTypes?: BSDataRawCharacteristicTypes;
};

export type BSDataRawCharacteristicTypes = {
  characteristicType?: BSDataMaybeArray<BSDataRawCharacteristicType>;
};

export type BSDataRawCharacteristicType = {
  "@_id": string;
  "@_name"?: string;
};

export type BSDataRawPublications = { publication?: BSDataMaybeArray<BSDataRawPublication> };

export type BSDataRawPublication = {
  "@_id": string;
  "@_name"?: string;
  "@_shortName"?: string;
  "@_publicationDate"?: string;
  "@_publisher"?: string;
  "@_publisherUrl"?: string;
  "@_hidden"?: string;
};

export type BSDataRawCostTypes = { costType?: BSDataMaybeArray<BSDataRawCostType> };

export type BSDataRawCostType = {
  "@_id": string;
  "@_name"?: string;
  "@_defaultCostLimit"?: string;
  "@_hidden"?: string;
  comment?: BSDataRawText;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawCosts = { cost?: BSDataMaybeArray<BSDataRawCost> };

export type BSDataRawCost = {
  "@_name": string;
  "@_typeId"?: string;
  "@_value"?: string;
};

export type BSDataRawRules = { rule?: BSDataMaybeArray<BSDataRawRule> };

export type BSDataRawRule = {
  "@_id": string;
  "@_name"?: string;
  "@_hidden"?: string;
  "@_page"?: string;
  "@_publicationId"?: string;
  alias?: BSDataRawText;
  description?: BSDataRawText;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawModifiers = { modifier?: BSDataMaybeArray<BSDataRawModifier> };

export type BSDataRawModifier = {
  "@_id"?: string;
  "@_type"?: string;
  "@_field"?: string;
  "@_value"?: string;
  "@_arg"?: string;
  "@_scope"?: string;
  "@_position"?: string;
  "@_join"?: string;
  "@_affects"?: string;
  conditionGroups?: BSDataRawConditionGroups;
  conditions?: BSDataRawConditions;
  repeats?: BSDataRawRepeats;
};

export type BSDataRawModifierGroups = { modifierGroup?: BSDataMaybeArray<BSDataRawModifierGroup> };

export type BSDataRawModifierGroup = {
  "@_type"?: string;
  comment?: BSDataRawText;
  conditions?: BSDataRawConditions;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawConditions = { condition?: BSDataMaybeArray<BSDataRawCondition> };

export type BSDataRawCondition = {
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

export type BSDataRawConditionGroups = {
  conditionGroup?: BSDataMaybeArray<BSDataRawConditionGroup>;
};

export type BSDataRawConditionGroup = {
  "@_type"?: string;
  conditionGroups?: BSDataRawConditionGroups;
  conditions?: BSDataRawConditions;
};

export type BSDataRawConstraints = { constraint?: BSDataMaybeArray<BSDataRawConstraint> };

export type BSDataRawConstraint = {
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

export type BSDataRawInfoLinks = { infoLink?: BSDataMaybeArray<BSDataRawInfoLink> };

export type BSDataRawInfoLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_type"?: string;
  "@_hidden"?: string;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawCatalogueLinks = { catalogueLink?: BSDataMaybeArray<BSDataRawCatalogueLink> };

export type BSDataRawCatalogueLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_type"?: string;
  "@_importRootEntries"?: string;
};

export type BSDataRawCategoryLinks = { categoryLink?: BSDataMaybeArray<BSDataRawCategoryLink> };

export type BSDataRawCategoryLink = {
  "@_id": string;
  "@_name"?: string;
  "@_targetId"?: string;
  "@_hidden"?: string;
  "@_primary"?: string;
  constraints?: BSDataRawConstraints;
  modifiers?: BSDataRawModifiers;
};

export type BSDataRawAssociations = { association?: BSDataMaybeArray<BSDataRawAssociation> };

export type BSDataRawAssociation = {
  "@_id": string;
  "@_name"?: string;
  "@_scope"?: string;
  "@_childId"?: string;
  "@_min"?: string;
  "@_max"?: string;
};

export type BSDataRawRepeats = { repeat?: BSDataMaybeArray<BSDataRawRepeat> };

export type BSDataRawRepeat = {
  "@_childId"?: string;
  "@_field"?: string;
  "@_includeChildSelections"?: string;
  "@_repeats"?: string;
  "@_roundUp"?: string;
  "@_scope"?: string;
  "@_shared"?: string;
  "@_value"?: string;
};
