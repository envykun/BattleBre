/**
 * Öffentliche API des List-Builder-Service (BattleBreEngine).
 * Die App importiert ausschließlich über diese Datei – nie direkt aus engine/**.
 */

// Engine-Fassade (primärer Einstiegspunkt)
export { BattleBreEngine } from "./battlebre-engine";
export type { BattleBreEngineOptions } from "./battlebre-engine";

// Builder (fortgeschrittene/direkte Nutzung)
export { ArmyBuilder } from "./builder/ArmyBuilder";
export type { ArmyBuilderDeps } from "./builder/ArmyBuilder";
export type {
  AddableEntry,
  AddableForce,
  AddResult,
  ForceView,
  RosterView,
  SelectionView,
  ValidationMessage,
  ValidationReport,
} from "./builder/types";

// Kontext / Laden
export { GameContext } from "./engine/GameContext";
export { CatalogueLoader } from "./data/CatalogueLoader";
export type { LoadedData } from "./data/CatalogueLoader";
export { parseDataObject } from "./data/xml";

// Serialisierung (Export in das App-Rendermodell src/data/models/roster)
export { toRosterModel } from "./serialize/toRosterModel";

// Adapter (Interfaces + Default-Implementierungen)
export type { FileSystemAdapter } from "./adapters/FileSystem";
export type { HttpAdapter } from "./adapters/Http";
export { FetchHttpAdapter } from "./adapters/Http";
export type { ZipAdapter } from "./adapters/Zip";
export { JsZipAdapter } from "./adapters/Zip";
export type { IdGenerator } from "./adapters/IdGenerator";
export { createCounterIdGenerator } from "./adapters/IdGenerator";
export { createUpdateNotifier } from "./adapters/events";
export type { UpdateEvent, UpdateListener, UpdateNotifier } from "./adapters/events";

// Roh-Typen (für fortgeschrittene Nutzung)
export type { RawCatalogue, RawGameSystem } from "./types/catalogue";

// Datenbeschaffung / Updates (Phase 4)
export { DataRepository, DEFAULT_GALLERY_URL } from "./acquisition/DataRepository";
export type { DownloadedFile } from "./acquisition/DataRepository";
export { LocalStore } from "./acquisition/LocalStore";
export { UpdateManager } from "./acquisition/UpdateManager";
export type {
  AvailableSource,
  GalleryEntry,
  GalleryIndex,
  InstalledSource,
  RepoFile,
  RepoFileType,
  RepoIndex,
  UpdateInfo,
} from "./acquisition/types";
