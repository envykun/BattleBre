import type {
  Roster as LegacyRoster,
  RosterCategory,
  RosterCharacteristic,
  RosterCost,
  RosterCostLimit,
  RosterForce,
  RosterProfile,
  RosterRule,
  RosterSelection,
  RosterPublication,
  RosterAttribute,
} from "../../models/roster";
import type {
  Category,
  Cost,
  CostLimit,
  Force,
  Profile,
  ProfileAttribute,
  ProfileCharacteristic,
  Publication,
  Roster,
  Rule,
  Selection,
} from "../models/common";

const toEngineCost = (cost: RosterCost): Cost => ({
  name: cost.name,
  typeId: cost.typeId,
  value: cost.value,
  valueText: cost.valueText,
});

const toEngineCostLimit = (limit: RosterCostLimit): CostLimit => ({
  name: limit.name,
  typeId: limit.typeId,
  value: limit.value,
  valueText: limit.valueText,
});

const toEngineRule = (rule: RosterRule): Rule => ({
  id: rule.id,
  name: rule.name,
  description: rule.description,
  isHidden: rule.isHidden,
  page: rule.page,
  publicationId: rule.publicationId,
});

const toEngineCategory = (category: RosterCategory): Category => ({
  id: category.id,
  name: category.name,
  entryId: category.entryId,
  isPrimary: category.isPrimary,
});

const toEngineCharacteristic = (
  characteristic: RosterCharacteristic,
): ProfileCharacteristic => ({
  name: characteristic.name,
  typeId: characteristic.typeId,
  value: characteristic.value,
  isHidden: Boolean(characteristic.isHidden),
});

const toEngineAttribute = (attribute: RosterAttribute): ProfileAttribute => ({
  name: attribute.name,
  typeId: attribute.typeId,
  value: attribute.value,
});

const toEngineProfile = (profile: RosterProfile): Profile => ({
  id: profile.id,
  name: profile.name,
  typeId: profile.typeId,
  typeName: profile.typeName,
  isHidden: profile.isHidden,
  page: profile.page,
  publicationId: profile.publicationId,
  from: profile.from,
  characteristics: profile.characteristics.map(toEngineCharacteristic),
  attributes: profile.attributes.map(toEngineAttribute),
});

const toEngineSelection = (selection: RosterSelection): Selection => ({
  id: selection.id,
  name: selection.name,
  entryGroupId: selection.entryGroupId,
  entryId: selection.entryId,
  number: selection.number,
  numberText: selection.numberText,
  type: selection.type,
  page: selection.page,
  publicationId: selection.publicationId,
  from: selection.from,
  group: selection.group,
  selections: selection.selections.map(toEngineSelection),
  profiles: selection.profiles.map(toEngineProfile),
  categories: selection.categories.map(toEngineCategory),
  rules: selection.rules.map(toEngineRule),
  costs: selection.costs.map(toEngineCost),
});

const toEnginePublication = (publication: RosterPublication): Publication => ({
  id: publication.id,
  name: publication.name,
  shortName: publication.shortName,
  publicationDate: publication.publicationDate,
  publisher: publication.publisher,
  publisherUrl: publication.publisherUrl,
  isHidden: publication.isHidden,
});

const toEngineForce = (force: RosterForce): Force => ({
  id: force.id,
  name: force.name,
  entryId: force.entryId,
  catalogueId: force.catalogueId,
  catalogueName: force.catalogueName,
  catalogueRevision: force.catalogueRevision,
  selections: force.selections.map(toEngineSelection),
  categories: force.categories.map(toEngineCategory),
  publications: force.publications.map(toEnginePublication),
  rules: force.rules.map(toEngineRule),
});

export const toEngineRoster = (roster: LegacyRoster): Roster => ({
  id: roster.id,
  name: roster.name,
  battleScribeVersion: roster.battleScribeVersion,
  generatedBy: roster.generatedBy,
  gameSystemId: roster.gameSystemId,
  gameSystemName: roster.gameSystemName,
  gameSystemRevision: roster.gameSystemRevision,
  xmlns: roster.xmlns,
  costs: roster.costs.map(toEngineCost),
  costLimits: roster.costLimits.map(toEngineCostLimit),
  forces: roster.forces.map(toEngineForce),
  rules: [],
});
