/**
 * Zentrale fast-xml-parser-Konfiguration für Katalog-Daten.
 *
 * Wichtig: Kind-Listen sind in fast-xml-parser standardmäßig "einzelnes Objekt
 * ODER Array" je nach Anzahl. Über `isArray` erzwingen wir für alle bekannten
 * wiederholbaren Tags immer ein Array – das eliminiert `X | X[]`-Rauschen im
 * gesamten Engine-Code.
 */
import { X2jOptions, XMLBuilder, XMLParser } from "fast-xml-parser";
import { CatalogueFile, GameSystemFile, RawCatalogue, RawGameSystem } from "../types/catalogue";

/** Tags, die immer als Array geparst werden sollen. */
const ARRAY_TAGS = new Set<string>([
  "catalogueLink",
  "publication",
  "costType",
  "profileType",
  "characteristicType",
  "categoryEntry",
  "categoryLink",
  "forceEntry",
  "selectionEntry",
  "selectionEntryGroup",
  "entryLink",
  "constraint",
  "modifier",
  "modifierGroup",
  "condition",
  "conditionGroup",
  "repeat",
  "profile",
  "characteristic",
  "rule",
  "infoLink",
  "cost",
]);

const PARSER_OPTIONS: Partial<X2jOptions> = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  parseAttributeValue: false, // Attribute bleiben Strings; Konvertierung explizit via attr-Helfern.
  isArray: (tagName: string) => ARRAY_TAGS.has(tagName),
};

const BUILDER_OPTIONS = {
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true,
};

const parser = new XMLParser(PARSER_OPTIONS);
const builder = new XMLBuilder(BUILDER_OPTIONS);

/** Parst rohen XML-Text zu einem generischen Objekt. */
export function parseXml<T = unknown>(xml: string): T {
  return parser.parse(xml) as T;
}

/** Serialisiert ein Objekt zurück nach XML (für .rosz-Export). */
export function buildXml(obj: unknown): string {
  return builder.build(obj);
}

/** Erkennt anhand des Wurzel-Tags, ob es sich um ein GameSystem oder Catalogue handelt. */
export function parseDataObject(xml: string): {
  kind: "gameSystem" | "catalogue";
  data: RawGameSystem | RawCatalogue;
} {
  const parsed = parseXml<Partial<GameSystemFile & CatalogueFile>>(xml);
  if (parsed.gameSystem) return { kind: "gameSystem", data: parsed.gameSystem };
  if (parsed.catalogue) return { kind: "catalogue", data: parsed.catalogue };
  throw new Error("Weder <gameSystem> noch <catalogue> im XML gefunden.");
}

// --- Zugriffs-Helfer ---------------------------------------------------------

/**
 * Liest die innere Liste eines Wrapper-Elements aus.
 * Beispiel: `children(entry.selectionEntries, "selectionEntry")`.
 * Toleriert `undefined` (fehlender Wrapper) und Nicht-Array (Sicherheitsnetz).
 */
export function children<T>(wrap: unknown, key: string): T[] {
  if (!wrap || typeof wrap !== "object") return [];
  const value = (wrap as Record<string, unknown>)[key];
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? (value as T[]) : [value as T];
}

/** Attribut → string (mit Default). */
export function attrStr(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

/** Attribut → number (mit Default). Akzeptiert Strings wie "5" / "5.0". */
export function attrNum(value: unknown, fallback = 0): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isNaN(n) ? fallback : n;
}

/** Attribut → boolean. "true" → true, alles andere → false. */
export function attrBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() === "true";
}
