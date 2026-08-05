import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { BattleBreEngine } from "../index";
import {
  jsonToRawObject,
  jsonToXml,
  parseJsonDataObject,
} from "../data/jsonToRaw";
import { parseDataObject } from "../data/xml";

const fixtures = path.join(__dirname, "fixtures");
const gsJson = fs.readFileSync(path.join(fixtures, "mini-json.gst.json"), "utf8");
const catJson = fs.readFileSync(path.join(fixtures, "mini-json.cat.json"), "utf8");

describe("jsonToRaw – JSON→fast-xml-parser-Form", () => {
  test("Skalare werden zu @_-String-Attributen", () => {
    const raw = jsonToRawObject({ id: "x", value: 90, hidden: false }) as Record<
      string,
      unknown
    >;
    expect(raw["@_id"]).toBe("x");
    expect(raw["@_value"]).toBe("90"); // Zahl → String
    expect(raw["@_hidden"]).toBe("false"); // Boolean → String
  });

  test("$text wird zu #text normalisiert", () => {
    const raw = jsonToRawObject({ name: "M", $text: '12"' }) as Record<
      string,
      unknown
    >;
    expect(raw["@_name"]).toBe("M");
    expect(raw["#text"]).toBe('12"');
  });

  test("bekannte Listen werden in Wrapper-Form gebracht (costs → {cost:[…]})", () => {
    const raw = jsonToRawObject({
      costs: [{ name: "pts", value: 5 }],
    }) as any;
    expect(Array.isArray(raw.costs.cost)).toBe(true);
    expect(raw.costs.cost[0]["@_name"]).toBe("pts");
    expect(raw.costs.cost[0]["@_value"]).toBe("5");
  });

  test("parseJsonDataObject erkennt gameSystem/catalogue", () => {
    expect(parseJsonDataObject(gsJson).kind).toBe("gameSystem");
    expect(parseJsonDataObject(catJson).kind).toBe("catalogue");
  });

  test("jsonToXml erzeugt XML, das parseDataObject wieder liest", () => {
    const gsXml = jsonToXml(gsJson);
    expect(gsXml.startsWith("<?xml")).toBe(true);
    const parsed = parseDataObject(gsXml);
    expect(parsed.kind).toBe("gameSystem");
    expect((parsed.data as any)["@_name"]).toBe("Mini JSON System");
  });
});

describe("jsonToRaw – End-to-End mit der Engine", () => {
  test("JSON-Daten → Engine baut Roster mit echten Einheiten/Kosten", () => {
    const gsXml = jsonToXml(gsJson);
    const catXml = jsonToXml(catJson);

    const engine = BattleBreEngine.fromXml(gsXml, [catXml]);
    engine.createRoster({ name: "JSON Test" });

    const force = engine.listForceEntries()[0];
    expect(force).toBeTruthy();
    expect(force.name).toBe("Patrol Detachment");

    const forceId = engine.addForce(force.forceEntryId, force.catalogueId);
    const addable = engine.getAddableEntries(forceId);
    const warlord = addable.find((a) => a.name === "Warlord");
    expect(warlord).toBeTruthy();
    expect(warlord!.costs.find((c) => c.typeId === "pts")!.value).toBe(90);

    engine.addSelection(forceId, warlord!.id);
    const roster = engine.toRoster();
    expect(roster.costs.find((c) => c.typeId === "pts")!.value).toBe(90);
    const wl = roster.forces[0].selections.find((s) => s.name === "Warlord")!;
    expect(wl.profiles.some((p) => p.typeName === "Unit")).toBe(true);
  });
});
