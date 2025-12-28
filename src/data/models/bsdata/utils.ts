import type { MaybeArray, RawText } from "./types";

export const toArray = <T>(value?: MaybeArray<T>): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

export const readText = (value?: RawText): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "#text" in value) {
    const text = value["#text"];
    return typeof text === "string" ? text : undefined;
  }
  return undefined;
};

export const readBoolean = (value?: string): boolean => value === "true";

export const readNumber = (value?: string): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};
