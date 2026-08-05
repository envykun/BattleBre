/**
 * Serialisiert ein `Roster`-Anzeigemodell zurück nach BattleScribe-`.ros`-XML.
 *
 * Exakte Umkehrung der `fromRaw`-Deserialisierung (siehe `roster.ts`,
 * `entries.ts`, `costs.ts`, `profiles.ts`): erzeugt ein Objekt mit denselben
 * `@_`-Attribut-Keys und `#text`-Knoten, das der `buildXml`-XMLBuilder
 * (`battlebre-engine/data/xml.ts`, `attributeNamePrefix:"@_"`) in gültiges XML
 * überführt. Das Ergebnis ist mit `parseRoster` wieder ladbar (Roundtrip).
 *
 * Es werden nur gesetzte Attribute und nicht-leere Kind-Listen geschrieben, um
 * kompaktes, dem Import-Format entsprechendes XML zu erzeugen.
 */
// Direktimport des Utility-Moduls (NICHT über den Engine-Barrel): der Barrel
// zieht das Roster-Modell mit, was hier einen zirkulären Import erzeugen würde.
import { buildXml } from "../../battlebre-engine/data/xml";
import { RosterCategory, RosterForce, RosterSelection } from "./entries";
import { RosterCharacteristic, RosterProfile } from "./profiles";
import { RosterCost, RosterCostLimit } from "./costs";
import type { Roster } from "./roster";
import type {
  RosterRawCategory,
  RosterRawCost,
  RosterRawCostLimit,
  RosterRawProfile,
  RosterRawRosterData,
  RosterRawSelection,
} from "./types";

const XML_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>\n';

/** Setzt ein Attribut nur, wenn der Wert definiert (nicht undefined/null) ist. */
function put<T extends object>(obj: T, key: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    (obj as Record<string, unknown>)[key] = value;
  }
}

/** Wickelt eine nicht-leere Liste in `{ <childKey>: items }`, sonst undefined. */
function wrap<T>(items: T[], childKey: string): Record<string, T[]> | undefined {
  return items.length > 0 ? { [childKey]: items } : undefined;
}

function costToRaw(cost: RosterCost): RosterRawCost {
  const raw: RosterRawCost = { "@_name": cost.name };
  put(raw, "@_typeId", cost.typeId);
  put(raw, "@_value", cost.valueText ?? (cost.value !== undefined ? String(cost.value) : undefined));
  return raw;
}

function costLimitToRaw(limit: RosterCostLimit): RosterRawCostLimit {
  const raw: RosterRawCostLimit = { "@_name": limit.name };
  put(raw, "@_typeId", limit.typeId);
  put(raw, "@_value", limit.valueText ?? (limit.value !== undefined ? String(limit.value) : undefined));
  return raw;
}

function categoryToRaw(cat: RosterCategory): RosterRawCategory {
  const raw: RosterRawCategory = {};
  put(raw, "@_id", cat.id);
  put(raw, "@_name", cat.name);
  put(raw, "@_entryId", cat.entryId);
  put(raw, "@_primary", String(cat.isPrimary));
  return raw;
}

function characteristicToRaw(ch: RosterCharacteristic) {
  const raw: Record<string, unknown> = {};
  put(raw, "@_name", ch.name);
  put(raw, "@_typeId", ch.typeId);
  put(raw, "#text", ch.value);
  return raw;
}

function profileToRaw(profile: RosterProfile): RosterRawProfile {
  const raw: RosterRawProfile = { "@_id": profile.id };
  put(raw, "@_name", profile.name);
  put(raw, "@_typeId", profile.typeId);
  put(raw, "@_typeName", profile.typeName);
  put(raw, "@_hidden", String(profile.isHidden));
  put(raw, "@_page", profile.page);
  put(raw, "@_publicationId", profile.publicationId);
  put(raw, "@_from", profile.from);
  const chars = profile.characteristics.map(characteristicToRaw);
  put(raw, "characteristics", wrap(chars, "characteristic"));
  return raw;
}

function selectionToRaw(sel: RosterSelection): RosterRawSelection {
  const raw: RosterRawSelection = { "@_id": sel.id };
  put(raw, "@_name", sel.name);
  put(raw, "@_entryGroupId", sel.entryGroupId);
  put(raw, "@_entryId", sel.entryId);
  put(raw, "@_number", sel.numberText ?? (sel.number !== undefined ? String(sel.number) : undefined));
  put(raw, "@_type", sel.type);
  put(raw, "@_page", sel.page);
  put(raw, "@_publicationId", sel.publicationId);
  put(raw, "@_from", sel.from);
  put(raw, "@_group", sel.group);
  put(raw, "costs", wrap(sel.costs.map(costToRaw), "cost"));
  put(raw, "categories", wrap(sel.categories.map(categoryToRaw), "category"));
  put(raw, "profiles", wrap(sel.profiles.map(profileToRaw), "profile"));
  put(raw, "selections", wrap(sel.selections.map(selectionToRaw), "selection"));
  return raw;
}

function forceToRaw(force: RosterForce) {
  const raw: Record<string, unknown> = { "@_id": force.id };
  put(raw, "@_name", force.name);
  put(raw, "@_entryId", force.entryId);
  put(raw, "@_catalogueId", force.catalogueId);
  put(raw, "@_catalogueName", force.catalogueName);
  put(raw, "@_catalogueRevision", force.catalogueRevision);
  put(raw, "selections", wrap(force.selections.map(selectionToRaw), "selection"));
  put(raw, "categories", wrap(force.categories.map(categoryToRaw), "category"));
  return raw;
}

/** Baut das rohe (parser-kompatible) Objekt eines Rosters. */
export function rosterToRawObject(roster: Roster): RosterRawRosterData {
  const raw: Record<string, unknown> = {
    "@_id": roster.id,
    "@_name": roster.name,
  };
  put(raw, "@_battleScribeVersion", roster.battleScribeVersion);
  put(raw, "@_generatedBy", roster.generatedBy);
  put(raw, "@_gameSystemId", roster.gameSystemId);
  put(raw, "@_gameSystemName", roster.gameSystemName);
  put(raw, "@_gameSystemRevision", roster.gameSystemRevision);
  put(raw, "@_xmlns", roster.xmlns);
  put(raw, "costs", wrap(roster.costs.map(costToRaw), "cost"));
  put(raw, "costLimits", wrap(roster.costLimits.map(costLimitToRaw), "costLimit"));
  put(raw, "forces", wrap(roster.forces.map(forceToRaw), "force"));
  return { roster: raw } as RosterRawRosterData;
}

/** Serialisiert ein Roster in gültigen `.ros`-XML-Text. */
export function serializeRosterToXml(roster: Roster): string {
  return XML_DECLARATION + buildXml(rosterToRawObject(roster));
}
