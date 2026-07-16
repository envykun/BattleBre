/**
 * Id-Typen. Bewusst simple String-Aliase (keine Branded Types), damit die
 * Interop mit dem fast-xml-parser-Output (reine Strings) reibungslos bleibt.
 * Die Namen dokumentieren die Bedeutung an den API-Grenzen.
 */

/** Id einer selectionEntry / selectionEntryGroup / entryLink im Katalog. */
export type EntryId = string;

/** Ziel-Id eines entryLink / infoLink / categoryLink / catalogueLink. */
export type TargetId = string;

/** Id eines costType (z. B. "points", "CP"). */
export type CostTypeId = string;

/** Id eines profileType. */
export type ProfileTypeId = string;

/** Id eines characteristicType. */
export type CharacteristicTypeId = string;

/** Id eines categoryEntry. */
export type CategoryId = string;

/** Id eines forceEntry. */
export type ForceEntryId = string;

/** Id eines Catalogue bzw. GameSystem. */
export type CatalogueId = string;

/** Roster-eindeutige Id einer Laufzeit-Selection-Instanz. */
export type InstanceId = string;

/** Roster-eindeutige Id einer Force-Instanz. */
export type ForceId = string;

/** Id eines Rosters. */
export type RosterId = string;
