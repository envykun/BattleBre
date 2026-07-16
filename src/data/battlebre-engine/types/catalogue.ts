/**
 * Katalog-Schema der Engine.
 *
 * WICHTIG: Es wird KEIN eigenes Schema mehr definiert. Wir verwenden die
 * Roh-Typen des App-Modells `src/data/models/bsdata` als Single Source of Truth
 * und legen nur dünne Engine-Aliase darüber. Zusätzlich wird jeder Struktur-Knoten
 * mit `EngineWrappers` (alle Kind-Wrapper optional) geschnitten, damit die Engine
 * beim Traversieren jeden potenziell vorhandenen Kind-Wrapper lesen darf – der
 * fast-xml-parser liefert genau die Wrapper, die im XML vorkommen.
 */
import type {
  BSDataRawCatalogue,
  BSDataRawCatalogueLink,
  BSDataRawCategoryEntry,
  BSDataRawCategoryLink,
  BSDataRawCategoryLinks,
  BSDataRawCharacteristic,
  BSDataRawCharacteristicType,
  BSDataRawCondition,
  BSDataRawConditionGroup,
  BSDataRawConditionGroups,
  BSDataRawConditions,
  BSDataRawConstraint,
  BSDataRawConstraints,
  BSDataRawCost,
  BSDataRawCosts,
  BSDataRawCostType,
  BSDataRawEntryLink,
  BSDataRawEntryLinks,
  BSDataRawForceEntries,
  BSDataRawForceEntry,
  BSDataRawGameSystem,
  BSDataRawInfoLink,
  BSDataRawInfoLinks,
  BSDataRawModifier,
  BSDataRawModifierGroup,
  BSDataRawModifierGroups,
  BSDataRawModifiers,
  BSDataRawProfile,
  BSDataRawProfiles,
  BSDataRawProfileType,
  BSDataRawRepeat,
  BSDataRawRepeats,
  BSDataRawRule,
  BSDataRawRules,
  BSDataRawSelectionEntries,
  BSDataRawSelectionEntry,
  BSDataRawSelectionEntryGroup,
  BSDataRawSelectionEntryGroups,
} from "../../models/bsdata";

/**
 * Alle Kind-Wrapper optional – die Engine darf sie an jedem Knoten lesen.
 * (Der Parser liefert nur die tatsächlich vorhandenen; fehlende → undefined.)
 */
export interface EngineWrappers {
  selectionEntries?: BSDataRawSelectionEntries;
  selectionEntryGroups?: BSDataRawSelectionEntryGroups;
  entryLinks?: BSDataRawEntryLinks;
  constraints?: BSDataRawConstraints;
  modifiers?: BSDataRawModifiers;
  modifierGroups?: BSDataRawModifierGroups;
  conditions?: BSDataRawConditions;
  conditionGroups?: BSDataRawConditionGroups;
  repeats?: BSDataRawRepeats;
  costs?: BSDataRawCosts;
  categoryLinks?: BSDataRawCategoryLinks;
  profiles?: BSDataRawProfiles;
  infoLinks?: BSDataRawInfoLinks;
  rules?: BSDataRawRules;
  forceEntries?: BSDataRawForceEntries;
}

export type RawCatalogue = BSDataRawCatalogue & EngineWrappers;
export type RawGameSystem = BSDataRawGameSystem & EngineWrappers;
export type RawDataObject = RawCatalogue | RawGameSystem;

export type SelectionEntry = BSDataRawSelectionEntry & EngineWrappers;
export type SelectionEntryGroup = BSDataRawSelectionEntryGroup & EngineWrappers;
export type EntryLink = BSDataRawEntryLink & EngineWrappers;
export type CategoryEntry = BSDataRawCategoryEntry & EngineWrappers;
export type ForceEntry = BSDataRawForceEntry & EngineWrappers;

export type Constraint = BSDataRawConstraint;
export type Modifier = BSDataRawModifier & EngineWrappers;
export type ModifierGroup = BSDataRawModifierGroup & EngineWrappers;
export type Condition = BSDataRawCondition;
export type ConditionGroup = BSDataRawConditionGroup & EngineWrappers;
export type Repeat = BSDataRawRepeat;

export type CategoryLink = BSDataRawCategoryLink;
export type CatalogueLink = BSDataRawCatalogueLink;
export type Profile = BSDataRawProfile;
export type Characteristic = BSDataRawCharacteristic;
export type Cost = BSDataRawCost;
export type CostType = BSDataRawCostType;
export type ProfileType = BSDataRawProfileType;
export type CharacteristicType = BSDataRawCharacteristicType;
export type Rule = BSDataRawRule;
export type InfoLink = BSDataRawInfoLink;

export type LinkableEntry = SelectionEntry | SelectionEntryGroup;

/** Geparste Datei-Wurzeln (fast-xml-parser). */
export interface GameSystemFile {
  gameSystem: RawGameSystem;
}
export interface CatalogueFile {
  catalogue: RawCatalogue;
}
