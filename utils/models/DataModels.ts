export interface XmlData {
  "?xml": {};
  roster: BS_Roster;
}

interface BS_RosterInfo {
  "@_id": string;
  "@_name": string;
  "@_battleScribeVersion": string;
  "@_gameSystemId": string;
  "@_gameSystemName": string;
  "@_gameSystemRevision": string;
  "@_xmlns": string;
}

interface BS_ForceInfo {
  "@_id": string;
  "@_name": string;
  "@_entryId": string;
  "@_catalogueId": string;
  "@_catalogueName": string;
  "@_catalogueRevision": string;
}

interface BS_SelectionInfo {
  "@_id": string;
  "@_name": string;
  "@_entryGroupId"?: string;
  "@_entryId": string;
  "@_page"?: string;
  "@_number": string;
  "@_type": SelectionType;
}

interface BS_ProfileInfo {
  "@_id": string;
  "@_name": string;
  "@_hidden": string;
  "@_typeId": string;
  "@_typeName"?: ProfileType;
}

interface BS_Forces {
  force: Array<BS_Force> | BS_Force;
}

export interface BS_Costs {
  cost: Array<BS_Cost> | BS_Cost;
}

interface BS_Rules {
  rule: Array<BS_Rule> | BS_Rule;
}

interface BS_Selections {
  selection: Array<BS_Selection> | BS_Selection;
}

interface BS_Categories {
  category: Array<BS_Category> | BS_Category;
}

interface BS_Publications {
  publication: Array<BS_Publication> | BS_Publication;
}

interface BS_Profiles {
  profile: Array<BS_Profile> | BS_Profile;
}

interface BS_Characteristics {
  characteristic: Array<BS_Characteristic> | BS_Characteristic;
}

export enum CostType {
  PL = "PL",
  CP = "CP",
  PTS = "pts",
  CABAL = "Cabal Points",
}

export enum SelectionType {
  UPGRADE = "upgrade",
  MODEL = "model",
  UNIT = "unit",
}

export enum ProfileType {
  ABILITIES = "Abilities",
  UNIT = "Unit",
  WEAPON = "Weapon",

  PSYCHIC_POWER = "Psychic Power",
  PSYKER = "Psyker",

  TRANSPORT = "Transport",
  EXPLOSION = "Explosion",
  WOUND_TRACK = "Wound Track",
}

export enum UnitCharacteristicType {
  MOVE = "M",
  WEAPON_SKILL = "WS",
  BALISTIC_SKILL = "BS",
  STRENGTH = "S",
  TOUGHNESS = "T",
  WOUNDS = "W",
  ATTACKS = "A",
  LEADERSHIP = "Ld",
  SAVE = "Save",
}

export enum WeaponCharacteristicType {
  RANGE = "Range",
  TYPE = "Type",
  STRENGTH = "S",
  ARMOR_PENETRATION = "AP",
  DAMAGE = "D",
  ABILITIES = "Abilities",
}

enum PsykerCharacteristicType {
  CAST = "Cast",
  DENY = "Deny",
  POWERS_KNOWN = "Powers Known",
  OTHER = "Other",
}

enum PsychicPowerCharacteristicType {
  WARP_CHARGE = "Warp Charge",
  RANGE = "Range",
  DETAILS = "Details",
}

enum WoundTrackCharacteristicType {
  REMAINING_W = "Remaining W",
  CHARACTERISTIC_1 = "Characteristic 1",
  CHARACTERISTIC_2 = "Characteristic 2",
  CHARACTERISTIC_3 = "Characteristic 3",
  CHARACTERISTIC_4 = "Characteristic 4",
  CHARACTERISTIC_5 = "Characteristic 5",
  CHARACTERISTIC_6 = "Characteristic 6",
  CHARACTERISTIC_7 = "Characteristic 7",
  CHARACTERISTIC_8 = "Characteristic 8",
  CHARACTERISTIC_9 = "Characteristic 9",
}

enum ExplosionCharacteristicType {
  DICE_ROLL = "Dice roll",
  DISTANCE = "Distance",
  MORTAL_WOUNDS = "Mortal wounds",
}

export interface BS_Roster extends BS_RosterInfo {
  costs: BS_Costs;
  forces: BS_Forces;
}

export interface BS_Cost {
  "@_name": CostType;
  "@_typeId": string;
  "@_value": string | number;
}

export interface BS_Force extends BS_ForceInfo {
  rules?: BS_Rules;
  selections?: BS_Selections;
  categories?: BS_Categories;
  publications?: BS_Publications;
}

export interface BS_Rule {
  description: string;
  "@_id": string;
  "@_name": string;
  "@_publicationId": string;
  "@_hidden": string;
}

export interface BS_Selection extends BS_SelectionInfo {
  selections?: BS_Selections;
  rules?: BS_Rules;
  profiles?: BS_Profiles;
  categories?: BS_Categories;
  costs?: BS_Costs;
}

export interface BS_Category {
  "@_id": string;
  "@_name": string;
  "@_entryId": string;
  "@_primary": string;
}

export interface BS_Publication {
  "@_id": string;
  "@_name": string;
}

export interface BS_Profile extends BS_ProfileInfo {
  characteristics: BS_Characteristics;
}

export interface BS_Characteristic {
  "#text": string;
  "@_name":
    | "Description"
    | "Capacity"
    | UnitCharacteristicType
    | WeaponCharacteristicType
    | PsykerCharacteristicType
    | PsychicPowerCharacteristicType
    | WoundTrackCharacteristicType
    | ExplosionCharacteristicType;
  "@_typeId": string;
}
