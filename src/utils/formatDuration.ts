/**
 * Formate une durée en secondes vers le format m:ss (ex: 63 → "1:03").
 * Retourne une chaîne vide si la valeur est undefined.
 */
export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
