import type { PublicationInit, RawPublication } from "./types";
import { readBoolean } from "./utils";

export class Publication {
  id: string;
  name?: string;
  shortName?: string;
  publicationDate?: string;
  publisher?: string;
  publisherUrl?: string;
  isHidden: boolean;

  constructor(init: PublicationInit) {
    this.id = init.id;
    this.name = init.name;
    this.shortName = init.shortName;
    this.publicationDate = init.publicationDate;
    this.publisher = init.publisher;
    this.publisherUrl = init.publisherUrl;
    this.isHidden = init.isHidden ?? false;
  }

  static fromRaw(raw: RawPublication): Publication {
    return new Publication({
      id: raw["@_id"],
      name: raw["@_name"],
      shortName: raw["@_shortName"],
      publicationDate: raw["@_publicationDate"],
      publisher: raw["@_publisher"],
      publisherUrl: raw["@_publisherUrl"],
      isHidden: readBoolean(raw["@_hidden"]),
    });
  }
}
