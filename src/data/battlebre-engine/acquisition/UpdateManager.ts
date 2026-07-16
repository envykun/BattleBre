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
