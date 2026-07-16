/**
 * DataRepository – Netz-Seite der Datenbeschaffung (kein Dateisystem).
 *
 * Lädt den Gallery-Index und Pro-Repo-Indizes im BSData/catpkg-Format und
 * beschafft einzelne Daten-Dateien (.gstz/.catz bzw. roh .gst/.cat). Das
 * Persistieren übernimmt der `LocalStore`; das Orchestrieren der `UpdateManager`.
 */
import { HttpAdapter } from "../adapters/Http";
import { CatalogueLoader, LoadedData } from "../data/CatalogueLoader";
import {
  AvailableSource,
  GalleryEntry,
  GalleryIndex,
  RepoFile,
  RepoIndex,
} from "./types";

/** Offizieller BSData-Gallery-Index (alle Community-Repositories). */
export const DEFAULT_GALLERY_URL =
  "https://github.com/BSData/gallery/releases/latest/download/bsdata.catpkg-gallery.json";

/** Ergebnis eines Downloads: geparstes Objekt + roher XML-Text zum Persistieren. */
export interface DownloadedFile {
  loaded: LoadedData;
  xml: string;
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
   * Lädt eine Daten-Datei herunter und parst sie. Zip-Archive (.gstz/.catz)
   * werden entpackt; rohe .gst/.cat werden direkt als Text geladen.
   */
  async downloadFile(fileUrl: string): Promise<DownloadedFile> {
    if (isZipUrl(fileUrl)) {
      const base64 = await this.http.getBase64(fileUrl);
      const xml = await this.loader.unzipToXml(base64);
      return { loaded: this.loader.fromXml(xml), xml };
    }
    const xml = await this.http.getText(fileUrl);
    return { loaded: this.loader.fromXml(xml), xml };
  }
}

/** true für gezippte Daten-Dateien (.gstz/.catz/.zip). */
function isZipUrl(url: string): boolean {
  return /\.(gstz|catz|zip|bsr)(\?|#|$)/i.test(url);
}
