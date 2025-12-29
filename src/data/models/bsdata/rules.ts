import type { BSDataRawRule } from "./types";
import { readBoolean, readText, toArray } from "./utils";
import { BSDataModifier } from "./modifiers";

export class BSDataRule {
  readonly id: string;
  readonly name?: string;
  readonly isHidden: boolean;
  readonly page?: string;
  readonly publicationId?: string;
  readonly alias?: string;
  readonly description?: string;
  readonly modifiers: BSDataModifier[];

  constructor(raw: BSDataRawRule) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.isHidden = readBoolean(raw["@_hidden"]);
    this.page = raw["@_page"];
    this.publicationId = raw["@_publicationId"];
    this.alias = readText(raw.alias);
    this.description = readText(raw.description);
    this.modifiers = toArray(raw.modifiers?.modifier).map(
      (entry) => new BSDataModifier(entry),
    );
  }
}
