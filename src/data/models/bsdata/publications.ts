import type { RawPublication } from "./types";
import { readBoolean } from "./utils";

export class Publication {
  readonly id: string;
  readonly name?: string;
  readonly shortName?: string;
  readonly publicationDate?: string;
  readonly publisher?: string;
  readonly publisherUrl?: string;
  readonly isHidden: boolean;

  constructor(raw: RawPublication) {
    this.id = raw["@_id"];
    this.name = raw["@_name"];
    this.shortName = raw["@_shortName"];
    this.publicationDate = raw["@_publicationDate"];
    this.publisher = raw["@_publisher"];
    this.publisherUrl = raw["@_publisherUrl"];
    this.isHidden = readBoolean(raw["@_hidden"]);
  }
}
