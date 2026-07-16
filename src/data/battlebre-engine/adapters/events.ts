/**
 * Event-Kontrakt für den Datenbezug. Der Kern zeigt nie UI – er emittiert nur
 * Events; die RN-Schicht abonniert sie und zeigt z. B. das Update-Modal.
 * (Voll genutzt ab Phase 4.)
 */
export type UpdateEvent =
  | { type: "updates-available"; repoId: string; count: number }
  | { type: "updates-applied"; repoId: string; count: number }
  | { type: "update-error"; message: string };

export type UpdateListener = (event: UpdateEvent) => void;

export interface UpdateNotifier {
  emit(event: UpdateEvent): void;
  subscribe(listener: UpdateListener): () => void;
}

export function createUpdateNotifier(): UpdateNotifier {
  const listeners = new Set<UpdateListener>();
  return {
    emit(event) {
      listeners.forEach((l) => l(event));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
