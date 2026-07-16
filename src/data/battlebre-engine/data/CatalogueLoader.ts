/**
 * Lädt rohe Katalog-/GameSystem-Daten aus XML-Text oder gezippten Archiven
 * (.catz/.gstz) in geparste Objekte.
 */
import { ZipAdapter } from "../adapters/Zip";
import { RawCatalogue, RawGameSystem } from "../types/catalogue";
import { parseDataObject } from "./xml";

export interface LoadedData {
  kind: "gameSystem" | "catalogue";
  data: RawGameSystem | RawCatalogue;
}

export class CatalogueLoader {
  constructor(private readonly zip: ZipAdapter) {}

  /** Lädt aus rohem XML-Text (.cat/.gst/.ros). */
  fromXml(xml: string): LoadedData {
    return parseDataObject(xml);
  }

  /** Entpackt ein Archiv (base64: .catz/.gstz) zu rohem XML-Text. */
  async unzipToXml(base64: string): Promise<string> {
    return this.zip.unzipFirst(base64);
  }

  /** Lädt aus einem gezippten Archiv (base64: .catz/.gstz). */
  async fromZipBase64(base64: string): Promise<LoadedData> {
    const xml = await this.unzipToXml(base64);
    return parseDataObject(xml);
  }

  /**
   * Bequemer Entry-Point: erkennt anhand des ersten Zeichens, ob es sich um ein
   * Zip (PK-Magic-Byte "P") oder um rohen XML-Text handelt.
   */
  async fromUnknown(input: string, isBase64Zip: boolean): Promise<LoadedData> {
    if (isBase64Zip) return this.fromZipBase64(input);
    return this.fromXml(input);
  }
}
