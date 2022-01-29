export interface Unit {
  id: string;
  name: string;
  type: string;
  keywords: Array<string>;
  detachment: string;
  characteristics: Array<Characteristics>;
  weapons: Array<Weapon>;
  abilities: Array<Ability>;
  rules?: Array<Rule>;
  psychic?: Psychic;
}

export interface Characteristics {
  name: string;
  m: string;
  ws: string;
  bs: string;
  s: string;
  t: string;
  w: string;
  a: string;
  ld: string;
  sv: string;
}

export interface Weapon {
  name: string;
  range: string;
  type: string;
  s: string;
  ap: string;
  d: string;
  ability: string;
  count: string;
}
export interface Ability {
  name: string;
  text: string;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  unit?: string;
}

export interface Psychic {
  name: string;
  cast: string;
  deny: string;
  powers: string;
  other: string;
  psychicPowers: Array<PsychicPower>;
}

export interface PsychicPower {
  name: string;
  warp: string;
  range: string;
  details: string;
}

export interface RosterCosts {
  faction: string;
  points: string;
  cp: string;
  cabal?: string;
}

export interface StratagemData {
  id: string;
  title: string;
  subTitle: string;
  optional: string;
  description: string;
  descriptionEnd: string;
  list: Array<string>;
  cp: string;
  cp2: string;
}

export enum PHASES {
  ALL = "ALL",
  ANY_TIME = "ANY TIME",
  BEFORE_BATTLE = "BEFORE BATTLE",
  DURING_DEPLOYMENT = "DURING DEPLOYMENT",
  START_OF_BR = "START OF BATTLEROUND",
}

export enum PLAYERPHASE {
  COMMAND = "COMMAND PHASE",
  MOVEMENT = "MOVEMENT PHASE",
  PSYCHIC = "PSYCHIC PHASE",
  SHOOTING = "SHOOTING PHASE",
  CHARGE = "CHARGE PHASE",
  FIGHT = "FIGHT PHASE",
  MORALE = "MORALE PHASE",
  CASUALTIES = "TAKING CASUALTIES",
}

export enum ENEMYPHASE {
  COMMAND = "ENEMY COMMAND PHASE",
  MOVEMENT = "ENEMY MOVEMENT PHASE",
  PSYCHIC = "ENEMY PSYCHIC PHASE",
  SHOOTING = "ENEMY SHOOTING PHASE",
  CHARGE = "ENEMY CHARGE PHASE",
  FIGHT = "ENEMY FIGHT PHASE",
  MORALE = "ENEMY MORALE PHASE",
  CASUALTIES = "ENEMY TAKING CASUALTIES",
  TARGET = "BEING TARGETED",
}
