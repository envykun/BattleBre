/**
 * Id-Generator für Laufzeit-Instanzen. Bewusst KEIN `uuid` (bräuchte in RN das
 * Polyfill `react-native-get-random-values`). Default ist ein Counter+Timestamp-
 * Generator; die App kann bei Bedarf eine kryptographische Variante injizieren.
 */
export interface IdGenerator {
  next(prefix?: string): string;
}

export function createCounterIdGenerator(): IdGenerator {
  let counter = 0;
  const session = Date.now().toString(36);
  return {
    next(prefix = "id") {
      counter += 1;
      return `${prefix}-${session}-${counter.toString(36)}`;
    },
  };
}
