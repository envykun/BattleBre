export type Cost = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type CostLimit = {
  name: string;
  typeId?: string;
  value?: number;
  valueText?: string;
};

export type Rule = {
  id: string;
  name?: string;
  description?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
};

export type ProfileCharacteristic = {
  name?: string;
  typeId?: string;
  value?: string;
  isHidden?: boolean;
};

export type ProfileAttribute = {
  name?: string;
  typeId?: string;
  value?: string;
};

export type Category = {
  id?: string;
  name?: string;
  entryId?: string;
  isPrimary?: boolean;
};

export type Publication = {
  id: string;
  name?: string;
  shortName?: string;
  publicationDate?: string;
  publisher?: string;
  publisherUrl?: string;
  isHidden?: boolean;
};

export type Profile = {
  id: string;
  name?: string;
  typeId?: string;
  typeName?: string;
  isHidden?: boolean;
  page?: string;
  publicationId?: string;
  from?: string;
  characteristics: ProfileCharacteristic[];
  attributes: ProfileAttribute[];
};

export type Selection = {
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
  costs: Cost[];
  rules: Rule[];
  profiles: Profile[];
  categories: Category[];
  selections: Selection[];
};

export type Force = {
  id: string;
  name?: string;
  entryId?: string;
  catalogueId?: string;
  catalogueName?: string;
  catalogueRevision?: string;
  selections: Selection[];
  categories: Category[];
  publications: Publication[];
  rules: Rule[];
};

export type Roster = {
  id: string;
  name: string;
  battleScribeVersion?: string;
  generatedBy?: string;
  gameSystemId?: string;
  gameSystemName?: string;
  gameSystemRevision?: string;
  xmlns?: string;
  costs: Cost[];
  costLimits: CostLimit[];
  forces: Force[];
  rules: Rule[];
};
