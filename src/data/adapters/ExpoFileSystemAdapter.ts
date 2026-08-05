/**
 * Expo-Implementierung des engine-seitigen `FileSystemAdapter`.
 *
 * Bewusst AUSSERHALB von `src/data/battlebre-engine/` platziert: der Engine-Kern
 * bleibt framework-frei (kein expo-Import). Diese Klasse verdrahtet den reinen
 * Adapter-Vertrag mit `expo-file-system` (SDK-54+ API: `FileSystem.File` /
 * `FileSystem.Paths.document`), analog zu `src/hooks/useFetchRosters.ts`.
 *
 * Konvention: übergebene Pfade sind RELATIV zum Dokument-Verzeichnis. `baseDir`
 * ist daher leer – der `LocalStore` baut Pfade wie "catalogues/<id>.cat", die
 * hier gegen `FileSystem.Paths.document` aufgelöst werden.
 */
import * as FileSystem from "expo-file-system";
import type { FileSystemAdapter } from "../battlebre-engine";

export class ExpoFileSystemAdapter implements FileSystemAdapter {
  /** Leer: Pfade werden relativ zu Paths.document interpretiert. */
  readonly baseDir = "";

  private file(path: string): FileSystem.File {
    return new FileSystem.File(FileSystem.Paths.document, path);
  }

  async readText(path: string): Promise<string> {
    return this.file(path).text();
  }

  async readBase64(path: string): Promise<string> {
    return this.file(path).base64();
  }

  async writeText(path: string, content: string): Promise<void> {
    const f = this.file(path);
    if (!f.exists) {
      // intermediates: legt fehlende Elternverzeichnisse an.
      f.create({ intermediates: true });
    }
    f.write(content);
  }

  async exists(path: string): Promise<boolean> {
    return this.file(path).exists;
  }

  async delete(path: string): Promise<void> {
    const f = this.file(path);
    if (f.exists) f.delete();
  }

  async list(dir: string): Promise<string[]> {
    const directory = new FileSystem.Directory(FileSystem.Paths.document, dir);
    if (!directory.exists) return [];
    return directory.list().map((entry) => entry.name);
  }
}
