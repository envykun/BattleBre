/**
 * useCatalogueData – App-Hook für die Datenbeschaffung (Phase 4).
 *
 * Verdrahtet den Expo-Dateisystem-Adapter mit den Default-Adaptern (Fetch, Zip)
 * und dem acquisition-Kern (DataRepository / LocalStore / UpdateManager) und
 * exponiert app-freundlichen State. Spiegelt das Muster von `useFetchRosters`.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExpoFileSystemAdapter } from "../data/adapters/ExpoFileSystemAdapter";
import {
  AvailableSource,
  CatalogueLoader,
  DataRepository,
  FetchHttpAdapter,
  GalleryEntry,
  InstalledSource,
  JsZipAdapter,
  LocalStore,
  UpdateInfo,
  UpdateManager,
} from "../data/battlebre-engine";

/** Fortschritt eines laufenden Repo-Downloads. */
export type InstallProgress = { done: number; total: number } | null;

export type UseCatalogueDataResult = {
  installed: InstalledSource[];
  gallery: GalleryEntry[];
  updates: UpdateInfo[];
  loading: boolean;
  busy: boolean;
  error: string | null;
  /** Fortschritt eines laufenden "ganzes Repo installieren"-Vorgangs. */
  progress: InstallProgress;
  refreshGallery: () => Promise<void>;
  checkForUpdates: (entry: GalleryEntry) => Promise<void>;
  install: (source: AvailableSource) => Promise<void>;
  applyUpdates: (updates: UpdateInfo[]) => Promise<void>;
  /** Lädt ein komplettes Repo (GameSystem + alle Kataloge). */
  installRepo: (entry: GalleryEntry) => Promise<void>;
  /** Lädt ein GitHub-Repo im BSData-JSON-Format (z. B. "BSData/wh40k-11e"). */
  installGithubRepo: (owner: string, repo: string) => Promise<void>;
  /** Entfernt eine installierte Quelle (Datei + Manifest-Eintrag). */
  uninstall: (id: string) => Promise<void>;
  reloadInstalled: () => Promise<void>;
  /** Liest die rohe XML-Datei einer installierten Quelle (per Id). */
  readInstalledXml: (id: string) => Promise<string>;
};

export function useCatalogueData(): UseCatalogueDataResult {
  // Adapter/Services einmalig aufbauen (kein State, keine Re-Renders).
  const { store, repo, manager } = useMemo(() => {
    const zip = new JsZipAdapter();
    const loader = new CatalogueLoader(zip);
    const repo = new DataRepository(new FetchHttpAdapter(), loader);
    const store = new LocalStore(new ExpoFileSystemAdapter());
    const manager = new UpdateManager(repo, store);
    return { store, repo, manager };
  }, []);

  const [installed, setInstalled] = useState<InstalledSource[]>([]);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [updates, setUpdates] = useState<UpdateInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<InstallProgress>(null);

  const reloadInstalled = useCallback(async () => {
    setInstalled(await store.listInstalled());
  }, [store]);

  const readInstalledXml = useCallback(
    (id: string) => store.readXml(id),
    [store]
  );

  const uninstall = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await store.remove(id);
        await reloadInstalled();
      } catch (err) {
        setError(messageOf(err));
      }
    },
    [store, reloadInstalled]
  );

  useEffect(() => {
    (async () => {
      try {
        await reloadInstalled();
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadInstalled]);

  const refreshGallery = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const index = await repo.fetchGallery();
      setGallery(index.repositories);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  }, [repo]);

  const checkForUpdates = useCallback(
    async (entry: GalleryEntry) => {
      setBusy(true);
      setError(null);
      try {
        setUpdates(await manager.checkForUpdates(entry));
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [manager]
  );

  const install = useCallback(
    async (source: AvailableSource) => {
      setBusy(true);
      setError(null);
      try {
        await manager.install(source);
        await reloadInstalled();
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [manager, reloadInstalled]
  );

  const installRepo = useCallback(
    async (entry: GalleryEntry) => {
      setBusy(true);
      setError(null);
      setProgress({ done: 0, total: 0 });
      try {
        await manager.installRepo(entry, (done, total) =>
          setProgress({ done, total })
        );
        await reloadInstalled();
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [manager, reloadInstalled]
  );

  const installGithubRepo = useCallback(
    async (owner: string, repo: string) => {
      setBusy(true);
      setError(null);
      setProgress({ done: 0, total: 0 });
      try {
        await manager.installGithubRepo(owner, repo, (done, total) =>
          setProgress({ done, total })
        );
        await reloadInstalled();
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [manager, reloadInstalled]
  );

  const applyUpdates = useCallback(
    async (toApply: UpdateInfo[]) => {
      setBusy(true);
      setError(null);
      try {
        await manager.applyUpdates(toApply);
        await reloadInstalled();
        setUpdates([]);
      } catch (err) {
        setError(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [manager, reloadInstalled]
  );

  return {
    installed,
    gallery,
    updates,
    loading,
    busy,
    error,
    progress,
    refreshGallery,
    checkForUpdates,
    install,
    applyUpdates,
    installRepo,
    installGithubRepo,
    uninstall,
    reloadInstalled,
    readInstalledXml,
  };
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Unbekannter Fehler.";
}
