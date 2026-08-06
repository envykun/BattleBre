/**
 * Adapter für das neuere BSData-**JSON**-Datenformat (z. B. wh40k-11e).
 *
 * Das JSON ist strukturell identisch zum klassischen BattleScribe-XML
 * (`categoryEntries`, `forceEntries`, `sharedSelectionEntries`, `constraints`,
 * `modifiers`, `conditions`, `costs`, `profiles`, `characteristics`, …), nur die
 * Syntax unterscheidet sich:
 *   - Attribute sind **plain** (`id`, `name`, `value`) statt fast-xml-parser-`@_`.
 *   - Textinhalt liegt unter **`$text`** statt `#text`.
 *   - echte JSON-Arrays / Booleans / Zahlen statt „Objekt-oder-Array" / Strings.
 *
 * Dieser Transformer bringt einen JSON-Baum in **exakt** die Form, die
 * `parseXml` (fast-xml-parser, `attributeNamePrefix:"@_"`, `parseAttributeValue:
 * false`) erzeugt – damit bleibt der gesamte Engine-Code unverändert nutzbar.
 * Die kanonische Persistenz erfolgt weiter als XML (`jsonToXml`).
 */
import { buildXml, parseDataObject } from "./xml";
import { RawCatalogue, RawGameSystem } from "../types/catalogue";

/** Text-Node-Keys im Quell-JSON, die auf `#text` normalisiert werden. */
const TEXT_KEYS = new Set(["$text", "#text", "_text"]);

/**
 * Abbildung Plural-Listenschlüssel → Singular-Kindname. Das JSON hält Listen als
 * direktes Array unter dem Plural-Key (`forceEntries: [...]`), fast-xml-parser
 * dagegen als Wrapper mit Singular-Kindern (`forceEntries: { forceEntry: [...] }`).
 * Wir bringen jedes bekannte Array in die Wrapper-Form, die der Engine-Code
 * (`children(x, "forceEntry")`) erwartet. Deckt alle in BSData-JSON
 * vorkommenden Listen ab (verifiziert an wh40k-11e).
 */
const LIST_WRAPPERS: Record<string, string> = {
  catalogueLinks: "catalogueLink",
  categoryEntries: "categoryEntry",
  categoryLinks: "categoryLink",
  characteristicTypes: "characteristicType",
  characteristics: "characteristic",
  conditionGroups: "conditionGroup",
  conditions: "condition",
  constraints: "constraint",
  costTypes: "costType",
  costs: "cost",
  entryLinks: "entryLink",
  forceEntries: "forceEntry",
  infoLinks: "infoLink",
  modifierGroups: "modifierGroup",
  modifiers: "modifier",
  profileTypes: "profileType",
  profiles: "profile",
  publications: "publication",
  repeats: "repeat",
  rules: "rule",
  selectionEntries: "selectionEntry",
  selectionEntryGroups: "selectionEntryGroup",
  // shared-* Listen tragen im XML denselben Wrapper/Singular wie ihre nicht-
  // geteilten Pendants (der Engine-Code liest z. B. sharedSelectionEntries mit
  // Singular "selectionEntry").
  sharedProfiles: "profile",
  sharedRules: "rule",
  sharedSelectionEntries: "selectionEntry",
  sharedSelectionEntryGroups: "selectionEntryGroup",
  sharedInfoGroups: "infoGroup",
  infoGroups: "infoGroup",
};

/**
 * Transformiert einen JSON-Wert rekursiv in die fast-xml-parser-Form:
 *  - Objekte: Skalar-Properties → `@_<key>` (als String); Kind-Objekte/-Arrays
 *    rekursiv unter ihrem Key; Text-Keys → `#text`.
 *  - Arrays: elementweise transformiert.
 *  - Skalare: unverändert zurück (Aufrufer entscheidet über Attribut-Prefix).
 */
export function jsonToRawObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => jsonToRawObject(item));
  }
  if (value === null || typeof value !== "object") {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (val === undefined) continue;
    if (TEXT_KEYS.has(key)) {
      out["#text"] = typeof val === "string" ? val : String(val);
    } else if (val === null) {
      // Nullwerte weglassen (entsprechen fehlenden Attributen).
      continue;
    } else if (Array.isArray(val)) {
      const items = val.map((item) => jsonToRawObject(item));
      const singular = LIST_WRAPPERS[key];
      // Bekannte Listen in die fast-xml-parser-Wrapper-Form bringen
      // (`{ <singular>: [...] }`); unbekannte Arrays unverändert lassen.
      out[key] = singular ? { [singular]: items } : items;
    } else if (typeof val === "object") {
      out[key] = jsonToRawObject(val);
    } else {
      // Skalar → Attribut, als String (wie parseAttributeValue:false liefert).
      out["@_" + key] = String(val);
    }
  }
  return out;
}

/**
 * Parst einen JSON-Datentext (GameSystem oder Catalogue) in dieselbe
 * `{ kind, data }`-Form wie `parseDataObject` für XML.
 */
export function parseJsonDataObject(jsonText: string): {
  kind: "gameSystem" | "catalogue";
  data: RawGameSystem | RawCatalogue;
} {
  const parsed = JSON.parse(jsonText) as Record<string, unknown>;
  if (parsed.gameSystem) {
    return {
      kind: "gameSystem",
      data: jsonToRawObject(parsed.gameSystem) as RawGameSystem,
    };
  }
  if (parsed.catalogue) {
    return {
      kind: "catalogue",
      data: jsonToRawObject(parsed.catalogue) as RawCatalogue,
    };
  }
  throw new Error("Weder 'gameSystem' noch 'catalogue' im JSON gefunden.");
}

/**
 * Wandelt einen JSON-Datentext in kanonisches XML um (für die Persistenz über
 * denselben Pfad wie XML-Repos). Das Ergebnis ist mit `parseDataObject` /
 * `BattleBreBuilderEngine.fromXml` wieder ladbar.
 */
export function jsonToXml(jsonText: string): string {
  const { kind, data } = parseJsonDataObject(jsonText);
  const root = kind === "gameSystem" ? "gameSystem" : "catalogue";
  return '<?xml version="1.0" encoding="utf-8"?>\n' + buildXml({ [root]: data });
}

/** Erkennt, ob ein Text JSON (statt XML) ist – simple, robuste Heuristik. */
export function isJsonData(text: string): boolean {
  return text.trimStart().startsWith("{");
}

// Re-Export, damit Aufrufer XML/JSON einheitlich behandeln können.
export { parseDataObject };
