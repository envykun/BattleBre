export type Cost = { name: string; typeId?: string; value: number };

export type Rule = { id?: string; name: string; description?: string };

export type ProfileCharacteristic = {
  name: string;
  typeId?: string;
  value: string;
};

export type Category = { id?: string; name: string; primary?: boolean };

export type Profile = {
  id?: string;
  name: string;
  typeName?: string;
  characteristics: ProfileCharacteristic[];
};

export type Selection = {
  id: string;
  entryId?: string;
  name: string;
  type?: string;
  number?: number;
  costs: Cost[];
  rules: Rule[];
  profiles: Profile[];
  categories: Category[];
  selections: Selection[];
};

export type Force = {
  id: string;
  name: string;
  catalogue?: { id: string; name: string; revision?: string };
  selections: Selection[];
  rules: Rule[];
};

export type Roster = {
  id: string;
  name: string;
  gameSystem?: { id: string; name: string; revision?: string };
  costs: Cost[];
  rules: Rule[];
  forces: Force[];
};
