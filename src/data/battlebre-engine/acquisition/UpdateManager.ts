/**
 * UpdateManager – orchestriert Beschaffung + Persistenz + Versionsvergleich.
 *
 * Verbindet `DataRepository` (Netz) und `LocalStore` (Persistenz) und emittiert
 * den `UpdateEvent`-Kontrakt aus `adapters/events.ts`, den die RN-Schicht
 * abonniert (z. B. fürs Update-Modal).
 */
import {
  UpdateListener,
  UpdateNotifier,
  createUpdateNotifier,
} from "../adapters/events";
import { DataRepository } from "./DataRepository";
import { LocalStore } from "./LocalStore";
import { AvailableSource, GalleryEntry, InstalledSource, UpdateInfo } from "./types";

export class UpdateManager {
  constructor(
    private readonly repo: DataRepository,
    private readonly store: LocalStore,
    private readonly notifier: UpdateNotifier = createUpdateNotifier()
  ) {}

  /** Abonniert Update-Events. Gibt eine Unsubscribe-Funktion zurück. */
  subscribe(listener: UpdateListener): () => void {
    return this.notifier.subscribe(listener);
  }

  /**
   * Vergleicht die Quellen eines Repos gegen die lokal installierten Versionen.
   * Liefert neue und aktualisierbare Quellen; emittiert `updates-available`.
   */
  async checkForUpdates(entry: GalleryEntry): Promise<UpdateInfo[]> {
    try {
      const index = await this.repo.fetchRepoIndex(entry);
      const available = this.repo.toAvailableSources(entry, index);
      const installed = await this.store.listInstalled();
      const byId = new Map<string, InstalledSource>(
        installed.map((s) => [s.id, s])
      );

      const updates: UpdateInfo[] = [];
      for (const source of available) {
        const current = byId.get(source.id);
        if (!current) {
          updates.push({ available: source, isNew: true });
        } else if (source.revision > current.revision) {
          updates.push({ available: source, installed: current, isNew: false });
        }
      }

      this.notifier.emit({
        type: "updates-available",
        repoId: entry.name,
        count: updates.length,
      });
      return updates;
    } catch (err) {
      this.notifier.emit({ type: "update-error", message: messageOf(err) });
      throw err;
    }
  }

  /**
   * Installiert ein komplettes Repository: lädt dessen Index und installiert
   * ALLE enthaltenen Quellen (GameSystem + alle Kataloge). Meldet Fortschritt
   * über `onProgress(done, total)`; emittiert am Ende ein `updates-applied`.
   */
  async installRepo(
    entry: GalleryEntry,
    onProgress?: (done: number, total: number) => void
  ): Promise<InstalledSource[]> {
    try {
      const index = await this.repo.fetchRepoIndex(entry);
      const sources = this.repo.toAvailableSources(entry, index);
      const results: InstalledSource[] = [];
      onProgress?.(0, sources.length);
      for (const source of sources) {
        const { xml } = await this.repo.downloadFile(source.fileUrl);
        results.push(await this.store.save(source, xml));
        onProgress?.(results.length, sources.length);
      }
      this.notifier.emit({
        type: "updates-applied",
        repoId: entry.name,
        count: results.length,
      });
      return results;
    } catch (err) {
      this.notifier.emit({ type: "update-error", message: messageOf(err) });
      throw err;
    }
  }

  /**
   * Installiert ein GitHub-Repo im neuen BSData-JSON-Format (z. B. wh40k-11e).
   * Listet die JSON-Dateien via Contents-API, lädt/transformiert jede und
   * persistiert sie als kanonisches XML. Typ/Name/Revision werden aus der
   * jeweiligen Datei (`downloadFile().meta`) korrigiert, da der API-Listing das
   * nicht liefert.
   */
  async installGithubRepo(
    owner: string,
    repo: string,
    onProgress?: (done: number, total: number) => void,
    branch = "main"
  ): Promise<InstalledSource[]> {
    const repoId = `${owner}/${repo}`;
    try {
      const sources = await this.repo.fetchGithubRepoSources(owner, repo, branch);
      const results: InstalledSource[] = [];
      onProgress?.(0, sources.length);
      for (const source of sources) {
        const { xml, meta } = await this.repo.downloadFile(source.fileUrl);
        const corrected: AvailableSource = meta
          ? { ...source, type: meta.type, name: meta.name, revision: meta.revision }
          : source;
        results.push(await this.store.save(corrected, xml));
        onProgress?.(results.length, sources.length);
      }
      this.notifier.emit({
        type: "updates-applied",
        repoId,
        count: results.length,
      });
      return results;
    } catch (err) {
      this.notifier.emit({ type: "update-error", message: messageOf(err) });
      throw err;
    }
  }

  /** Lädt eine einzelne Quelle herunter und installiert sie. */
  async install(source: AvailableSource): Promise<InstalledSource> {
    try {
      const { xml } = await this.repo.downloadFile(source.fileUrl);
      const entry = await this.store.save(source, xml);
      this.notifier.emit({
        type: "updates-applied",
        repoId: source.repoId,
        count: 1,
      });
      return entry;
    } catch (err) {
      this.notifier.emit({ type: "update-error", message: messageOf(err) });
      throw err;
    }
  }

  /**
   * Wendet mehrere Updates an (Batch). Emittiert ein einziges
   * `updates-applied` mit der Gesamtzahl; bei Fehler ein `update-error`.
   */
  async applyUpdates(updates: UpdateInfo[]): Promise<InstalledSource[]> {
    const results: InstalledSource[] = [];
    try {
      for (const update of updates) {
        const { xml } = await this.repo.downloadFile(update.available.fileUrl);
        results.push(await this.store.save(update.available, xml));
      }
      const repoId = updates[0]?.available.repoId ?? "";
      this.notifier.emit({
        type: "updates-applied",
        repoId,
        count: results.length,
      });
      return results;
    } catch (err) {
      this.notifier.emit({ type: "update-error", message: messageOf(err) });
      throw err;
    }
  }
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
