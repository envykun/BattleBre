# BattleBreEngine (`src/data/battlebre-engine/`)

Framework-agnostischer, **on-device** List-Builder-Service. Er baut aus
BSData-Katalogen (`.cat`/`.gst`) Warhammer-Listen inkl. Validierung und
exportiert das App-Rendermodell `src/data/models/roster` (`Roster`).

Der Kern ist **rein** – keine `react`/`react-native`/`expo`-Importe; sämtliche
Plattform-I/O läuft über injizierbare Adapter (`adapters/`).

## Integration in die App

- **Konsumiert** das Katalog-Rohschema aus `src/data/models/bsdata`
  (`BSDataRaw*`) – keine Duplizierung des Schemas.
- **Erzeugt** über `toRoster()` eine `Roster`-Instanz aus `src/data/models/roster`
  – dieselbe Klasse, die `parseRoster()` aus einer `.ros`-Datei liefert. Damit
  lässt sich eine gebaute Liste ohne UI-Änderung über den `RosterContext` und die
  vorhandenen Hooks (`useRosterUnits`, `useRosterUnitDetails`) anzeigen.

## Öffentliche API

Import ausschließlich über das Barrel `src/data/battlebre-engine/index.ts`:

```ts
import { BattleBreEngine } from "@/src/data/battlebre-engine";

const engine = BattleBreEngine.fromXml(gameSystemXml, [catalogueXml]);
engine.createRoster({ name: "Meine Liste" });
engine.setCostLimit("<pointsCostTypeId>", 2000);

const [force] = engine.listForceEntries();
const forceId = engine.addForce(force.forceEntryId, force.catalogueId);

const options = engine.getAddableEntries(forceId); // speist das UI-Menü
const { instanceId, report } = engine.addSelection(forceId, options[0].id);

engine.getState();     // Read-Model für die UI
engine.validate();     // { errors, warnings }

const roster = engine.toRoster(); // Roster (src/data/models/roster) → RosterContext
```

## Modul-Layout

| Ordner        | Zweck                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| `battlebre-engine.ts` | Öffentliche Fassade `BattleBreEngine` (Laden, Bau, Validierung, Export) |
| `types/`      | Engine-Aliase auf `bsdata`-Rohtypen (`catalogue.ts`), Ids, Enums         |
| `adapters/`   | Interfaces + Default-Impls: FileSystem, Http, Zip, Clock, IdGen, Events  |
| `data/`       | fast-xml-parser-Config (`xml.ts`), Katalog-Laden, Unzip                  |
| `engine/`     | GameContext, LinkResolver, EntryTree, Instanzen, Kosten, Recompute, Constraints/Conditions/Modifiers |
| `builder/`    | `ArmyBuilder` (interne Bau-Engine) + API-Typen                            |
| `serialize/`  | `toRosterModel` (Export in `src/data/models/roster`)                      |
| `models/`, `plugins/` | Vorbestehendes vereinfachtes Analyse-Modell (`common.ts`) + Plugin-Semantik |
| `acquisition/`| (Phase 4) Repository-Index, Cache, Versionsvergleich, Update-Events       |

## Umsetzungs-Status

- **Phase 0/1 – fertig & getestet** (`__tests__/builder.test.ts`): Katalog laden,
  Force/Einheiten/Gruppen/Modelle/Upgrades hinzufügen, Kosten-Aufrollung,
  Kostenlimit, Gruppen- & Entry-Constraints (min/max), Export ins `Roster`-Modell.
- **Phase 2 – größtenteils vorhanden**: Conditions/ConditionGroups, Modifier
  (Kosten/Constraint-Wert/Kategorie/Name) inkl. `repeat` und Fixpunkt-Settle.
  Offen: Kategorie-/Entry-Scopes in der Scoped-Query, `shared`-Feinheiten.
- **Phase 3 (.rosz-Export)** und **Phase 4 (Datenbezug/Updates)**: noch offen
  (Struktur/Adapter vorbereitet).

## Tests

Eigenständige Node-Umgebung (bewusst ohne `jest-expo`, um die Framework-Freiheit
zu erzwingen):

```
npx jest --config src/data/battlebre-engine/jest.config.js
```

## Bekannte, gegen echte Daten zu verifizierende Punkte

- Vollständige `scope`-Wertemenge (Kategorie-/Entry-/`ancestor`-Scopes)
- `shared`-Semantik in Conditions/Constraints
- Präzedenz bei `entryLink`-Overlays (Link vs. Ziel, gleiche Constraint-Id)
- Wurzel-Einträge realer Kataloge kommen über `entryLinks` → `sharedSelectionEntries`
  (die Fixtures nutzen zusätzlich vereinfachte Top-Level-`selectionEntries`)
- Aktuelles bsdata.net-/GitHub-Release-Indexformat (`.bsi` vs. catpkg-JSON)
```
