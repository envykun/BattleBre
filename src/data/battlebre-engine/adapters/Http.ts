/**
 * HTTP-Adapter für den Datenbezug (Repository-Index, Downloads).
 * Standardmäßig kann `fetch` verwendet werden; als Adapter gehalten, damit
 * Tests deterministisch bleiben.
 */
export interface HttpAdapter {
  /** GET → Text (z. B. JSON-Index). */
  getText(url: string): Promise<string>;
  /** GET → Binärdaten als base64 (z. B. .catz/.gstz). */
  getBase64(url: string): Promise<string>;
}

/** Default-Implementierung auf Basis der globalen `fetch`-API. */
export class FetchHttpAdapter implements HttpAdapter {
  async getText(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
    return res.text();
  }

  async getBase64(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
    const buf = await res.arrayBuffer();
    return arrayBufferToBase64(buf);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk))
    );
  }
  // btoa ist in RN (Hermes) und modernen Browsern verfügbar.
  return typeof btoa === "function"
    ? btoa(binary)
    : Buffer.from(binary, "binary").toString("base64");
}
