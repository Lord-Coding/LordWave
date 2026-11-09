export function encodeCollectionKey(value: string) {
  return Array.from(value, (character) => character.codePointAt(0)?.toString(16) ?? "").join("-");
}

export function decodeCollectionKey(value: string) {
  if (!value) return "";
  const codePoints = value.split("-").map((part) => Number.parseInt(part, 16));
  if (codePoints.some((codePoint) => !Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff)) {
    console.warn("Identifiant de collection invalide.");
    return "";
  }
  return String.fromCodePoint(...codePoints);
}

export function albumCollectionId(album: string, artist: string) {
  return `album:${encodeCollectionKey(album)}:${encodeCollectionKey(artist)}`;
}

export function artistCollectionId(artist: string) {
  return `artist:${encodeCollectionKey(artist)}`;
}

export function folderCollectionId(path: string) {
  return `folder:${encodeCollectionKey(path)}`;
}
