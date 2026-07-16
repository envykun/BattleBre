/**
 * LocalStore – Persistenz-Seite der Datenbeschaffung.
 *
 * Legt heruntergeladene GameSystem-/Katalog-XML-Dateien über den
 * `FileSystemAdapter` ab und pflegt ein Manifest (`catalogues.json`) mit den
 * installierten Versionen. Spiegelt das `rosters.json`-Muster der App
 * (`src/hooks/useFetchRosters.ts`).
 */
import { Clock, systemClock } from "../adapters/Clock";
import { FileSystemAdapter } from "../adapters/FileSystem";
import { AvailableSource, InstalledSource } from "./types";

/** Name der Manifest-Datei (relativ zu `fs.baseDir`). */
const MANIFEST_NAME = "catalogues.json";
/** Unterverzeichnis für die eigentlichen Daten-Dateien. */
const DATA_DIR = "catalogues";

interface Manifest {
  sources: InstalledSource[];
}

export class LocalStore {
  constructor(
    private readonly fs: FileSystemAdapter,
    private readonly clock: Clock = systemClock
  ) {}

  private manifestPath(): string {
    return join(this.fs.baseDir, MANIFEST_NAME);
  }

  private dataPath(fileName: string): string {
    return join(this.fs.baseDir, DATA_DIR, fileName);
  }

  /** Liest das Manifest; liefert eine leere Liste, wenn keins existiert. */
  private async readManifest(): Promise<Manifest> {
    if (!(await this.fs.exists(this.manifestPath()))) {
      return { sources: [] };
    }
    const raw = await this.fs.readText(this.manifestPath());
    const parsed = JSON.parse(raw) as Partial<Manifest>;
    return { sources: Array.isArray(parsed.sources) ? parsed.sources : [] };
  }

  private async writeManifest(manifest: Manifest): Promise<void> {
    await this.fs.writeText(this.manifestPath(), JSON.stringify(manifest, null, 2));
  }

  /** Alle installierten Quellen. */
  async listInstalled(): Promise<InstalledSource[]> {
    return (await this.readManifest()).sources;
  }

  /** Installierte Quelle per Id (oder undefined). */
  async getInstalled(id: string): Promise<InstalledSource | undefined> {
    return (await this.readManifest()).sources.find((s) => s.id === id);
  }

  /** Liest den rohen XML-Text einer installierten Quelle. */
  async readXml(id: string): Promise<string> {
    const source = await this.getInstalled(id);
    if (!source) throw new Error(`Keine installierte Quelle mit Id ${id}.`);
    return this.fs.readText(this.dataPath(source.fileName));
  }

  /**
   * Speichert das XML einer Quelle und aktualisiert das Manifest. Ein bereits
   * vorhandener Eintrag gleicher Id wird ersetzt (Update-Fall).
   */
  async save(source: AvailableSource, xml: string): Promise<InstalledSource> {
    const fileName = fileNameFor(source);
    await this.fs.writeText(this.dataPath(fileName), xml);

    const entry: InstalledSource = {
      id: source.id,
      repoId: source.repoId,
      name: source.name,
      type: source.type,
      revision: source.revision,
      fileName,
      installedAt: this.clock.now(),
      sourceSha256: source.sourceSha256,
    };

    const manifest = await this.readManifest();
    const next = manifest.sources.filter((s) => s.id !== source.id);
    next.push(entry);
    await this.writeManifest({ sources: next });
    return entry;
  }
}

/** Stabiler, dateisystemsicherer Dateiname für eine Quelle. */
function fileNameFor(source: AvailableSource): string {
  const ext = source.type === "gamesystem" ? "gst" : "cat";
  return `${source.id}.${ext}`;
}

/** Fügt Pfadsegmente mit "/" zusammen (vermeidet doppelte Slashes). */
function join(...parts: string[]): string {
  return parts
    .map((p, i) => (i === 0 ? p.replace(/\/+$/, "") : p.replace(/^\/+|\/+$/g, "")))
    .filter((p) => p.length > 0)
    .join("/");
}
