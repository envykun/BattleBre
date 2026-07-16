import { beforeEach, describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { JsZipAdapter } from "../adapters/Zip";
import { CatalogueLoader } from "../data/CatalogueLoader";
import { DataRepository } from "../acquisition/DataRepository";
import { LocalStore } from "../acquisition/LocalStore";
import { UpdateManager } from "../acquisition/UpdateManager";
import type { GalleryEntry } from "../acquisition/types";
import type { HttpAdapter } from "../adapters/Http";
import type { FileSystemAdapter } from "../adapters/FileSystem";
import type { UpdateEvent } from "../adapters/events";

const fixtures = path.join(__dirname, "fixtures");
const galleryJson = fs.readFileSync(path.join(fixtures, "gallery.catpkg.json"), "utf8");
const repoJson = fs.readFileSync(path.join(fixtures, "repo.catpkg.json"), "utf8");
const gstXml = fs.readFileSync(path.join(fixtures, "mini.gst"), "utf8");
const catXml = fs.readFileSync(path.join(fixtures, "mini.cat"), "utf8");

// --- In-Memory-Fakes ---------------------------------------------------------

/** Http-Fake: bedient Text-URLs aus einer Map, Binär-URLs aus einer base64-Map. */
class FakeHttp implements HttpAdapter {
  constructor(
    private readonly texts: Record<string, string>,
    private readonly blobs: Record<string, string> = {}
  ) {}
  async getText(url: string): Promise<string> {
    if (!(url in this.texts)) throw new Error(`404 ${url}`);
    return this.texts[url];
  }
  async getBase64(url: string): Promise<string> {
    if (!(url in this.blobs)) throw new Error(`404 ${url}`);
    return this.blobs[url];
  }
}

/** FS-Fake: Map von Pfad → Inhalt. */
class MemoryFs implements FileSystemAdapter {
  readonly baseDir = "/mem";
  private files = new Map<string, string>();
  async readText(p: string): Promise<string> {
    const v = this.files.get(p);
    if (v === undefined) throw new Error(`ENOENT ${p}`);
    return v;
  }
  async readBase64(p: string): Promise<string> {
    return Buffer.from(await this.readText(p), "utf8").toString("base64");
  }
  async writeText(p: string, content: string): Promise<void> {
    this.files.set(p, content);
  }
  async exists(p: string): Promise<boolean> {
    return this.files.has(p);
  }
  async list(dir: string): Promise<string[]> {
    const prefix = dir.endsWith("/") ? dir : dir + "/";
    return [...this.files.keys()]
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.slice(prefix.length));
  }
}

const ENTRY: GalleryEntry = {
  name: "mini-system",
  repositoryUrl: "https://example.test/mini-system/mini-system.catpkg.json",
};

const GST_URL = "https://example.test/mini-system/Mini.Game.System.gstz";
const CAT_URL = "https://example.test/mini-system/Mini.Catalogue.catz";

/** Baut ein vollständig verdrahtetes Set aus Repo/Store/Manager + FS-Fake. */
async function harness() {
  const zip = new JsZipAdapter();
  const loader = new CatalogueLoader(zip);
  // Fixtures gezippt bereitstellen (echtes .gstz/.catz-Verhalten).
  const gstz = await zip.zipSingle("Mini Game System.gst", gstXml);
  const catz = await zip.zipSingle("Mini Catalogue.cat", catXml);

  const http = new FakeHttp(
    {
      [ENTRY.repositoryUrl]: repoJson,
      "gallery": galleryJson,
    },
    { [GST_URL]: gstz, [CAT_URL]: catz }
  );
  const repo = new DataRepository(http, loader);
  const fsAdapter = new MemoryFs();
  const store = new LocalStore(fsAdapter, { now: () => 1_700_000_000_000 });
  const events: UpdateEvent[] = [];
  const manager = new UpdateManager(repo, store);
  manager.subscribe((e) => events.push(e));
  return { repo, store, manager, events, http };
}

describe("DataRepository", () => {
  test("Gallery-Index parsen", async () => {
    const { http } = await harness();
    const repo = new DataRepository(http, new CatalogueLoader(new JsZipAdapter()));
    const gallery = await repo.fetchGallery("gallery");
    expect(gallery.repositories).toHaveLength(1);
    expect(gallery.repositories[0].name).toBe("mini-system");
  });

  test("Repo-Index → AvailableSources", async () => {
    const { repo } = await harness();
    const index = await repo.fetchRepoIndex(ENTRY);
    const sources = repo.toAvailableSources(ENTRY, index);
    expect(sources.map((s) => s.name).sort()).toEqual([
      "Mini Catalogue",
      "Mini Game System",
    ]);
    const gs = sources.find((s) => s.type === "gamesystem")!;
    expect(gs.repoId).toBe("mini-system");
    expect(gs.revision).toBe(3);
  });

  test("Zip-Datei herunterladen und entpacken", async () => {
    const { repo } = await harness();
    const { loaded, xml } = await repo.downloadFile(GST_URL);
    expect(loaded.kind).toBe("gameSystem");
    expect(xml).toContain("<gameSystem");
  });
});

describe("UpdateManager + LocalStore", () => {
  let h: Awaited<ReturnType<typeof harness>>;
  beforeEach(async () => {
    h = await harness();
  });

  test("checkForUpdates: alles neu bei leerem Store", async () => {
    const updates = await h.manager.checkForUpdates(ENTRY);
    expect(updates).toHaveLength(2);
    expect(updates.every((u) => u.isNew)).toBe(true);
    expect(h.events).toContainEqual({
      type: "updates-available",
      repoId: "mini-system",
      count: 2,
    });
  });

  test("install: schreibt Datei + Manifest + Event", async () => {
    const [update] = await h.manager.checkForUpdates(ENTRY);
    const installed = await h.manager.install(update.available);
    expect(installed.installedAt).toBe(1_700_000_000_000);

    const list = await h.store.listInstalled();
    expect(list).toHaveLength(1);
    const xml = await h.store.readXml(installed.id);
    expect(xml.length).toBeGreaterThan(0);
    expect(h.events).toContainEqual({
      type: "updates-applied",
      repoId: "mini-system",
      count: 1,
    });
  });

  test("checkForUpdates: nur echte Revisions-Steigerungen", async () => {
    const index = await h.repo.fetchRepoIndex(ENTRY);
    const sources = h.repo.toAvailableSources(ENTRY, index);
    // Beide auf aktueller Revision installieren.
    for (const s of sources) await h.store.save(s, "<dummy/>");

    let updates = await h.manager.checkForUpdates(ENTRY);
    expect(updates).toHaveLength(0);

    // Eine ältere Revision installieren → sollte als Update erscheinen.
    const gs = sources.find((s) => s.type === "gamesystem")!;
    await h.store.save({ ...gs, revision: 1 }, "<dummy/>");
    updates = await h.manager.checkForUpdates(ENTRY);
    expect(updates).toHaveLength(1);
    expect(updates[0].isNew).toBe(false);
    expect(updates[0].installed!.revision).toBe(1);
  });

  test("applyUpdates: Batch installiert alle und meldet Gesamtzahl", async () => {
    const updates = await h.manager.checkForUpdates(ENTRY);
    const installed = await h.manager.applyUpdates(updates);
    expect(installed).toHaveLength(2);
    expect(await h.store.listInstalled()).toHaveLength(2);
    expect(h.events).toContainEqual({
      type: "updates-applied",
      repoId: "mini-system",
      count: 2,
    });
  });

  test("Fehler beim Download → update-error Event", async () => {
    const badSource = {
      id: "x",
      repoId: "mini-system",
      name: "Broken",
      type: "catalogue" as const,
      revision: 1,
      fileUrl: "https://example.test/missing.catz",
    };
    await expect(h.manager.install(badSource)).rejects.toThrow();
    expect(h.events.some((e) => e.type === "update-error")).toBe(true);
  });
});
