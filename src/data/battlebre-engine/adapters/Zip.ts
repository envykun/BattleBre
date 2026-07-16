/**
 * Zip-Adapter zum Ent-/Packen von .catz/.gstz/.rosz. Default-Impl kapselt jszip
 * (RN-sicher). Als Adapter gehalten, damit der Kern testbar bleibt.
 */
import JSZip from "jszip";

export interface ZipAdapter {
  /**
   * Entpackt ein Archiv (base64) und gibt den Textinhalt der ersten Datei
   * zurück, deren Name auf `pattern` passt (Default: erste .xml/.cat/.gst/.ros).
   */
  unzipFirst(base64: string, pattern?: RegExp): Promise<string>;
  /** Packt einen einzelnen Text-Eintrag in ein Zip und liefert base64. */
  zipSingle(entryName: string, content: string): Promise<string>;
}

const DEFAULT_PATTERN = /[^/]+\.(xml|cat|gst|ros|catz|gstz)$/i;

export class JsZipAdapter implements ZipAdapter {
  async unzipFirst(base64: string, pattern: RegExp = DEFAULT_PATTERN): Promise<string> {
    const zip = await new JSZip().loadAsync(base64, { base64: true });
    const matches = zip.file(pattern);
    if (!matches || matches.length === 0) {
      throw new Error("Keine passende Datei im Archiv gefunden.");
    }
    return matches[0].async("string");
  }

  async zipSingle(entryName: string, content: string): Promise<string> {
    const zip = new JSZip();
    zip.file(entryName, content);
    return zip.generateAsync({ type: "base64", compression: "DEFLATE" });
  }
}
