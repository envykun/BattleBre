import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { Roster, type RosterRawRosterData } from "../../models/roster";

type ParseRosterOptions = {
  isZip?: boolean;
};

const xmlParser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  textNodeName: "#text",
});

const isXmlPayload = (raw: string) => raw.startsWith("<");

export async function extractRosterXml(
  raw: string,
  options: ParseRosterOptions = {},
): Promise<string> {
  const shouldUnzip = options.isZip ?? !isXmlPayload(raw);

  if (!shouldUnzip) {
    return raw;
  }

  const isBase64 = raw.startsWith("UEs");
  const zip = await JSZip.loadAsync(raw, isBase64 ? { base64: true } : undefined);
  const rosterFile = zip.file(/[^/]+\.ros$/i)?.[0];

  if (!rosterFile) {
    throw new Error("Roster archive does not contain a .ros file.");
  }

  return rosterFile.async("string");
}

export function parseRosterXml(xml: string): RosterRawRosterData {
  return xmlParser.parse(xml) as RosterRawRosterData;
}

export async function parseRoster(
  raw: string,
  options: ParseRosterOptions = {},
): Promise<Roster> {
  const xml = await extractRosterXml(raw, options);
  const parsed = parseRosterXml(xml);

  if (!parsed?.roster) {
    throw new Error("Invalid roster payload.");
  }

  return Roster.fromRaw(parsed.roster);
}
