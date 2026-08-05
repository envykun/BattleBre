/**
 * Dateisystem-Adapter. Der Kern kennt kein expo-file-system; die App reicht
 * eine Implementierung herein, Tests eine In-Memory-Variante.
 */
export interface FileSystemAdapter {
  /** Liest eine Textdatei (UTF-8). Wirft, wenn nicht vorhanden. */
  readText(path: string): Promise<string>;
  /** Liest eine Binärdatei als base64. */
  readBase64(path: string): Promise<string>;
  /** Schreibt eine Textdatei (UTF-8), legt Verzeichnisse bei Bedarf an. */
  writeText(path: string, content: string): Promise<void>;
  /** Prüft, ob ein Pfad existiert. */
  exists(path: string): Promise<boolean>;
  /** Löscht eine Datei. Kein Fehler, wenn sie nicht existiert. */
  delete(path: string): Promise<void>;
  /** Listet die Einträge (Dateinamen) eines Verzeichnisses. */
  list(dir: string): Promise<string[]>;
  /** Basisverzeichnis für persistente Daten (z. B. documentDirectory). */
  readonly baseDir: string;
}
