/**
 * Typen für die Datenbeschaffung im BSData/catpkg-Format.
 *
 * Zwei Ebenen:
 *  - Gallery-Index (`bsdata.catpkg-gallery.json`): Liste aller Repositories.
 *  - Pro-Repo-Index (`<repo>.catpkg.json`): die einzelnen Daten-Dateien
 *    (GameSystem/Kataloge) eines Repositories samt `revision`.
 *
 * Feldnamen entsprechen 1:1 dem echten catpkg-Format (siehe Test-Fixtures
 * `__tests__/fixtures/*.catpkg.json`). Optionale Felder sind als solche
 * markiert, weil sie in der Praxis fehlen oder `null` sein können.
 */

/** Roh: ein Repository-Eintrag im Gallery-Index. */
export interface GalleryEntry {
  /** Kurzname/Slug des Repos (z. B. "adeptus-titanicus"). */
  name: string;
  description?: string;
  battleScribeVersion?: string;
  /** Aktuelle Release-Version des Repos (z. B. "v9.93.6"). */
  version?: string;
  lastUpdated?: string;
  lastUpdateDescription?: string;
  /** URL zum Pro-Repo-Index (`<repo>.catpkg.json`). */
  repositoryUrl: string;
  /** Gzip-Variante des Pro-Repo-Index. */
  repositoryGzipUrl?: string;
  /** Gebündeltes Repo-Archiv (.bsr). */
  repositoryBsrUrl?: string;
  indexUrl?: string;
  githubUrl?: string;
}

/** Roh: der Gallery-Index. */
export interface GalleryIndex {
  name?: string;
  description?: string;
  battleScribeVersion?: string;
  repositories: GalleryEntry[];
}

/** Typ einer einzelnen Repo-Datei. */
export type RepoFileType = "gamesystem" | "catalogue";

/** Roh: eine Daten-Datei innerhalb eines Repositories. */
export interface RepoFile {
  /** Stabile Id der Datei (z. B. "975a-00f4-df37-b565"). */
  id: string;
  name: string;
  type: RepoFileType;
  /** Monoton steigende Revision; Basis des Versionsvergleichs. */
  revision: number;
  battleScribeVersion?: string;
  /** Direkter Download der (i. d. R. gezippten) Datei (.gstz/.catz). */
  fileUrl: string;
  githubUrl?: string;
  authorName?: string | null;
  /** Hex-SHA256 des unkomprimierten XML (optionaler Integritätscheck). */
  sourceSha256?: string;
}

/** Roh: der Pro-Repo-Index. */
export interface RepoIndex {
  name: string;
  description?: string;
  battleScribeVersion?: string;
  version?: string;
  repositoryUrl?: string;
  githubUrl?: string;
  repositoryFiles: RepoFile[];
}

// --- App-nahe, abgeleitete Typen ---------------------------------------

/** Eine installierbare Quelle (aus einem Repo-Index abgeleitet). */
export interface AvailableSource {
  /** Datei-Id (== `RepoFile.id`). */
  id: string;
  /** Repo-Slug, aus dem die Datei stammt (== `GalleryEntry.name`). */
  repoId: string;
  name: string;
  type: RepoFileType;
  revision: number;
  fileUrl: string;
  sourceSha256?: string;
}

/** Eine lokal installierte Quelle (Manifest-Eintrag). */
export interface InstalledSource {
  id: string;
  repoId: string;
  name: string;
  type: RepoFileType;
  revision: number;
  /** Relativer Dateiname unterhalb des Katalog-Verzeichnisses. */
  fileName: string;
  /** Zeitpunkt der Installation (ms seit Epoch). */
  installedAt: number;
  sourceSha256?: string;
}

/** Ergebnis eines Update-Checks für eine Quelle. */
export interface UpdateInfo {
  /** Die verfügbare (neuere) Version. */
  available: AvailableSource;
  /** Die aktuell installierte Version, falls vorhanden. */
  installed?: InstalledSource;
  /** true = noch nicht installiert; false = Update einer vorhandenen Quelle. */
  isNew: boolean;
}
