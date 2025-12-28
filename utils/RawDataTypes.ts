export interface XML2JsonRos {
  '?xml': XMLRos;
  roster: RosterRos;
}

export interface XMLRos {
  '@_version': string;
  '@_encoding': string;
  '@_standalone': string;
}

export interface RosterRos {
  costs?: CostsRos;
  forces: ForcesRos;
  '@_id'?: string;
  '@_name'?: string;
  '@_battleScribeVersion'?: string;
  '@_gameSystemId'?: string;
  '@_gameSystemName'?: string;
  '@_gameSystemRevision'?: string;
}

export interface CostsRos {
  cost: Array<CostRos>;
}

export interface CostRos {
  '@_name': CostNameRos;
  '@_typeId': string;
  '@_value': string;
}

export enum CostNameRos {
  Cp = 'CP',
  Pl = 'PL',
  Pts = 'pts',
  Cabal = 'Cabal Points',
}

export interface ForcesRos {
  force: Array<ForceRos> | ForceRos;
}

export interface ForceRos {
  rules: ForceRulesRos;
  selections?: ForceSelectionsRos;
  categories?: ForceCategoriesRos;
  publications?: PublicationsRos;
  '@_id': string;
  '@_name': string;
  '@_entryId': string;
  '@_catalogueId': string;
  '@_catalogueName': string;
  '@_catalogueRevision': string;
}

export interface ForceRulesRos {
  rule: Array<ForceRuleRos> | ForceRuleRos;
}

export interface ForceRuleRos {
  description?: string;
  '@_id': string;
  '@_name': string;
  '@_publicationId'?: string;
  '@_hidden': string;
  '@_page'?: string;
}

export interface ForceSelectionsRos {}

export interface ForceCategoriesRos {}

export interface PublicationsRos {}
