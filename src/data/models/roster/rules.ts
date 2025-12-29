import type { RosterRawRule, RosterRuleInit } from "./types";
import { readBoolean, readText } from "./utils";

export class RosterRule {
  id: string;
  name?: string;
  isHidden: boolean;
  page?: string;
  publicationId?: string;
  description?: string;

  constructor(init: RosterRuleInit) {
    this.id = init.id;
    this.name = init.name;
    this.isHidden = init.isHidden ?? false;
    this.page = init.page;
    this.publicationId = init.publicationId;
    this.description = init.description;
  }

  static fromRaw(raw: RosterRawRule): RosterRule {
    return new RosterRule({
      id: raw["@_id"],
      name: raw["@_name"],
      isHidden: readBoolean(raw["@_hidden"]),
      page: raw["@_page"],
      publicationId: raw["@_publicationId"],
      description: readText(raw.description),
    });
  }
}
