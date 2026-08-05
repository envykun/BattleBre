/**
 * DataRepository – Netz-Seite der Datenbeschaffung (kein Dateisystem).
 *
 * Lädt den Gallery-Index und Pro-Repo-Indizes im BSData/catpkg-Format und
 * beschafft einzelne Daten-Dateien (.gstz/.catz bzw. roh .gst/.cat). Das
 * Persistieren übernimmt der `LocalStore`; das Orchestrieren der `UpdateManager`.
 */
import { HttpAdapter } from "../adapters/Http";
import { CatalogueLoader, LoadedData } from "../data/CatalogueLoader";
import { isJsonData, jsonToXml, parseJsonDataObject } from "../data/jsonToRaw";
import { attrNum, attrStr } from "../data/xml";
import {
  AvailableSource,
  GalleryEntry,
  GalleryIndex,
  RepoFileType,
  RepoIndex,
} from "./types";

/** Offizieller BSData-Gallery-Index (alle Community-Repositories). */
export const DEFAULT_GALLERY_URL =
  "https://github.com/BSData/gallery/releases/latest/download/bsdata.catpkg-gallery.json";

/** Ergebnis eines Downloads: geparstes Objekt + roher XML-Text zum Persistieren. */
export interface DownloadedFile {
  loaded: LoadedData;
  /** Kanonischer XML-Text (auch für JSON-Quellen – nach Transformation). */
  xml: string;
  /** Aus der Datei gelesene Metadaten (nützlich, wenn der Index sie nicht kennt). */
  meta?: { type: RepoFileType; name: string; revision: number };
}

export class DataRepository {
  constructor(
    private readonly http: HttpAdapter,
    private readonly loader: CatalogueLoader
  ) {}

  /** Lädt den Gallery-Index (Liste aller Repositories). */
  async fetchGallery(url: string = DEFAULT_GALLERY_URL): Promise<GalleryIndex> {
    const text = await this.http.getText(url);
    const parsed = JSON.parse(text) as GalleryIndex;
    if (!Array.isArray(parsed.repositories)) {
      throw new Error("Gallery-Index enthält kein 'repositories'-Array.");
    }
    return parsed;
  }

  /** Lädt den Pro-Repo-Index eines Gallery-Eintrags. */
  async fetchRepoIndex(entry: GalleryEntry): Promise<RepoIndex> {
    const text = await this.http.getText(entry.repositoryUrl);
    const parsed = JSON.parse(text) as RepoIndex;
    if (!Array.isArray(parsed.repositoryFiles)) {
      throw new Error("Repo-Index enthält kein 'repositoryFiles'-Array.");
    }
    return parsed;
  }

  /** Wandelt einen Repo-Index in installierbare Quellen um. */
  toAvailableSources(entry: GalleryEntry, index: RepoIndex): AvailableSource[] {
    return index.repositoryFiles.map((file) => ({
      id: file.id,
      repoId: entry.name,
      name: file.name,
      type: file.type,
      revision: file.revision,
      fileUrl: file.fileUrl,
      sourceSha256: file.sourceSha256,
    }));
  }

  /**
   * Lädt eine Daten-Datei herunter und parst sie. Erkennt drei Fälle:
   *  - Zip-Archive (.gstz/.catz) → entpacken → XML.
   *  - JSON (neues BSData-Format, z. B. wh40k-11e) → nach XML transformieren.
   *  - rohes .gst/.cat XML → direkt.
   * Persistiert wird immer kanonisches XML (`xml`).
   */
  async downloadFile(fileUrl: string): Promise<DownloadedFile> {
    if (isZipUrl(fileUrl)) {
      const base64 = await this.http.getBase64(fileUrl);
      const xml = await this.loader.unzipToXml(base64);
      return { loaded: this.loader.fromXml(xml), xml };
    }

    const text = await this.http.getText(fileUrl);

    if (isJsonUrl(fileUrl) || isJsonData(text)) {
      const parsed = parseJsonDataObject(text);
      const xml = jsonToXml(text);
      const data = parsed.data as unknown as Record<string, unknown>;
      return {
        loaded: parsed,
        xml,
        meta: {
          type: parsed.kind === "gameSystem" ? "gamesystem" : "catalogue",
          name: attrStr(data["@_name"], "Unbenannt"),
          revision: attrNum(data["@_revision"], 0),
        },
      };
    }

    return { loaded: this.loader.fromXml(text), xml: text };
  }

  /**
   * Listet die Daten-Dateien eines GitHub-Repos im neuen BSData-**JSON**-Format
   * (z. B. `BSData/wh40k-11e`) über die GitHub-Contents-API auf. Solche Repos
   * sind NICHT in der catpkg-Gallery und haben keine Release-Assets – die
   * `.json`-Dateien liegen im Branch (`raw.githubusercontent.com`).
   *
   * Die Revision steht nicht in der API, sondern in jeder Datei; sie wird beim
   * Download nachgezogen (`downloadFile(...).meta.revision`).
   */
  async fetchGithubRepoSources(
    owner: string,
    repo: string,
    branch = "main"
  ): Promise<AvailableSource[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
    const text = await this.http.getText(apiUrl);
    const entries = JSON.parse(text) as Array<{
      name: string;
      type: string;
      download_url: string | null;
    }>;
    if (!Array.isArray(entries)) {
      throw new Error(`Unerwartete Antwort der GitHub-API für ${owner}/${repo}.`);
    }
    return entries
      .filter(
        (e) =>
          e.type === "file" &&
          /\.json$/i.test(e.name) &&
          !/\.catpkg|index|package/i.test(e.name) &&
          e.download_url
      )
      .map((e) => ({
        id: `${owner}/${repo}:${e.name}`,
        repoId: `${owner}/${repo}`,
        name: e.name.replace(/\.json$/i, ""),
        // Vorläufig; echter Typ/Name/Revision kommen aus downloadFile().meta.
        type: /game.?system|\bgst\b/i.test(e.name)
          ? ("gamesystem" as RepoFileType)
          : ("catalogue" as RepoFileType),
        revision: 0,
        fileUrl: e.download_url as string,
      }));
  }
}

/** true für gezippte Daten-Dateien (.gstz/.catz/.zip). */
function isZipUrl(url: string): boolean {
  return /\.(gstz|catz|zip|bsr)(\?|#|$)/i.test(url);
}

/** true für JSON-Daten-URLs. */
function isJsonUrl(url: string): boolean {
  return /\.json(\?|#|$)/i.test(url);
}
