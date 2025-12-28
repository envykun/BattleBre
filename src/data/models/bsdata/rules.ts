import type { RawRule } from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { Modifier } from "./modifiers";

export class Rule {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly page?: string;
  readonly publicationId?: string;
  readonly alias?: string;
  readonly description?: string;
  readonly modifiers: Modifier[];

  constructor(raw: RawRule) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.page = raw["@_page"];
    this.publicationId = raw["@_publicationId"];
    this.alias = readText(raw.alias);
    this.description = readText(raw.description);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new Modifier(entry),
    );
  }
}
